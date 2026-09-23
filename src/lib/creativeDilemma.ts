import { locationTypesByProblemArea } from "@/data/taxonomies";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { DilemmaSeed } from "@/lib/roundPlan";
import type { Choice, FutureTechnology, GeneratedDilemma, LocationType, ProblemArea, TargetGroup, UserRole, ValueProfile } from "@/types/world2046";

export const creativeLocationTypes = [...new Set(Object.values(locationTypesByProblemArea).flat())] as LocationType[];

export const creativeSchemaLimits = {
  futureNormal: 420,
  humanCost: 420,
  decision: 320,
  title: 96,
  scene: 460,
  stake: 125,
  question: 105,
  choiceLabel: 96,
  choiceConsequence: 105,
  placeHint: 180,
} as const;

export const dilemmaDisplayLimits = {
  title: 58,
  landingScene: 180,
  scenePrompt: 460,
  stake: 125,
  question: 105,
  // Choice labels are already bounded by the authoring schema. Keep that full
  // text: truncating it here can remove the action that distinguishes one
  // answer from another and leaves a misleading ellipsis in the UI.
  choiceLabel: 96,
  choiceDescription: 105,
  choiceConsequence: 105,
  placeHint: 100,
} as const;

export const creativeDilemmaSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    futureNormal: { type: "string", maxLength: creativeSchemaLimits.futureNormal },
    humanCost: { type: "string", maxLength: creativeSchemaLimits.humanCost },
    decision: { type: "string", maxLength: creativeSchemaLimits.decision },
    title: { type: "string", maxLength: creativeSchemaLimits.title },
    scene: { type: "string", maxLength: creativeSchemaLimits.scene },
    stake: { type: "string", maxLength: creativeSchemaLimits.stake },
    question: { type: "string", maxLength: creativeSchemaLimits.question },
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
          consequence: { type: "string", maxLength: creativeSchemaLimits.choiceConsequence },
        },
        required: ["id", "label", "consequence"],
      },
    },
    locationType: { type: ["string", "null"], enum: [...creativeLocationTypes, null] },
    placeHint: { type: ["string", "null"], maxLength: creativeSchemaLimits.placeHint },
  },
  required: [
    "futureNormal", "humanCost", "decision", "title", "scene", "stake", "question",
    "choices", "locationType", "placeHint",
  ],
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
    !isText(value.futureNormal, creativeSchemaLimits.futureNormal) ||
    !isText(value.humanCost, creativeSchemaLimits.humanCost) ||
    !isText(value.decision, creativeSchemaLimits.decision) ||
    !isText(value.title, creativeSchemaLimits.title) ||
    !isText(value.scene, creativeSchemaLimits.scene) ||
    !isText(value.stake, creativeSchemaLimits.stake) ||
    !isText(value.question, creativeSchemaLimits.question)
  ) return { reason: "missing_or_long_text" };

  if (!Array.isArray(value.choices) || value.choices.length !== 4 || !value.choices.every((choice) =>
    isRecord(choice) && isText(choice.id, 1) && isText(choice.label, creativeSchemaLimits.choiceLabel) &&
    isText(choice.consequence, creativeSchemaLimits.choiceConsequence))) {
    return { reason: "bad_choices" };
  }
  const ids = value.choices.map((choice) => (choice as Record<string, unknown>).id);
  if (new Set(ids).size !== 4 || !["a", "b", "c", "d"].every((id) => ids.includes(id))) {
    return { reason: "bad_choice_ids" };
  }

  if (value.locationType !== null && value.locationType !== undefined &&
    (typeof value.locationType !== "string" || !creativeLocationTypes.includes(value.locationType as LocationType))) {
    return { reason: "bad_location_taxonomy" };
  }
  if (value.placeHint !== null && value.placeHint !== undefined &&
    (typeof value.placeHint !== "string" || value.placeHint.length > creativeSchemaLimits.placeHint)) {
    return { reason: "bad_place_hint" };
  }

  const visible = [value.title, value.scene, value.stake, value.question,
    ...value.choices.flatMap((choice) => Object.values(choice as Record<string, unknown>))].join(" ");
  if (input.role === "Barn" && CHILD_FALSE_AUTHORITY.test(visible)) return { reason: "implausible_role_authority" };
  if (OBVIOUSLY_UNSAFE.test(visible)) return { reason: "unsafe_content" };
  return { creative: value as unknown as CreativeDilemma };
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Fit text to a display budget without retaining part of a word. */
export function trimCreativeText(text: string, limit: number, ellipsis = true): string {
  const normalized = text.trim().replace(/\s+/gu, " ");
  if (normalized.length <= limit) return normalized;
  const suffix = ellipsis ? "…" : "";
  const budget = Math.max(0, limit - suffix.length);
  const kept: string[] = [];
  for (const word of normalized.split(" ")) {
    const candidate = kept.length ? `${kept.join(" ")} ${word}` : word;
    if (candidate.length > budget) break;
    kept.push(word);
  }
  return kept.length ? `${kept.join(" ").replace(/[\s,;:.\-–—]+$/u, "")}${suffix}` : suffix;
}

/** The arrival only needs to open the scene. The complete, still concise scene
 * follows on the dilemma card, so repeating it here doubles the reading load. */
function openingSentence(text: string): string {
  const normalized = text.trim().replace(/\s+/gu, " ");
  const sentence = normalized.match(/^.*?[.!?](?=\s|$)/u)?.[0] ?? normalized;
  return trimCreativeText(sentence, dilemmaDisplayLimits.landingScene);
}

