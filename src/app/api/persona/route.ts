import { userRoles } from "@/data/taxonomies";
import { buildLocalPersona } from "@/lib/persona";
import type { Persona, PersonaAnswers, UserRole } from "@/types/world2046";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value: unknown): value is string => typeof value === "string";

const fallback = (input: PersonaAnswers, reason: string) =>
  NextResponse.json({ source: "fallback", reason, persona: buildLocalPersona(input) });

function validatePersona(value: unknown, answers: PersonaAnswers): Persona | undefined {
  if (!isRecord(value)) return undefined;
  if (!isString(value.title) || value.title.length === 0 || value.title.length > 44) return undefined;
  if (!isString(value.text) || value.text.length === 0 || value.text.length > 340) return undefined;
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

function buildPrompt(input: PersonaAnswers) {
  return `Du designer en kort personlig rejsende-persona til World 2046, en dansk interaktiv fremtidssimulation.

Brugeren har svaret:
Rolle: ${input.role}
Hvad betyder mest for dem: "${input.matters.slice(0, 300) || "ikke angivet"}"
Håb/frygt for 2046: "${input.hopeFear.slice(0, 300) || "ikke angivet"}"

Opgave:
1. Skriv en kort persona i 2. person ("Du er ... år, bor i ..."), maks 320 tegn.
2. Brug brugerens egne ord eller mening mindst én gang, naturligt indflettet.
3. Ingen navne, ingen CPR-agtige detaljer, ingen overdrivelser.
4. Skriv en kort titel til personaen, maks 44 tegn, fx "Den nysgerrige forælder".
5. Angiv præcis 3 korte egenskabsord (traits), hver maks 20 tegn.
6. Skriv på dansk.
7. Returnér kun JSON, intet andet.`;
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
  const body = (await request.json()) as Partial<PersonaAnswers>;
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback(input, "missing_openai_api_key");

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
          { role: "system", content: "Du returnerer kun valid JSON, der matcher schemaet. Ingen markdown." },
          { role: "user", content: buildPrompt(input) },
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

    if (!response.ok) return fallback(input, `openai_${response.status}`);

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!isString(content)) return fallback(input, "empty_openai_response");

    const parsed = JSON.parse(content);
    const persona = validatePersona(parsed, input);
    if (!persona) return fallback(input, "invalid_ai_persona");

    return NextResponse.json({ source: "openai", persona });
  } catch {
    return fallback(input, "openai_exception");
  }
}
