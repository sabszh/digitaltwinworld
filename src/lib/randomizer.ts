import { dilemmaTemplates } from "@/data/dilemmaTemplates";
import { exactPlaces } from "@/data/exactPlaces";
import { locations } from "@/data/locations";
import { problemAreas } from "@/data/taxonomies";
import { getAudienceProfile, tailorDilemmaCopyForAudience } from "@/lib/audience";
import type { CompletedDilemma, GeneratedDilemma, LocationType, ProblemArea, UserRole } from "@/types/world2046";

const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

const weatherSnippets = [
  "Regnen hænger i luften.",
  "Solen står lavt og varmer stille.",
  "Vinden bærer en anelse af havsalt.",
  "Himlen er grå og stilfærdig.",
  "Varmen ligger tæt over asfalten.",
  "Det er tidlig morgen, og lyset er blidt.",
];

const storyDetailsByAudience = {
  school: [
    "En gruppe elever står med deres tablets i hånden, mens læreren beder alle forklare valget med egne ord.",
    "Nogle børn synes teknologien er sjov, andre bliver stille, fordi systemet allerede har gættet deres næste svar.",
    "I klassens workshop skal I prøve løsningen selv, før I beslutter, hvor meget den må fylde i skoledagen.",
  ],
  professional: [
    "På skærmen ses både borgernes ventetid, medarbejdernes arbejdspres og de regler, systemet forsøger at balancere.",
    "En projektleder, en frontmedarbejder og en borgerrepræsentant læser samme anbefaling, men ser tre forskellige risici.",
    "Løsningen er klar til drift, men ansvaret for fejl, forklaringer og fravalg er endnu ikke placeret.",
  ],
  public: [
    "Folk stopper op, prøver løsningen og begynder hurtigt at diskutere, om den føles hjælpsom, sjov eller lidt for nærgående.",
    "Børn peger, voksne tester, og teknologien virker først enkel, indtil man opdager hvad den lærer om hverdagen.",
    "Det ligner næsten en leg, men valget afgør, hvem der får mere frihed, og hvem der skal stole på systemet.",
  ],
} as const;

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
  const audience = getAudienceProfile(input.role);
  const previous = input.previousDilemmas;
  const last = previous.at(-1);
  const isFirst = previous.length === 0;
  const usedIds = new Set(previous.map((item) => item.dilemmaId));
  const usedExactPlaces = new Set(previous.map((item) => item.exactPlaceName).filter(Boolean));
  const usedCountries = new Set(previous.map((item) => item.country));

  const preferredAreas = audience.preferredProblemAreas.filter((area) => area !== last?.problemArea);
  const allowedAreas = (preferredAreas.length ? preferredAreas : problemAreas).filter((area) => area !== last?.problemArea);
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
    (template) =>
      template.problemArea === area &&
      template.severity === input.preferredSeverity &&
      !usedIds.has(template.id) &&
      template.targetGroups.some((group) => audience.targetGroups.includes(group)),
  );
  const template = pick(
    templateCandidates.length
      ? templateCandidates
      : dilemmaTemplates.filter((item) => item.problemArea === area && !usedIds.has(item.id)),
  );
  const preferredValidLocationTypes = template.validLocationTypes.filter((type) => audience.preferredLocationTypes.includes(type));
  const validLocationTypes = preferredValidLocationTypes.length ? preferredValidLocationTypes : template.validLocationTypes;
  const exactPlaceCandidates = exactPlaces.filter(
    (place) =>
      matchesAnyLocationType(place.locationType, validLocationTypes) &&
      place.problemAreas.includes(area) &&
      place.country !== last?.country &&
      !usedExactPlaces.has(place.name) &&
      (isFirst ? place.country === "Danmark" : place.country !== "Danmark" && !usedCountries.has(place.country)),
  );
  const exactPlace = exactPlaceCandidates.length ? pick(exactPlaceCandidates) : undefined;
  const type: LocationType = exactPlace?.locationType ?? pick(validLocationTypes);
  const locationCandidates = locations.filter(
    (location) =>
      location.validProblemAreas.includes(area) &&
      location.validLocationTypes.includes(type) &&
      location.country !== last?.country &&
      (isFirst ? location.country === "Danmark" : location.country !== "Danmark" && !usedCountries.has(location.country)),
  );
  const relaxedLocationCandidates = locations.filter(
    (location) =>
      location.validProblemAreas.includes(area) &&
      location.validLocationTypes.includes(type) &&
      location.country !== last?.country &&
      (!isFirst || location.country === "Danmark"),
  );
  const location =
    (exactPlace && locations.find((item) => item.country === exactPlace.country && item.city === exactPlace.city)) ??
    (isFirst
      ? locations.find((item) => item.country === "Danmark" && item.city === "Aarhus") ?? pick(locationCandidates)
      : pick(locationCandidates.length ? locationCandidates : relaxedLocationCandidates));
  const technology = pick(template.technologies);
  const values = {
    role: input.role,
    city: location.city,
    country: location.country,
    locationType: type,
    technology,
  };
  const place = exactPlace?.name ?? location.city;
  const weather = pick(weatherSnippets);
  const storyDetail = pick(storyDetailsByAudience[audience.id]);

  return tailorDilemmaCopyForAudience({
    ...template,
    targetGroups: [...new Set([...template.targetGroups, ...audience.targetGroups])],
    scenePrompt: `${interpolate(template.scenePrompt, values)} ${storyDetail}`,
    question: interpolate(template.question, values),
    country: exactPlace?.country ?? location.country,
    city: exactPlace?.city ?? location.city,
    region: exactPlace?.region ?? location.region,
    locationType: type,
    technology,
    role: input.role,
    marker: { lat: exactPlace?.lat ?? location.lat, lng: exactPlace?.lng ?? location.lng },
    exactPlace,
    landingScene: `I ${place} indgår ${technology} i hverdagen i 2046. ${weather}`,
    landingDetail: weather,
  });
}
