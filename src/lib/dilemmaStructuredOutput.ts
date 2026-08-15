import { dilemmaTemplates } from "@/data/dilemmaTemplates";
import { locationTypesByProblemArea, problemAreas } from "@/data/taxonomies";
import { tailorDilemmaCopyForAudience } from "@/lib/audience";
import type { AiDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { hasAudienceLanguageIssues } from "@/lib/languageQa";
import { valueKeys } from "@/lib/prompts/dilemmaPrompt";
import type {
  Choice,
  FutureTechnology,
  GeneratedDilemma,
  LocationType,
  ProblemArea,
  ValueProfile,
} from "@/types/world2046";

export const technologies = [...new Set(dilemmaTemplates.flatMap((template) => template.technologies))] as FutureTechnology[];
export const locationTypes = [...new Set(Object.values(locationTypesByProblemArea).flat())] as LocationType[];

export const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    problemArea: { type: "string", enum: problemAreas },
    validLocationTypes: { type: "array", items: { type: "string", enum: locationTypes }, minItems: 1 },
    targetGroups: { type: "array", items: { type: "string" }, minItems: 1 },
    technologies: { type: "array", items: { type: "string", enum: technologies }, minItems: 1 },
    severity: { type: "string", enum: ["low", "medium"] },
    title: { type: "string", maxLength: 54 },
    scenePrompt: { type: "string", maxLength: 360 },
    question: { type: "string", maxLength: 130 },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", enum: ["a", "b", "c", "d"] },
          label: { type: "string", maxLength: 46 },
          description: { type: "string", maxLength: 125 },
          consequence: { type: "string", maxLength: 190 },
          valueImpacts: {
            type: "object",
            additionalProperties: false,
            properties: Object.fromEntries(valueKeys.map((key) => [key, { type: "number", minimum: -2, maximum: 2 }])),
            required: valueKeys,
          },
        },
        required: ["id", "label", "description", "consequence", "valueImpacts"],
      },
    },
    tags: { type: "array", items: { type: "string" } },
    country: { type: "string" },
    city: { type: "string" },
    region: { type: "string" },
    locationType: { type: "string", enum: locationTypes },
    technology: { type: "string", enum: technologies },
    marker: {
      type: "object",
      additionalProperties: false,
      properties: {
        lat: { type: "number", minimum: -90, maximum: 90 },
        lng: { type: "number", minimum: -180, maximum: 180 },
      },
      required: ["lat", "lng"],
    },
    exactPlace: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        address: { type: "string" },
      },
      required: ["id", "name", "address"],
    },
    landingScene: { type: "string", maxLength: 320 },
    landingDetail: { type: "string", maxLength: 90 },
  },
  required: [
    "id",
    "problemArea",
    "validLocationTypes",
    "targetGroups",
    "technologies",
    "severity",
    "title",
    "scenePrompt",
    "question",
    "choices",
    "tags",
    "country",
    "city",
    "region",
    "locationType",
    "technology",
    "marker",
    "exactPlace",
    "landingScene",
    "landingDetail",
  ],
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export const isString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function isChoice(value: unknown): value is Choice {
  if (!isRecord(value) || !isString(value.id) || !isString(value.label) || !isString(value.consequence) || !isRecord(value.valueImpacts)) {
    return false;
  }

  return Object.entries(value.valueImpacts).every(
    ([key, impact]) => valueKeys.includes(key as keyof ValueProfile) && isNumber(impact) && impact >= -2 && impact <= 2,
  );
}

function toGeneratedDilemma(value: AiDilemma, input: DilemmaGenerationRequest): GeneratedDilemma {
  const exactPlace = isRecord(value.exactPlace)
    ? {
        id: isString(value.exactPlace.id) ? value.exactPlace.id : value.id,
        name: isString(value.exactPlace.name) ? value.exactPlace.name : value.city,
        address: isString(value.exactPlace.address) ? value.exactPlace.address : undefined,
        region: value.region,
        country: value.country,
        city: value.city,
        lat: value.marker.lat,
        lng: value.marker.lng,
        locationType: value.locationType,
        problemAreas: [value.problemArea],
      }
    : undefined;

  return {
    id: value.id,
    problemArea: value.problemArea,
    validLocationTypes: value.validLocationTypes.filter((item): item is LocationType => locationTypes.includes(item)),
    targetGroups: value.targetGroups,
    technologies: value.technologies.filter((item): item is FutureTechnology => technologies.includes(item)),
    severity: value.severity === "medium" ? "medium" : "low",
    title: value.title,
    scenePrompt: value.scenePrompt,
    question: value.question,
    choices: value.choices,
    tags: value.tags.filter(isString),
    country: value.country,
    city: value.city,
    region: value.region,
    locationType: value.locationType,
    technology: value.technology,
    role: input.role,
    marker: { lat: value.marker.lat, lng: value.marker.lng },
    exactPlace,
    landingScene: isString(value.landingScene) && value.landingScene.length <= 320 ? value.landingScene : undefined,
    landingDetail: isString(value.landingDetail) && value.landingDetail.length <= 90 ? value.landingDetail : undefined,
  };
}

export function validateAiDilemma(value: unknown, input: DilemmaGenerationRequest): GeneratedDilemma | undefined {
  if (!isRecord(value)) return undefined;
  if (!isString(value.id) || !isString(value.title) || !isString(value.scenePrompt) || !isString(value.question)) return undefined;
  if (!problemAreas.includes(value.problemArea as ProblemArea)) return undefined;
  if (!locationTypes.includes(value.locationType as LocationType)) return undefined;
  if (!technologies.includes(value.technology as FutureTechnology)) return undefined;
  if (!isString(value.region) || !isString(value.country) || !isString(value.city)) return undefined;

  const previousCountries = new Set(input.previousDilemmas.map((item) => item.country));
  if (input.previousDilemmas.length === 0 && value.country !== "Danmark") return undefined;
  if (input.previousDilemmas.length > 0 && (value.country === "Danmark" || previousCountries.has(value.country))) return undefined;
  if (!isRecord(value.marker) || !isNumber(value.marker.lat) || !isNumber(value.marker.lng)) return undefined;
  if (Math.abs(value.marker.lat) > 90 || Math.abs(value.marker.lng) > 180) return undefined;
  if (!Array.isArray(value.validLocationTypes) || !Array.isArray(value.targetGroups) || !Array.isArray(value.technologies) || !Array.isArray(value.tags)) {
    return undefined;
  }
  if (!Array.isArray(value.choices) || value.choices.length !== 4 || !value.choices.every(isChoice)) return undefined;

  const structured = toGeneratedDilemma(value as AiDilemma, input);
  const tailored = input.language === "da" ? tailorDilemmaCopyForAudience(structured) : structured;
  if (input.language === "da" && hasAudienceLanguageIssues(tailored)) return undefined;

  return tailored;
}