const problemAreaByTheme: Partial<Record<string, ProblemArea>> = {
  "Uddannelse": "Uddannelse og læring",
  "Arbejde": "Arbejde og arbejdsliv",
  "Sundhed og bioteknologi": "Sundhed og omsorg",
  "Klima, energi og ressourcer": "Klima, energi og resiliens",
  "Data, identitet og privatliv": "Digital tillid, rettigheder og styring",
  "Sandhed og autenticitet": "Digital tillid, rettigheder og styring",
  "Offentlige systemer og demokrati": "Digital tillid, rettigheder og styring",
  "Relationer, familie og hverdagsliv": "Mobilitet, byliv og bolig",
};

export function problemAreaForDevelopment(seed: DilemmaSeed, previous: DilemmaGenerationRequest["previousDilemmas"]) {
  const candidates = seed.development.themes
    .map((theme) => problemAreaByTheme[theme])
    .filter((area): area is ProblemArea => Boolean(area));
  const used = new Set(previous.map((item) => item.problemArea));
  return candidates.find((area) => !used.has(area)) ?? candidates[0] ?? "Digital tillid, rettigheder og styring";
}

export function technologyForDevelopment(seed: DilemmaSeed): FutureTechnology {
  const { id, themes } = seed.development;
  if (/robot|autonomous|driverless|remote-specialist|remote-physical/u.test(id)) return "robotkollega";
  if (/diagnos|disease|sensor|genetic|medicine|organ|memory-support|ageing/u.test(id)) return "sundhedsdata";
  if (/identity|verified|authentic|synthetic|deepfake|anonymous|reputation|data/u.test(id)) return "digital ID-wallet";
  if (/energy|grid|heat|water|flood|climate|food/u.test(id)) return "energi-AI";
  if (themes.includes("Uddannelse")) return "personlig læringsassistent";
  if (themes.includes("Arbejde")) return "automation";
  if (themes.includes("Offentlige systemer og demokrati")) return "kommunal beslutnings-AI";
  return "personlig data-agent";
}

function fallbackLocationType(problemArea: ProblemArea, role: DilemmaGenerationRequest["role"]): LocationType {
  if (role === "Barn") return problemArea === "Uddannelse og læring" ? "folkeskole" : "hjemmet";
  if (role === "Ung" && problemArea === "Uddannelse og læring") return "gymnasium";
  if (role === "Lærer / pædagog") return "folkeskole";
  if (role === "Forælder" || role === "For alle") return "hjemmet";
  return locationTypesByProblemArea[problemArea][0];
}

const targetGroupsByRole: Record<UserRole, TargetGroup[]> = {
  Barn: ["unge", "familier", "lærere"],
  Ung: ["unge", "familier", "lærere"],
  Forælder: ["familier", "unge", "borgere"],
  "Lærer / pædagog": ["lærere", "unge", "familier"],
  Fagperson: ["medarbejdere", "borgere", "ledere"],
  Arbejdsgiver: ["ledere", "medarbejdere"],
  Medarbejder: ["medarbejdere", "ledere"],
  "For alle": ["borgere", "familier", "unge"],
  Borger: ["borgere", "familier"],
  Beslutningstager: ["beslutningstagere", "borgere", "ledere"],
};

export function enrichCreativeDilemma(
  creative: CreativeDilemma,
  input: DilemmaGenerationRequest,
  seed: DilemmaSeed,
  impacts: Record<"a" | "b" | "c" | "d", ValueProfile>,
): GeneratedDilemma {
  const problemArea = problemAreaForDevelopment(seed, input.previousDilemmas);
  const technology = technologyForDevelopment(seed);
  const locationType = creative.locationType ?? fallbackLocationType(problemArea, input.role);
  const choices: Choice[] = creative.choices.map((choice) => ({
    id: choice.id,
    label: trimCreativeText(choice.label, dilemmaDisplayLimits.choiceLabel),
    description: trimCreativeText(choice.consequence, dilemmaDisplayLimits.choiceDescription),
    consequence: trimCreativeText(choice.consequence, dilemmaDisplayLimits.choiceConsequence),
    valueImpacts: impacts[choice.id],
  }));
  const validLocationTypes = [...new Set([...locationTypesByProblemArea[problemArea], locationType])];

  return {
    id: crypto.randomUUID(),
    problemArea,
    validLocationTypes,
    targetGroups: targetGroupsByRole[input.role],
    technologies: [technology],
    severity: seed.severity,
    title: trimCreativeText(creative.title, dilemmaDisplayLimits.title),
    scenePrompt: trimCreativeText(creative.scene, dilemmaDisplayLimits.scenePrompt),
    question: trimCreativeText(creative.question, dilemmaDisplayLimits.question),
    choices: shuffled(choices),
    tags: [...seed.development.themes, seed.development.id],
    country: seed.location.country,
    city: seed.location.city,
    region: seed.location.region,
    locationType,
    technology,
    role: input.role,
    marker: { lat: seed.location.lat, lng: seed.location.lng },
    landingScene: openingSentence(creative.scene),
    stake: trimCreativeText(creative.stake, dilemmaDisplayLimits.stake),
    logic: {
      rule: creative.futureNormal,
      benefit: seed.development.development,
      trigger: creative.humanCost,
      decision: creative.decision,
      choiceConstraint: creative.humanCost,
    },
    futurePressureId: seed.development.id,
    normalized2046: trimCreativeText(creative.futureNormal, creativeSchemaLimits.futureNormal, false),
  };
}
