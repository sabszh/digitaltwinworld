import { locationTypesByProblemArea, problemAreas } from "@/data/taxonomies";
import { getAudienceProfile } from "@/lib/audience";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { RoundPlan } from "@/lib/roundPlan";
import type { Choice, FutureTechnology, GeneratedDilemma, LocationType, ProblemArea, ValueProfile } from "@/types/world2046";

export const creativeLocationTypes = [...new Set(Object.values(locationTypesByProblemArea).flat())] as LocationType[];

export const creativeSchemaLimits = {
  title: 96,
  landingScene: 520,
  scenePrompt: 640,
  stake: 360,
  question: 300,
  tension: 360,
  choiceLabel: 96,
  choiceDescription: 260,
  choiceConsequence: 360,
  placeHint: 180,
} as const;

export const dilemmaDisplayLimits = {
  title: 58,
  landingScene: 320,
  scenePrompt: 360,
  stake: 190,
  question: 160,
  tensionWant: 120,
  tensionReason: 180,
  choiceLabel: 46,
  choiceDescription: 124,
  choiceConsequence: 192,
  placeHint: 100,
} as const;

export const creativeDilemmaSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string", maxLength: creativeSchemaLimits.title },
    landingScene: { type: "string", maxLength: creativeSchemaLimits.landingScene },
    scenePrompt: { type: "string", maxLength: creativeSchemaLimits.scenePrompt },
    stake: { type: "string", maxLength: creativeSchemaLimits.stake },
    question: { type: "string", maxLength: creativeSchemaLimits.question },
    coreTension: {
      type: "object",
      additionalProperties: false,
      properties: {
        want: { type: "string", maxLength: creativeSchemaLimits.tension },
        butAlsoWant: { type: "string", maxLength: creativeSchemaLimits.tension },
        whyCannotHaveBoth: { type: "string", maxLength: creativeSchemaLimits.tension },
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
          label: { type: "string", maxLength: creativeSchemaLimits.choiceLabel },
          description: { type: "string", maxLength: creativeSchemaLimits.choiceDescription },
          consequence: { type: "string", maxLength: creativeSchemaLimits.choiceConsequence },
        },
        required: ["id", "label", "description", "consequence"],
      },
    },
    locationType: { type: "string", enum: creativeLocationTypes },
    placeHint: { type: "string", maxLength: creativeSchemaLimits.placeHint },
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
  | "bad_place_hint"
  | "implausible_role_authority"
  | "unsafe_content";

