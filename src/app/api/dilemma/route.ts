import { userRoles } from "@/data/taxonomies";
import { haversineKm } from "@/lib/aporee";
import { creativeDilemmaSchema, enrichCreativeDilemma, validateCreativeDilemma } from "@/lib/creativeDilemma";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { locatePlace } from "@/lib/geocode";
import { dilemmaModel, requestJson } from "@/lib/openaiJson";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { planRound } from "@/lib/roundPlan";
import { scoreDilemmaValues } from "@/lib/valueScoring";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const generationError = (reason: string) => NextResponse.json({ error: reason }, { status: 502 });
const GENERATION_TIMEOUT_MS = 40_000;
const RETRY_BUDGET_MS = 9_000;

type Attempt =
  | { transport: string }
  | { validation: ReturnType<typeof validateCreativeDilemma> };

async function requestDilemma(input: DilemmaGenerationRequest, apiKey: string): Promise<Attempt> {
  const outcome = await requestJson<CreativeDilemma>({
    apiKey,
    model: dilemmaModel(),
    reasoningEffort: "medium",
    schemaName: "world2046_creative_dilemma",
    schema: creativeDilemmaSchema,
    prompt: buildDilemmaPrompt(input),
    language: input.language,
    timeoutMs: GENERATION_TIMEOUT_MS,
  });
  if ("error" in outcome) return { transport: outcome.error };
  return { validation: validateCreativeDilemma(outcome.data, input) };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<DilemmaGenerationRequest>;
  if (!body.role || !userRoles.includes(body.role) || !Array.isArray(body.previousDilemmas)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input: DilemmaGenerationRequest = {
    role: body.role,
    answers: body.answers,
    previousDilemmas: body.previousDilemmas,
    preferredSeverity: body.preferredSeverity === "medium" ? "medium" : "low",
    language: body.language === "en" ? "en" : "da",
    generationPlan: planRound(
      body.previousDilemmas,
      undefined,
      [body.answers?.hope, body.answers?.fear].filter(Boolean).join(" "),
    ),
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return generationError("missing_openai_api_key");

  try {
    let creative: CreativeDilemma | undefined;
    let lastReason = "unknown";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const startedAt = Date.now();
      const outcome = await requestDilemma(input, apiKey);
      if ("transport" in outcome) return generationError(outcome.transport);
      if ("creative" in outcome.validation) {
        creative = outcome.validation.creative;
        break;
      }
      lastReason = outcome.validation.reason;
      console.warn(`[dilemma] rejected ${lastReason} (attempt ${attempt + 1})`);
      if (Date.now() - startedAt > RETRY_BUDGET_MS) break;
    }
    if (!creative || !input.generationPlan) return generationError(`rejected_${lastReason}`);

    const impacts = await scoreDilemmaValues(creative, apiKey, input.language);
    const dilemma = enrichCreativeDilemma(creative, input, input.generationPlan, impacts);

    if (creative.placeHint?.trim()) {
      const located = await locatePlace(
        { name: creative.placeHint, city: dilemma.city, country: dilemma.country },
        dilemma.marker,
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        haversineKm,
      );
      if (located.source === "searchbox") {
        dilemma.marker = located.coordinates;
        dilemma.exactPlace = {
          id: `${input.generationPlan.location.id}-${dilemma.locationType}`,
          name: located.name ?? creative.placeHint,
          address: located.address,
          region: dilemma.region,
          country: dilemma.country,
          city: dilemma.city,
          lat: located.coordinates.lat,
          lng: located.coordinates.lng,
          locationType: dilemma.locationType,
          problemAreas: [dilemma.problemArea],
        };
      }
    }

    return NextResponse.json({ source: "openai", dilemma });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "openai_exception";
    return generationError(reason);
  }
}
