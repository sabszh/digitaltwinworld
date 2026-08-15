import { userRoles } from "@/data/taxonomies";
import { buildLocalPersona } from "@/lib/persona";
import type { Persona, PersonaAnswers, UserRole } from "@/types/world2046";
import { NextResponse } from "next/server";
import type { Language } from "@/lib/i18n";

export const runtime = "nodejs";

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value: unknown): value is string => typeof value === "string";

type PersonaRequest = PersonaAnswers & { language: Language };

const fallback = (input: PersonaRequest, reason: string) =>
  NextResponse.json({ source: "fallback", reason, persona: buildLocalPersona(input, input.language) });

// The player has to be able to see themselves in the persona. An asserted age the
// user never gave breaks that instantly, so treat it as an invalid generation and
// fall back to the deterministic text rather than shipping a fabricated fact.
const assertsAge = [
  /\b(?:er|på)\s+\d{1,3}\s*[-\s]?år\b/i,
  /\b\d{1,3}\s*-?årig/i,
  /\b(?:are|aged)\s+\d{1,3}\b/i,
  /\b\d{1,3}\s+years?\s+old\b/i,
];

function validatePersona(value: unknown, answers: PersonaAnswers): Persona | undefined {
  if (!isRecord(value)) return undefined;
  if (!isString(value.title) || value.title.length === 0 || value.title.length > 44) return undefined;
  if (!isString(value.text) || value.text.length === 0 || value.text.length > 340) return undefined;
  if (assertsAge.some((pattern) => pattern.test(value.text as string))) return undefined;
  if (!Array.isArray(value.traits) || value.traits.length === 0 || !value.traits.every(isString)) return undefined;

  return {
    role: answers.role,
    title: value.title,
    text: value.text,
    traits: (value.traits as string[]).slice(0, 3),
    answers,
    source: "openai",
  };
}

function buildPrompt(input: PersonaRequest) {
  const languageName = input.language === "da" ? "dansk" : "English";
  return `Du designer en kort personlig rejsende-persona til World 2046.

Brugeren har svaret:
Rolle: ${input.role}
Hvad betyder mest for dem: "${input.matters.slice(0, 300) || "ikke angivet"}"
Håb/frygt for 2046: "${input.hopeFear.slice(0, 300) || "ikke angivet"}"

Opgave:
1. Skriv en kort persona i 2. person, maks 320 tegn.
2. Byg UDELUKKENDE på det brugeren selv har svaret ovenfor.
3. Opfind ALDRIG alder, bopæl, køn, familieforhold, jobtitel, indkomst eller andre
   personlige kendsgerninger. Brugeren skal kunne se sig selv i personaen, og én
   påstået detalje der ikke passer, bryder indlevelsen med det samme.
   Skriv altså aldrig "Du er 38 år" eller "du bor i en mellemstor by".
4. Beskriv hvad brugeren er optaget af og opmærksom på — holdninger, ikke demografi.
5. Brug brugerens egne ord eller mening mindst én gang, naturligt indflettet.
6. Ingen navne, ingen CPR-agtige detaljer, ingen overdrivelser.
7. Skriv en kort titel til personaen, maks 44 tegn, fx "Den nysgerrige forælder".
8. Angiv præcis 3 korte egenskabsord (traits), hver maks 20 tegn.
9. Skriv på ${languageName}.
10. Skriv som et menneskeligt dokumentarportræt: konkret, roligt og uden personlighedstest-floskler.
11. Returnér kun JSON, intet andet.`;
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string", maxLength: 44 },
    text: { type: "string", maxLength: 340 },
    traits: { type: "array", items: { type: "string", maxLength: 20 }, minItems: 3, maxItems: 3 },
  },
  required: ["title", "text", "traits"],
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PersonaRequest>;
  if (!body.role || !userRoles.includes(body.role as UserRole) || !isString(body.matters) || !isString(body.hopeFear)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input: PersonaAnswers = {
    role: body.role as UserRole,
    matters: body.matters.slice(0, 300),
    hopeFear: body.hopeFear.slice(0, 300),
    mattersViaVoice: Boolean(body.mattersViaVoice),
    hopeFearViaVoice: Boolean(body.hopeFearViaVoice),
  };
  const localizedInput: PersonaRequest = { ...input, language: body.language === "en" ? "en" : "da" };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback(localizedInput, "missing_openai_api_key");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: `Return only valid JSON. Write in ${localizedInput.language === "da" ? "Danish" : "English"}. No markdown.` },
          { role: "user", content: buildPrompt(localizedInput) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "world2046_persona",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });

    if (!response.ok) return fallback(localizedInput, `openai_${response.status}`);

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!isString(content)) return fallback(localizedInput, "empty_openai_response");

    const parsed = JSON.parse(content);
    const persona = validatePersona(parsed, input);
    if (!persona) return fallback(localizedInput, "invalid_ai_persona");

    return NextResponse.json({ source: "openai", persona });
  } catch {
    return fallback(localizedInput, "openai_exception");
  }
}
