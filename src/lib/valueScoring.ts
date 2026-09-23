import { emptyValueProfile } from "@/data/taxonomies";
import type { CreativeDilemma } from "@/lib/dilemmaGenerationTypes";
import { requestJson } from "@/lib/openaiJson";
import type { Language } from "@/lib/i18n";
import type { ValueProfile } from "@/types/world2046";

export const valueKeys = [
  "trust", "freedom", "equality", "efficiency", "humanContact", "safety",
  "innovation", "sustainability", "localControl", "transparency",
] as const satisfies Array<keyof ValueProfile>;

const profileSchema = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(valueKeys.map((key) => [key, { type: "number", minimum: -2, maximum: 2 }])),
  required: valueKeys,
};

export const valueImpactSchema = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(["a", "b", "c", "d"].map((id) => [id, profileSchema])),
  required: ["a", "b", "c", "d"],
} as const;

export type ValueImpactsByChoice = Record<"a" | "b" | "c" | "d", ValueProfile>;

export function buildValueScoringPrompt(creative: CreativeDilemma) {
  return `Score kun hvordan hvert svar påvirker de ti værdier. Du må ikke omskrive dilemmaet.

Fremtidens normal: ${creative.futureNormal}
Menneskelig pris: ${creative.humanCost}
Beslutning: ${creative.decision}

Svar:
${creative.choices.map((choice) => `${choice.id}: ${choice.label}. ${choice.consequence}`).join("\n")}

Brug heltal fra -2 til 2. 0 betyder ingen tydelig påvirkning. Brug kun ikke-nul, når svaret klart styrker eller svækker værdien.
Værdier: ${valueKeys.join(", ")}.
Returnér kun scoringerne for a, b, c og d.`;
}

function isProfile(value: unknown): value is ValueProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return valueKeys.every((key) => Number.isInteger(record[key]) && Number(record[key]) >= -2 && Number(record[key]) <= 2);
}

export function validateValueImpacts(value: unknown): ValueImpactsByChoice | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  return ["a", "b", "c", "d"].every((id) => isProfile(record[id])) ? value as ValueImpactsByChoice : undefined;
}

export async function scoreDilemmaValues(
  creative: CreativeDilemma,
  apiKey: string,
  language: Language,
): Promise<ValueImpactsByChoice> {
  const outcome = await requestJson<ValueImpactsByChoice>({
    apiKey,
    model: process.env.UTILITY_MODEL,
    schemaName: "world2046_value_impacts",
    schema: valueImpactSchema,
    prompt: buildValueScoringPrompt(creative),
    language,
    reasoningEffort: "low",
    timeoutMs: 20_000,
  });
  if ("error" in outcome) throw new Error(outcome.error);
  const valid = validateValueImpacts(outcome.data);
  if (!valid) throw new Error("invalid_value_impacts");
  return valid;
}

export const zeroValueImpacts = (): ValueImpactsByChoice => ({
  a: { ...emptyValueProfile },
  b: { ...emptyValueProfile },
  c: { ...emptyValueProfile },
  d: { ...emptyValueProfile },
});
