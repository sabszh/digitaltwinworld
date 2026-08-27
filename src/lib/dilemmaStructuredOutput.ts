import { dilemmaTemplates } from "@/data/dilemmaTemplates";
import { futurePressures, pressuresById } from "@/data/futurePressures";
import { locationTypesByProblemArea, problemAreas } from "@/data/taxonomies";
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
export const worldRegions = ["Norden", "Europa", "Nordamerika", "Sydamerika", "Afrika", "Asien", "Mellemøsten", "Oceanien"] as const;

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
    title: { type: "string", maxLength: 72 },
    scenePrompt: { type: "string", maxLength: 360 },
    question: { type: "string", maxLength: 160 },
    stake: { type: "string", maxLength: 230 },
    // Internal, never rendered: the conflict as people experience it, not the
    // value dimensions used later to score a selected action.
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
    logic: {
      type: "object",
      additionalProperties: false,
      properties: {
        rule: { type: "string", maxLength: 180 },
        benefit: { type: "string", maxLength: 180 },
        trigger: { type: "string", maxLength: 180 },
        decision: { type: "string", maxLength: 180 },
        choiceConstraint: { type: "string", maxLength: 180 },
      },
      required: ["rule", "benefit", "trigger", "decision", "choiceConstraint"],
    },
    // Internal checks that keep the future setting tied to a real pressure.
    futurePressureId: { type: "string", enum: futurePressures.map((pressure) => pressure.id) },
    normalized2046: { type: "string", maxLength: 180 },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", enum: ["a", "b", "c", "d"] },
          label: { type: "string", maxLength: 72 },
          description: { type: "string", maxLength: 168 },
          consequence: { type: "string", maxLength: 240 },
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
    region: { type: "string", enum: worldRegions },
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
    "stake",
    "coreTension",
    "logic",
    "futurePressureId",
    "normalized2046",
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
  ],
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export const isString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const TRADEOFF_CONNECTOR = /\b(men|selv om|til gengæld|på bekostning af|but|even though|although|at the cost of)\b/iu;

function choiceProblem(value: unknown): string | null {
  if (
    !isRecord(value) || !isString(value.id) || !isString(value.label) ||
    !isString(value.description) || !isString(value.consequence) || !isRecord(value.valueImpacts)
  ) {
    return "shape";
  }
  if (!TRADEOFF_CONNECTOR.test(value.description)) return "missing_tradeoff";

  const impacts = value.valueImpacts;
  if (!Object.entries(impacts).every(
    ([key, impact]) => valueKeys.includes(key as keyof ValueProfile) && isNumber(impact) && impact >= -2 && impact <= 2,
  )) return "invalid_impacts";

  const relevantValues = valueKeys.filter((key) => impacts[key] !== 0).length;
  // The prompt asks for 3–5 relevant values. The number is hidden metadata,
  // however, so do not throw away an otherwise valid, player-facing dilemma
  // just because the model marked fewer or more secondary effects.
  return relevantValues >= 1 ? null : "relevant_values";
}

function isChoice(value: unknown): value is Choice {
  return choiceProblem(value) === null;
}

/** Lowercase, strip punctuation, collapse space — enough to catch labels that
 *  differ only in casing or a comma. */
const normalizeLabel = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** "AI spiller en større rolle" is not a 2046 reality, it is a shrug. The whole
 *  scene is supposed to be built on this sentence, so it has to say something. */
const GENERIC_FUTURE =
  /(spiller en (større|vigtigere) rolle|er (mere|blevet mere) (udbredt\w*|avancered?\w*|almindelig\w*|effektiv\w*|integrere?t\w*)|bruges mere|har ændret sig|er blevet bedre|plays a (bigger|larger) role|is more widespread)/iu;

/** A title that names both sides of the tension is the one shape the prompt
 *  forbids by example, and the model still writes it with synonyms. */
const TITLE_NAMES_TENSION = /^\s*(valget|balancen?|afvejningen|kampen|striden|dilemmaet|the\s+balance|the\s+choice)\s+(mellem|between)\b/iu;
const BIASED_QUESTION = /\b(uden at|samtidig med at|på en ansvarlig måde|på den rigtige måde|without|while ensuring|responsibly)\b/iu;
const CHILD_FALSE_AUTHORITY = /\b(ungebyråd|byråd|kommunalbestyrelse|afstemning|sætte (dit|jeres) kryds|godkende (planen|adgangen|fordelingen|ordningen)|medicinråd|medicinsk(?:e)? råd|vælge (?:hans|hendes|andres) behandling|give andre medicin)\b/iu;

/** Word overlap, so "Del data bredt" and "Del data meget bredt" are caught as
 *  the same position rather than two. Deliberately crude: the real work of
 *  keeping options distinct belongs in the prompt, not here. */
