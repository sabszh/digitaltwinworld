import { userRoles } from "@/data/taxonomies";
import type { AiDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { generateDilemma } from "@/lib/randomizer";
import { isString, locationTypes, responseSchema, technologies, validateAiDilemma } from "@/lib/dilemmaStructuredOutput";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fallback = (input: DilemmaGenerationRequest, reason: string) =>
  NextResponse.json({
    source: "fallback",
    reason,
    dilemma: generateDilemma(input),
  });

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<DilemmaGenerationRequest>;
  if (!body.role || !userRoles.includes(body.role) || !Array.isArray(body.previousDilemmas)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input: DilemmaGenerationRequest = {
    role: body.role,
    persona: body.persona,
    previousDilemmas: body.previousDilemmas,
    preferredSeverity: body.preferredSeverity === "medium" ? "medium" : "low",
    language: body.language === "en" ? "en" : "da",
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
        temperature: 0.95,
        messages: [
          { role: "system", content: `Return only valid JSON matching the schema. Write all audience-facing text in ${input.language === "da" ? "Danish" : "English"}. No markdown.` },
          { role: "user", content: buildDilemmaPrompt(input, { technologies, locationTypes }) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "world2046_dilemma",
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

    const parsed = JSON.parse(content) as AiDilemma;
    const dilemma = validateAiDilemma(parsed, input);
    if (!dilemma) return fallback(input, "invalid_ai_dilemma");

    return NextResponse.json({ source: "openai", dilemma });
  } catch {
    return fallback(input, "openai_exception");
  }
}
