import { locationTypesByProblemArea } from "@/data/taxonomies";
import { getAudienceProfile } from "@/lib/audience";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { RoundPlan } from "@/lib/roundPlan";
import type { Choice, FutureTechnology, GeneratedDilemma, LocationType, ProblemArea, ValueProfile } from "@/types/world2046";

export const creativeLocationTypes = [...new Set(Object.values(locationTypesByProblemArea).flat())] as LocationType[];

export const creativeDilemmaSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string", maxLength: 58 },
    landingScene: { type: "string", maxLength: 320 },
    scenePrompt: { type: "string", maxLength: 360 },
    stake: { type: "string", maxLength: 190 },
    question: { type: "string", maxLength: 160 },
    coreTension: {
      type: "object",
      additionalProperties: false,
      properties: {
        want: { type: "string", maxLength: 120 },
        butAlsoWant: { type: "string", maxLength: 120 },
        whyCannotHaveBoth: { type: "string", maxLength: 180 },
      },
      required: ["want", "butAlsoWant", "whyCannotHaveBoth"],
    },
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
          description: { type: "string", maxLength: 124 },
          consequence: { type: "string", maxLength: 192 },
        },
        required: ["id", "label", "description", "consequence"],
      },
    },
    locationType: { type: "string", enum: creativeLocationTypes },
    placeHint: { type: "string", maxLength: 100 },
  },
  required: ["title", "landingScene", "scenePrompt", "stake", "question", "coreTension", "choices", "locationType", "placeHint"],
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const isText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
const CHILD_FALSE_AUTHORITY = /\b(byråd|kommunalbestyrelse|fordel(?:e|er) kommunens|regul(?:ere|erer) virksomheden|vælg(?:e|er) andres behandling)\b/iu;
const OBVIOUSLY_UNSAFE = /\b(selvmord|seksuelt overgreb|tortur|suicide|sexual assault|torture)\b/iu;

export type CreativeDilemmaRejection =
  | "not_an_object"
  | "missing_or_long_text"
  | "bad_core_tension"
  | "bad_choices"
  | "bad_choice_ids"
  | "bad_location_taxonomy"
  | "bad_location_fit"
  | "implausible_role_authority"
  | "unsafe_content";

export function validateCreativeDilemma(
  value: unknown,
  input: DilemmaGenerationRequest,
): { creative: CreativeDilemma } | { reason: CreativeDilemmaRejection } {
  if (!isRecord(value)) return { reason: "not_an_object" };
  if (
    !isText(value.title, 58) || !isText(value.landingScene, 320) || !isText(value.scenePrompt, 360) ||
    !isText(value.stake, 190) || !isText(value.question, 160)
  ) return { reason: "missing_or_long_text" };

  if (!isRecord(value.coreTension) || !isText(value.coreTension.want, 120) ||
    !isText(value.coreTension.butAlsoWant, 120) || !isText(value.coreTension.whyCannotHaveBoth, 180)) {
    return { reason: "bad_core_tension" };
  }

  if (!Array.isArray(value.choices) || value.choices.length !== 4 || !value.choices.every((choice) =>
    isRecord(choice) && isText(choice.id, 1) && isText(choice.label, 46) &&
    isText(choice.description, 124) && isText(choice.consequence, 192))) {
    return { reason: "bad_choices" };
  }
  const ids = value.choices.map((choice) => (choice as Record<string, unknown>).id);
  if (new Set(ids).size !== 4 || !["a", "b", "c", "d"].every((id) => ids.includes(id))) {
    return { reason: "bad_choice_ids" };
  }

  if (!isText(value.locationType, 40) || !creativeLocationTypes.includes(value.locationType as LocationType)) {
    return { reason: "bad_location_taxonomy" };
  }
  const plan = input.generationPlan;
  if (plan && !plan.problemAreas.some((area) => locationTypesByProblemArea[area].includes(value.locationType as LocationType))) {
    return { reason: "bad_location_fit" };
  }

  const visible = [value.title, value.landingScene, value.scenePrompt, value.stake, value.question,
    ...value.choices.flatMap((choice) => Object.values(choice as Record<string, unknown>))].join(" ");
  if (input.role === "Barn" && CHILD_FALSE_AUTHORITY.test(visible)) return { reason: "implausible_role_authority" };
  if (OBVIOUSLY_UNSAFE.test(visible)) return { reason: "unsafe_content" };

  return { creative: value as unknown as CreativeDilemma };
}

const technologyByArea: Record<ProblemArea, FutureTechnology> = {
  "Uddannelse og læring": "personlig læringsassistent",
  "Arbejde og arbejdsliv": "automation",
  "Sundhed og omsorg": "sundhedsdata",
  "Mobilitet, byliv og bolig": "bydigital tvilling",
  "Klima, energi og resiliens": "energi-AI",
  "Mad, vand og forsyning": "forsynings-AI",
  "Digital tillid, rettigheder og styring": "personlig data-agent",
};

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function enrichCreativeDilemma(
  creative: CreativeDilemma,
  input: DilemmaGenerationRequest,
  plan: RoundPlan,
  impacts: Record<"a" | "b" | "c" | "d", ValueProfile>,
): GeneratedDilemma {
  const problemArea = plan.problemAreas.find((area) =>
    locationTypesByProblemArea[area].includes(creative.locationType)) ?? plan.problemAreas[0];
  const technology = technologyByArea[problemArea];
  const audience = getAudienceProfile(input.role);
  const choices: Choice[] = creative.choices.map((choice) => ({ ...choice, valueImpacts: impacts[choice.id] }));

  return {
    id: crypto.randomUUID(),
    problemArea,
    validLocationTypes: locationTypesByProblemArea[problemArea],
    targetGroups: audience.targetGroups,
    technologies: [technology],
    severity: plan.severity,
    title: creative.title,
    scenePrompt: creative.scenePrompt,
    question: creative.question,
    choices: shuffled(choices),
    tags: [plan.pressure.family, plan.pressure.id],
    country: plan.location.country,
    city: plan.location.city,
    region: plan.location.region,
    locationType: creative.locationType,
    technology,
    role: input.role,
    marker: { lat: plan.location.lat, lng: plan.location.lng },
    landingScene: creative.landingScene,
    stake: creative.stake,
    coreTension: creative.coreTension,
    futurePressureId: plan.pressure.id,
  };
}