function tooSimilar(a: string, b: string): boolean {
  const wordsA = new Set(normalizeLabel(a).split(" ").filter(Boolean));
  const wordsB = new Set(normalizeLabel(b).split(" ").filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  const shared = [...wordsA].filter((word) => wordsB.has(word)).length;
  return shared / Math.min(wordsA.size, wordsB.size) >= 0.8;
}

function findLogicProblem(value: Record<string, unknown>): string | null {
  if (!isRecord(value.logic)) return "missing";
  const { rule, benefit, trigger, decision, choiceConstraint } = value.logic;
  if (![rule, benefit, trigger, decision, choiceConstraint].every(isString)) return "incomplete";
  return null;
}

/**
 * Deterministic quality gate for the four options.
 *
 * These are the checks that can be made without a second model call. They are
 * about four distinct, non-identical actions with separate hidden scoring;
 * judging whether the costs are genuinely felt remains the prompt's job.
 */
function findChoiceSetProblem(
  choices: Choice[],
  coreTension: unknown,
): string | null {
  const ids = choices.map((choice) => choice.id);
  if (new Set(ids).size !== 4 || !["a", "b", "c", "d"].every((id) => ids.includes(id))) return "ids";

  for (let i = 0; i < choices.length; i += 1) {
    for (let j = i + 1; j < choices.length; j += 1) {
      if (tooSimilar(choices[i].label, choices[j].label)) return "duplicate_labels";
    }
  }

  if (!isRecord(coreTension)) return "no_core_tension";
  const { want, butAlsoWant, whyCannotHaveBoth } = coreTension;
  if (!isString(want) || !isString(butAlsoWant) || !isString(whyCannotHaveBoth)) return "incomplete_human_conflict";
  if (normalizeLabel(want) === normalizeLabel(butAlsoWant)) return "collapsed_human_conflict";

  const distinctScorings = new Set(choices.map((choice) => JSON.stringify(choice.valueImpacts)));
  if (distinctScorings.size < 3) return "duplicate_value_impacts";

  return null;
}

/**
 * Cut back to the last whole word.
 *
 * The schema's maxLength is a hard truncation: the model writes past the cap and
 * OpenAI slices mid-word, so cards showed "AI har fuld beslutningsmagt med
 * menneskelig op". The caps now sit well above what the prompt asks for, and
 * anything that still runs long is trimmed here at a word boundary instead. A
 * trailing ellipsis is deliberate — a silently shortened sentence reads as the
 * writer's own abrupt ending, which is worse than an admitted cut.
 */
export function trimToWord(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = (lastSpace > limit * 0.55 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/u, "");
  return `${kept}…`;
}

/**
 * Present the competing actions in a random order. Their hidden impacts remain
 * attached to the action, but no ordering suggests a value scale to the player.
 */
function shuffleChoices(choices: Choice[]): Choice[] {
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
    // Display budgets, applied at word boundaries. These sit below the schema's
    // maxLength so anything the model overshoots by lands here rather than being
    // sliced mid-word by the API.
    title: trimToWord(value.title, 58),
    scenePrompt: value.scenePrompt,
    question: value.question,
    choices: shuffleChoices(value.choices).map((choice) => ({
      ...choice,
      label: trimToWord(choice.label, 46),
      description: isString(choice.description) ? trimToWord(choice.description, 124) : choice.description,
      consequence: isString(choice.consequence) ? trimToWord(choice.consequence, 192) : choice.consequence,
    })),
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
    stake: isString(value.stake) ? trimToWord(value.stake, 190) : undefined,
    futurePressureId: isString(value.futurePressureId) ? value.futurePressureId : undefined,
    normalized2046: isString(value.normalized2046) ? value.normalized2046 : undefined,
    coreTension: value.coreTension,
    logic: value.logic,
  };
}

/** Why a generated dilemma was rejected. Surfaced through the API route's
 *  `reason` field so a rising fallback rate can be traced to a specific rule
 *  rather than showing up only as blander dilemmas. */
export type DilemmaRejection =
  | "not_an_object" | "missing_text" | "bad_taxonomy" | "bad_place" | "geography_rule"
  | "bad_marker" | "bad_arrays" | "empty_arrays" | "bad_choices" | `bad_choices:${string}`
  | "audience_language" | "title_names_tension" | "biased_question" | "bad_location_fit"
  | "implausible_role" | "visible_text_too_long"
  | "generic_future" | "bad_future_pressure" | "wrong_generation_plan" | "problem_area_reused"
  | `incoherent_logic:${string}` | `unusable_choice_set:${string}`;

