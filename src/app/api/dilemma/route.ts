import { userRoles } from "@/data/taxonomies";
import type { AiDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { generateDilemma } from "@/lib/randomizer";
import { locationTypes, responseSchema, technologies, validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import { locatePlace } from "@/lib/geocode";
import { haversineKm } from "@/lib/aporee";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { planRound } from "@/lib/roundPlan";
import { requestJson } from "@/lib/openaiJson";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fallback = (input: DilemmaGenerationRequest, reason: string) =>
  NextResponse.json({
    source: "fallback",
    reason,
    dilemma: generateDilemma(input),
  });

/** How long a single generation may take before a second attempt would risk the
 *  client's 20 s abort (see UX_TIMING.dilemmaFetchTimeoutMs). */
const RETRY_BUDGET_MS = 9000;

type Attempt =
  | { transport: string }
  | { parsed: AiDilemma; result: ReturnType<typeof validateAiDilemmaDetailed> };

async function requestDilemma(input: DilemmaGenerationRequest, apiKey: string): Promise<Attempt> {
  const outcome = await requestJson<AiDilemma>({
    apiKey,
    schemaName: "world2046_dilemma",
    schema: responseSchema,
    prompt: buildDilemmaPrompt(input, { technologies, locationTypes }),
    language: input.language,
  });
  if ("error" in outcome) return { transport: outcome.error };

  const parsed = outcome.data;
  return { parsed, result: validateAiDilemmaDetailed(parsed, input) };
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
    // The traveller's own words steer the opening stop only. planRound ignores
    // them from round two onward, and they are never put in front of the model.
    generationPlan: planRound(
      body.previousDilemmas,
      undefined,
      [body.answers?.hope, body.answers?.fear].filter(Boolean).join(" "),
    ),
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback(input, "missing_openai_api_key");

  try {
    // The content gates reject roughly a third of first attempts — most often
    // because the options never engage the 2046 arrangement. A rejection costs
    // the player a real destination, and a second attempt at the same prompt
    // usually clears it, so retry once when there is time left in the client's
    // budget rather than falling back straight away.
    let dilemma;
    let lastReason = "unknown";
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const startedAt = Date.now();
      const outcome = await requestDilemma(input, apiKey);
      if ("transport" in outcome) return fallback(input, outcome.transport);
      if ("dilemma" in outcome.result) {
        dilemma = outcome.result.dilemma;
        break;
      }

      lastReason = outcome.result.reason;
      const parsed = outcome.parsed;
      console.warn(
        `[dilemma] rejected ${lastReason} (attempt ${attempt + 1})`,
        JSON.stringify({
          round: input.previousDilemmas.length + 1,
          got: { country: parsed?.country, region: parsed?.region, problemArea: parsed?.problemArea },
          used: input.previousDilemmas.map((item) => item.country),
        }),
      );

      if (Date.now() - startedAt > RETRY_BUDGET_MS) break;
    }

    if (!dilemma) return fallback(input, `rejected_${lastReason}`);

    // The model's marker is a guess at the city, not at the building it just
    // named. Put the camera on the real place when we can find it.
    const place = dilemma.exactPlace;
    if (place?.name) {
      const located = await locatePlace(
        { name: place.name, city: dilemma.city, country: dilemma.country },
        dilemma.marker,
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        haversineKm,
      );
      if (located.source === "searchbox") {
        dilemma.marker = located.coordinates;
        dilemma.exactPlace = {
          ...place,
          lat: located.coordinates.lat,
          lng: located.coordinates.lng,
          address: located.address ?? place.address,
        };
      } else {
        // Nothing found usually means the institution does not exist. The
        // dilemma still works; the camera just stays at the city.
        console.warn(`[dilemma] place not found: ${place.name}, ${dilemma.city}`);
      }
    }

    return NextResponse.json({ source: "openai", dilemma });
  } catch {
    return fallback(input, "openai_exception");
  }
}
