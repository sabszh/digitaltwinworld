import { addProfiles, impactsForMatchedChoice } from "@/lib/profileScoring";
import { requestJson } from "@/lib/openaiJson";
import { buildValuePrompt, valueResponseSchema, writtenAnswers } from "@/lib/prompts/valuePrompt";
import { emptyValueProfile, valueLabelsByLanguage } from "@/data/taxonomies";
import type { CompletedDilemma, FutureProfileReport, PersonaAnswers, ValueProfile } from "@/types/world2046";
import { NextResponse } from "next/server";
import type { Language } from "@/lib/i18n";

export const runtime = "nodejs";

type ReportRequest = {
  answers?: PersonaAnswers;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  language: Language;
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value: unknown): value is string => typeof value === "string";

const reportError = (reason: string) => NextResponse.json({ error: reason }, { status: 502 });

function collectUserTexts(completed: CompletedDilemma[]) {
  return completed.flatMap((item) => [item.customAnswer, item.reflection].filter(isString).map((value) => value.trim()));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function validateReport(value: unknown, userTexts: string[]): FutureProfileReport | undefined {
  if (!isRecord(value)) return undefined;
  if (!isString(value.headline) || value.headline.length === 0 || value.headline.length > 64) return undefined;
  if (!isString(value.narrative) || value.narrative.length === 0 || value.narrative.length > 950) return undefined;
  if (!Array.isArray(value.quotes)) return undefined;
  if (!Array.isArray(value.patterns) || !value.patterns.every(isString)) return undefined;
  if (!isString(value.reflectionNote)) return undefined;

  const normalizedUserTexts = userTexts.map(normalize);
  const quotes = (value.quotes as unknown[])
    .filter((quote): quote is { quote: string; context: string } => isRecord(quote) && isString(quote.quote) && isString(quote.context))
    .filter((quote) => normalizedUserTexts.some((text) => text.includes(normalize(quote.quote))))
    .slice(0, 3);

  return {
    headline: value.headline,
    narrative: value.narrative,
    quotes,
    patterns: (value.patterns as string[]).slice(0, 4),
    reflectionNote: value.reflectionNote.slice(0, 220),
    source: "openai",
  };
}

/**
 * Score the answers the traveller wrote themselves.
 *
 * Picked options already carry impacts authored at generation time. A written
 * answer is matched to an authored action, never placed on an invented value
 * axis. Any failure leaves the profile untouched.
 */
async function scoreWrittenAnswers(input: ReportRequest, apiKey: string): Promise<ValueProfile> {
  const items = writtenAnswers(input.completedDilemmas);
  if (items.length === 0) return input.valueProfile;

  const outcome = await requestJson<{ matches?: unknown }>({
    apiKey,
    schemaName: "world2046_choice_match",
    schema: valueResponseSchema,
    prompt: buildValuePrompt(items, input.language),
    language: input.language,
    systemNote: "Match answers to authored actions only. Do not describe the person or infer values.",
    temperature: 0.2,
  });
  if ("error" in outcome) {
    console.warn(`[report] value scoring failed: ${outcome.error}`);
    return input.valueProfile;
  }

  const raw = outcome.data?.matches;
  if (!Array.isArray(raw)) return input.valueProfile;

  const byId = new Map(items.map((item) => [item.dilemmaId, item]));
  let profile = input.valueProfile;
  const seen = new Set<string>();
  for (const entry of raw) {
    if (!isRecord(entry) || !isString(entry.dilemmaId) || !isString(entry.choiceId)) continue;
    // One match per dilemma: a model that repeats an id would otherwise
    // score the same answer twice and double its weight in the profile.
    if (seen.has(entry.dilemmaId)) continue;
    const item = byId.get(entry.dilemmaId);
    if (!item) continue;
    seen.add(entry.dilemmaId);
    const choiceId = ["a", "b", "c", "d", "unscored"].includes(entry.choiceId) ? entry.choiceId as "a" | "b" | "c" | "d" | "unscored" : "unscored";
    profile = addProfiles(profile, impactsForMatchedChoice(choiceId, item.scoringChoices));
  }
  return profile;
}

function buildPrompt(input: ReportRequest, userTexts: string[]) {
  const languageName = input.language === "da" ? "dansk" : "English";
  const dominant = (Object.entries(input.valueProfile) as [keyof ValueProfile, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key]) => valueLabelsByLanguage[input.language][key]);
  const areas = [...new Set(input.completedDilemmas.map((item) => item.problemArea))];
  const choiceSummary = input.completedDilemmas
    .map((item) => `${item.city}, ${item.country}: ${item.problemArea} → ${item.selectedChoiceLabel}`)
    .join("\n");
  const quotedTexts = userTexts.length
    ? userTexts.map((entry) => `"${entry}"`).join("\n")
    : "Ingen egne ord — brugeren har kun valgt blandt mulighederne.";
  // The traveller's own words, not a character sketch of them.
  const personaLine = [
    input.answers?.hope.trim() ? `Det den rejsende håbede på: "${input.answers.hope.trim()}"` : "",
    input.answers?.fear.trim() ? `Det den rejsende frygtede: "${input.answers.fear.trim()}"` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `Du skriver en personlig fremtidsprofil til afslutningen af World 2046, en dansk interaktiv fremtidssimulation.

${personaLine}
Dominerende værdier: ${dominant.join(", ")}
Problemområder mødt: ${areas.join(", ")}
Valg undervejs:
${choiceSummary}

Brugerens egne ord (citér ordret, hvis relevant):
${quotedTexts}

Opgave:
1. Skriv en overskrift (headline), maks 64 tegn.
2. Skriv en personlig narrativ fremtidsprofil i 2. person, maks 950 tegn. Ingen ros-floskler, ingen generisk positivitet.
3. Citér op til 3 af brugerens egne ord ORDRET (kun hvis der findes egne ord ovenfor) — hver quote skal være et eksakt uddrag, og context skal sige hvor/hvornår.
4. List 2-4 mønstre på tværs af valgene, hver maks 60 tegn.
5. Skriv en kort reflectionNote, maks 220 tegn, der stiller ét åbent spørgsmål tilbage til brugeren.
6. Skriv på ${languageName}.
7. Beskriv spændinger i valgene som observationer, ikke som en personlighedstest eller diagnose. Brug konkrete situationer og undgå ros-floskler.
8. Returnér kun JSON, intet andet.`;
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    headline: { type: "string", maxLength: 64 },
    narrative: { type: "string", maxLength: 950 },
    quotes: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          quote: { type: "string", maxLength: 160 },
          context: { type: "string", maxLength: 90 },
        },
        required: ["quote", "context"],
      },
    },
    patterns: { type: "array", minItems: 2, maxItems: 4, items: { type: "string", maxLength: 60 } },
    reflectionNote: { type: "string", maxLength: 220 },
  },
  required: ["headline", "narrative", "quotes", "patterns", "reflectionNote"],
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ReportRequest>;
  if (!Array.isArray(body.completedDilemmas)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input: ReportRequest = {
    answers: body.answers,
    completedDilemmas: body.completedDilemmas.map((item) => ({
      ...item,
      customAnswer: item.customAnswer?.slice(0, 400),
      reflection: item.reflection?.slice(0, 400),
    })),
    valueProfile: body.valueProfile ?? emptyValueProfile,
    language: body.language === "en" ? "en" : "da",
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return reportError("missing_openai_api_key");

  const userTexts = collectUserTexts(input.completedDilemmas);

  try {
    // Scoring first, and as its own call: the report writer receives the profile
    // as a given, exactly as it did before. If it produced the numbers it then
    // narrates, it would be marking its own homework.
    const valueProfile = await scoreWrittenAnswers(input, apiKey);
    const scored: ReportRequest = { ...input, valueProfile };

    const outcome = await requestJson<unknown>({
      apiKey,
      schemaName: "world2046_report",
      schema: responseSchema,
      prompt: buildPrompt(scored, userTexts),
      language: scored.language,
      temperature: 0.85,
    });
    if ("error" in outcome) return reportError(outcome.error);

    const report = validateReport(outcome.data, userTexts);
    if (!report) return reportError("invalid_ai_report");

    return NextResponse.json({ source: "openai", report, valueProfile });
  } catch {
    return reportError("openai_exception");
  }
}