export function validateAiDilemmaDetailed(
  value: unknown,
  input: DilemmaGenerationRequest,
): { dilemma: GeneratedDilemma } | { reason: DilemmaRejection } {
  if (!isRecord(value)) return { reason: "not_an_object" };
  if (
    !isString(value.id) || !isString(value.title) || !isString(value.scenePrompt) ||
    !isString(value.landingScene) || !isString(value.stake) || !isString(value.question)
  ) return { reason: "missing_text" };
  if (TITLE_NAMES_TENSION.test(value.title)) return { reason: "title_names_tension" };
  if (BIASED_QUESTION.test(value.question)) return { reason: "biased_question" };
  if (value.stake.length > 170) return { reason: "visible_text_too_long" };
  if (
    input.role === "Barn" &&
    CHILD_FALSE_AUTHORITY.test([value.title, value.landingScene, value.scenePrompt, value.question].join(" "))
  ) return { reason: "implausible_role" };
  if (!problemAreas.includes(value.problemArea as ProblemArea)) return { reason: "bad_taxonomy" };
  if (!locationTypes.includes(value.locationType as LocationType)) return { reason: "bad_taxonomy" };
  if (!technologies.includes(value.technology as FutureTechnology)) return { reason: "bad_taxonomy" };
  if (!isString(value.region) || !worldRegions.includes(value.region as typeof worldRegions[number]) || !isString(value.country) || !isString(value.city)) {
    return { reason: "bad_place" };
  }

  const previousCountries = new Set(input.previousDilemmas.map((item) => item.country));
  // Five stops out of seven areas: a journey that spends three of them inside
  // "Digital tillid, rettigheder og styring" is the same stop three times.
  if (input.previousDilemmas.some((item) => item.problemArea === value.problemArea)) return { reason: "problem_area_reused" };
  if (!locationTypesByProblemArea[value.problemArea as ProblemArea]?.includes(value.locationType as LocationType)) {
    return { reason: "bad_location_fit" };
  }
  if (input.previousDilemmas.length === 0 && value.country !== "Danmark") return { reason: "geography_rule" };
  if (input.previousDilemmas.length > 0 && (value.country === "Danmark" || previousCountries.has(value.country))) return { reason: "geography_rule" };
  if (!isRecord(value.marker) || !isNumber(value.marker.lat) || !isNumber(value.marker.lng)) return { reason: "bad_marker" };
  if (Math.abs(value.marker.lat) > 90 || Math.abs(value.marker.lng) > 180) return { reason: "bad_marker" };
  if (!Array.isArray(value.validLocationTypes) || !Array.isArray(value.targetGroups) || !Array.isArray(value.technologies) || !Array.isArray(value.tags)) {
    return { reason: "bad_arrays" };
  }
  if (value.validLocationTypes.length === 0 || value.targetGroups.length === 0 || value.technologies.length === 0) return { reason: "empty_arrays" };
  if (!Array.isArray(value.choices) || value.choices.length !== 4 || !value.choices.every(isChoice)) {
    const choiceReason = Array.isArray(value.choices) ? value.choices.map(choiceProblem).find(Boolean) : "not_array";
    console.warn(`[dilemma] invalid choices: ${choiceReason ?? "wrong_count"}`);
    return { reason: `bad_choices:${choiceReason ?? "wrong_count"}` as DilemmaRejection };
  }
  if (!isString(value.normalized2046) || value.normalized2046.trim().length < 25 || GENERIC_FUTURE.test(value.normalized2046)) {
    return { reason: "generic_future" };
  }
  if (!isString(value.futurePressureId) || !pressuresById.has(value.futurePressureId)) return { reason: "bad_future_pressure" };
  if (
    input.generationPlan &&
    (value.futurePressureId !== input.generationPlan.pressure.id ||
      !input.generationPlan.problemAreas.includes(value.problemArea as ProblemArea) ||
      value.severity !== input.generationPlan.severity)
  ) {
    return { reason: "wrong_generation_plan" };
  }
  const logicProblem = findLogicProblem(value);
  if (logicProblem) return { reason: `incoherent_logic:${logicProblem}` as DilemmaRejection };
  const choiceSetProblem = findChoiceSetProblem(value.choices as Choice[], value.coreTension);
  if (choiceSetProblem) return { reason: `unusable_choice_set:${choiceSetProblem}` as DilemmaRejection };

  const structured = toGeneratedDilemma(value as AiDilemma, input);
  if (input.language === "da" && hasAudienceLanguageIssues(structured)) return { reason: "audience_language" };

  return { dilemma: structured };
}

export function validateAiDilemma(value: unknown, input: DilemmaGenerationRequest): GeneratedDilemma | undefined {
  const result = validateAiDilemmaDetailed(value, input);
  return "dilemma" in result ? result.dilemma : undefined;
}
