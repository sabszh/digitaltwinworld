import { buildFallbackReport } from "@/lib/profileScoring";
import { emptyValueProfile, valueLabelsByLanguage } from "@/data/taxonomies";
import type { CompletedDilemma, FutureProfileReport, Persona, ValueProfile } from "@/types/world2046";
import { NextResponse } from "next/server";
import type { Language } from "@/lib/i18n";

export const runtime = "nodejs";

type ReportRequest = {
  persona?: Persona;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  language: Language;
};

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value: unknown): value is string => typeof value === "string";

const fallback = (input: ReportRequest, reason: string) =>
  NextResponse.json({ source: "fallback", reason, report: buildFallbackReport(input.completedDilemmas, input.valueProfile, input.language) });

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
  const personaLine = input.persona ? `Rejsende: "${input.persona.title}" — ${input.persona.text}` : "";

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
    persona: body.persona,
    completedDilemmas: body.completedDilemmas.map((item) => ({
      ...item,
      customAnswer: item.customAnswer?.slice(0, 400),
      reflection: item.reflection?.slice(0, 400),
    })),
    valueProfile: body.valueProfile ?? emptyValueProfile,
    language: body.language === "en" ? "en" : "da",
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback(input, "missing_openai_api_key");

  const userTexts = collectUserTexts(input.completedDilemmas);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        temperature: 0.85,
        messages: [
          { role: "system", content: `Return only valid JSON matching the schema. Write in ${input.language === "da" ? "Danish" : "English"}. No markdown.` },
          { role: "user", content: buildPrompt(input, userTexts) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "world2046_report",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });

    if (!response.ok) return fallback(input, `openai_${response.status}`);

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!isString(content)) return fallback(input, "empty_openai_response");

    const parsed = JSON.parse(content);
    const report = validateReport(parsed, userTexts);
    if (!report) return fallback(input, "invalid_ai_report");

    return NextResponse.json({ source: "openai", report });
  } catch {
    return fallback(input, "openai_exception");
  }
}
