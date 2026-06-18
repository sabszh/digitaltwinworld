import { dilemmaTemplates } from "@/data/dilemmaTemplates";
import { exactPlaces } from "@/data/exactPlaces";
import { locations } from "@/data/locations";
import { problemAreas } from "@/data/taxonomies";
import type { CompletedDilemma, GeneratedDilemma, LocationType, ProblemArea, UserRole } from "@/types/world2046";

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const compatibleLocationTypes: Partial<Record<LocationType, LocationType[]>> = {
  kommune: ["kommune", "rådhus", "digital borgerservice"],
  rådhus: ["rådhus", "kommune", "digital borgerservice"],
  "digital borgerservice": ["digital borgerservice", "rådhus", "kommune"],
  bymidte: ["bymidte", "rådhus", "togstation", "supermarked"],
  vej: ["vej", "bymidte", "togstation"],
};

function matchesAnyLocationType(placeType: LocationType, validTypes: LocationType[]) {
  return validTypes.some((type) => (compatibleLocationTypes[type] ?? [type]).includes(placeType));
}

function interpolate(text: string, values: Record<string, string>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), text);
}

export function generateDilemma(input: {
  role: UserRole;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
}): GeneratedDilemma {
  const previous = input.previousDilemmas;
  const last = previous.at(-1);
  const isFirst = previous.length === 0;
  const usedIds = new Set(previous.map((item) => item.dilemmaId));
  const usedExactPlaces = new Set(previous.map((item) => item.exactPlaceName).filter(Boolean));

  const allowedAreas = problemAreas.filter((area) => area !== last?.problemArea);
  const underusedAreas = allowedAreas.filter((area) => previous.filter((item) => item.problemArea === area).length < 2);
  const danishPoiAreas = [
    ...new Set(
      exactPlaces
        .filter((place) => place.country === "Danmark")
        .flatMap((place) => place.problemAreas),
    ),
  ].filter((area) => allowedAreas.includes(area));
  const area: ProblemArea = isFirst ? pick(danishPoiAreas.length ? danishPoiAreas : ["Uddannelse og læring"]) : pick(underusedAreas.length ? underusedAreas : allowedAreas);

  const templateCandidates = dilemmaTemplates.filter(
    (template) => template.problemArea === area && template.severity === input.preferredSeverity && !usedIds.has(template.id),
  );
  const template = pick(templateCandidates.length ? templateCandidates : dilemmaTemplates.filter((item) => item.problemArea === area && !usedIds.has(item.id)));
  const exactPlaceCandidates = exactPlaces.filter(
    (place) =>
      matchesAnyLocationType(place.locationType, template.validLocationTypes) &&
      place.problemAreas.includes(area) &&
      place.country !== last?.country &&
      !usedExactPlaces.has(place.name) &&
      (!isFirst || place.country === "Danmark"),
  );
  const exactPlace = exactPlaceCandidates.length ? pick(exactPlaceCandidates) : undefined;
  const type: LocationType = exactPlace?.locationType ?? pick(template.validLocationTypes);
  const locationCandidates = locations.filter(
    (location) =>
      location.validProblemAreas.includes(area) &&
      location.validLocationTypes.includes(type) &&
      location.country !== last?.country &&
      (!isFirst || location.country === "Danmark"),
  );
  const location =
    (exactPlace && locations.find((item) => item.country === exactPlace.country && item.city === exactPlace.city)) ??
    (isFirst ? locations.find((item) => item.country === "Danmark" && item.city === "Aarhus") ?? pick(locationCandidates) : pick(locationCandidates));
  const technology = pick(template.technologies);
  const values = {
    role: input.role,
    city: location.city,
    country: location.country,
    locationType: type,
    technology,
  };

  return {
    ...template,
    scenePrompt: interpolate(template.scenePrompt, values),
    question: interpolate(template.question, values),
    country: exactPlace?.country ?? location.country,
    city: exactPlace?.city ?? location.city,
    region: exactPlace?.region ?? location.region,
    locationType: type,
    technology,
    role: input.role,
    marker: { lat: exactPlace?.lat ?? location.lat, lng: exactPlace?.lng ?? location.lng },
    exactPlace,
  };
}