export function validateCreativeDilemma(
  value: unknown,
  input: DilemmaGenerationRequest,
): { creative: CreativeDilemma } | { reason: CreativeDilemmaRejection } {
  if (!isRecord(value)) return { reason: "not_an_object" };
  if (
    !isText(value.title, creativeSchemaLimits.title) ||
    !isText(value.landingScene, creativeSchemaLimits.landingScene) ||
    !isText(value.scenePrompt, creativeSchemaLimits.scenePrompt) ||
    !isText(value.stake, creativeSchemaLimits.stake) ||
    !isText(value.question, creativeSchemaLimits.question)
  ) return { reason: "missing_or_long_text" };

  if (!isRecord(value.coreTension) || !isText(value.coreTension.want, creativeSchemaLimits.tension) ||
    !isText(value.coreTension.butAlsoWant, creativeSchemaLimits.tension) ||
    !isText(value.coreTension.whyCannotHaveBoth, creativeSchemaLimits.tension)) {
    return { reason: "bad_core_tension" };
  }

  if (!Array.isArray(value.choices) || value.choices.length !== 4 || !value.choices.every((choice) =>
    isRecord(choice) && isText(choice.id, 1) && isText(choice.label, creativeSchemaLimits.choiceLabel) &&
    isText(choice.description, creativeSchemaLimits.choiceDescription) &&
    isText(choice.consequence, creativeSchemaLimits.choiceConsequence))) {
    return { reason: "bad_choices" };
  }
  const ids = value.choices.map((choice) => (choice as Record<string, unknown>).id);
  if (new Set(ids).size !== 4 || !["a", "b", "c", "d"].every((id) => ids.includes(id))) {
    return { reason: "bad_choice_ids" };
  }

  if (!isText(value.locationType, 40) || !creativeLocationTypes.includes(value.locationType as LocationType)) {
    return { reason: "bad_location_taxonomy" };
  }
  if (!isText(value.placeHint, creativeSchemaLimits.placeHint)) return { reason: "bad_place_hint" };

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

/** Fit text to a display budget without ever retaining part of a word. */
export function trimCreativeText(text: string, limit: number, ellipsis = true): string {
  const normalized = text.trim().replace(/\s+/gu, " ");
  if (normalized.length <= limit) return normalized;
  const suffix = ellipsis ? "…" : "";
  const budget = Math.max(0, limit - suffix.length);
  const words = normalized.split(" ");
  const kept: string[] = [];
  for (const word of words) {
    const candidate = kept.length ? `${kept.join(" ")} ${word}` : word;
    if (candidate.length > budget) break;
    kept.push(word);
  }
  return kept.length ? `${kept.join(" ").replace(/[\s,;:.\-–—]+$/u, "")}${suffix}` : suffix;
}

export function problemAreaForLocation(locationType: LocationType, input: DilemmaGenerationRequest, plan: RoundPlan) {
  const matching = problemAreas.filter((area) => locationTypesByProblemArea[area].includes(locationType));
  const used = new Set(input.previousDilemmas.map((item) => item.problemArea));
  return matching.find((area) => plan.problemAreas.includes(area) && !used.has(area))
    ?? matching.find((area) => !used.has(area))
    ?? matching.find((area) => plan.problemAreas.includes(area))
    ?? matching[0]
    ?? plan.problemAreas[0];
}

export function enrichCreativeDilemma(
  creative: CreativeDilemma,
  input: DilemmaGenerationRequest,
  plan: RoundPlan,
  impacts: Record<"a" | "b" | "c" | "d", ValueProfile>,
): GeneratedDilemma {
  const problemArea = problemAreaForLocation(creative.locationType, input, plan);
  const technology = technologyByArea[problemArea];
  const audience = getAudienceProfile(input.role);
  const choices: Choice[] = creative.choices.map((choice) => ({
    ...choice,
    label: trimCreativeText(choice.label, dilemmaDisplayLimits.choiceLabel),
    description: trimCreativeText(choice.description, dilemmaDisplayLimits.choiceDescription),
    consequence: trimCreativeText(choice.consequence, dilemmaDisplayLimits.choiceConsequence),
    valueImpacts: impacts[choice.id],
  }));

  return {
    id: crypto.randomUUID(),
    problemArea,
    validLocationTypes: locationTypesByProblemArea[problemArea],
    targetGroups: audience.targetGroups,
    technologies: [technology],
    severity: plan.severity,
    title: trimCreativeText(creative.title, dilemmaDisplayLimits.title),
    scenePrompt: trimCreativeText(creative.scenePrompt, dilemmaDisplayLimits.scenePrompt),
    question: trimCreativeText(creative.question, dilemmaDisplayLimits.question),
    choices: shuffled(choices),
    tags: [plan.pressure.family, plan.pressure.id],
    country: plan.location.country,
    city: plan.location.city,
    region: plan.location.region,
    locationType: creative.locationType,
    technology,
    role: input.role,
    marker: { lat: plan.location.lat, lng: plan.location.lng },
    landingScene: trimCreativeText(creative.landingScene, dilemmaDisplayLimits.landingScene),
    stake: trimCreativeText(creative.stake, dilemmaDisplayLimits.stake),
    coreTension: {
      want: trimCreativeText(creative.coreTension.want, dilemmaDisplayLimits.tensionWant),
      butAlsoWant: trimCreativeText(creative.coreTension.butAlsoWant, dilemmaDisplayLimits.tensionWant),
      whyCannotHaveBoth: trimCreativeText(creative.coreTension.whyCannotHaveBoth, dilemmaDisplayLimits.tensionReason),
    },
    futurePressureId: plan.pressure.id,
  };
}
