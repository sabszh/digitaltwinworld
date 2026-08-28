import { userRoles } from "@/data/taxonomies";
import { haversineKm } from "@/lib/aporee";
import {
  creativeDilemmaSchema,
  dilemmaDisplayLimits,
  enrichCreativeDilemma,
  trimCreativeText,
  validateCreativeDilemma,
} from "@/lib/creativeDilemma";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { locatePlace } from "@/lib/geocode";
import { dilemmaModel, requestJson } from "@/lib/openaiJson";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import { scoreDilemmaValues } from "@/lib/valueScoring";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const generationError = (reason: string) => NextResponse.json({ error: reason }, { status: 502 });
const GENERATION_TIMEOUT_MS = 50_000;
export const DILEMMA_MAX_COMPLETION_TOKENS = 2_400;

type Attempt =
  | { transport: string }
  | { validation: ReturnType<typeof validateCreativeDilemma> };

async function requestDilemma(
  input: DilemmaGenerationRequest,
  apiKey: string,
  model: string,
  timeoutMs: number,
): Promise<Attempt> {
  const outcome = await requestJson<CreativeDilemma>({
    apiKey,
    model,
    reasoningEffort: "low",
    schemaName: "world2046_creative_dilemma",
    schema: creativeDilemmaSchema,
    prompt: buildDilemmaPrompt(input),
    language: input.language,
    timeoutMs,
    maxCompletionTokens: DILEMMA_MAX_COMPLETION_TOKENS,
  });
  if ("error" in outcome) return { transport: outcome.error };
  return { validation: validateCreativeDilemma(outcome.data, input) };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<DilemmaGenerationRequest>;
  if (!body.role || !userRoles.includes(body.role) || !Array.isArray(body.previousDilemmas)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const generationPlan = selectDilemmaSeed(body.previousDilemmas, body.role);
  const input: DilemmaGenerationRequest = {
    role: body.role,
    answers: body.answers,
    previousDilemmas: body.previousDilemmas,
    preferredSeverity: body.preferredSeverity === "medium" ? "medium" : "low",
    language: body.language === "en" ? "en" : "da",
    generationPlan,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return generationError("missing_openai_api_key");

  try {
    const model = dilemmaModel();
    const outcome = await requestDilemma(input, apiKey, model, GENERATION_TIMEOUT_MS);
    if ("transport" in outcome) {
      console.warn(`[dilemma] ${model} failed: ${outcome.transport}`);
      return generationError(outcome.transport);
    }
    if (!("creative" in outcome.validation)) {
      console.warn(`[dilemma] ${model} rejected ${outcome.validation.reason}`);
      return generationError(`rejected_${outcome.validation.reason}`);
    }
    const creative = outcome.validation.creative;

    const impacts = await scoreDilemmaValues(creative, apiKey, input.language);
    const dilemma = enrichCreativeDilemma(creative, input, generationPlan, impacts);
    const placeHint = trimCreativeText(creative.placeHint ?? "", dilemmaDisplayLimits.placeHint, false);

    if (placeHint) {
      const located = await locatePlace(
        { name: placeHint, city: dilemma.city, country: dilemma.country },
        dilemma.marker,
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        haversineKm,
      );
      if (located.source === "searchbox") {
        dilemma.marker = located.coordinates;
        dilemma.exactPlace = {
          id: `${generationPlan.location.id}-${dilemma.locationType}`,
          name: located.name ?? placeHint,
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
