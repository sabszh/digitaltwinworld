import type { Language } from "@/lib/i18n";

export const DEFAULT_UTILITY_MODEL = "gpt-5.6-luna";
export const DEFAULT_DILEMMA_MODEL = "gpt-5.6-terra";
/** Backwards-compatible default for report and other utility calls. */
export const DEFAULT_MODEL = DEFAULT_UTILITY_MODEL;

export function utilityModel() {
  return process.env.UTILITY_MODEL ?? process.env.OPENAI_MODEL ?? DEFAULT_UTILITY_MODEL;
}

export function dilemmaModel() {
  return process.env.DILEMMA_MODEL ?? DEFAULT_DILEMMA_MODEL;
}

/**
 * Per-family sampling. The two families take mutually exclusive knobs, and
 * passing the wrong one fails the whole request rather than being ignored.
 *
 * gpt-4.x: an explicit 0.95 matters — on the default the generator came back
 * with the same handful of scenes all journey.
 * Reasoning models: temperature is rejected outright, and left to its own
 * devices the model spends 2-3k reasoning tokens and 30-37 s on one dilemma,
 * which blows the client's request timeout (UX_TIMING.dilemmaFetchTimeoutMs) so every
 * round would fall back. "low" lands around 13 s with the reasoning that
 * actually helps here.
 */
export function samplingFor(model: string, temperature = 0.95) {
  return /^gpt-(4|3)/.test(model) ? { temperature } : { reasoning_effort: "low" };
}

export type JsonRequest = {
  apiKey: string;
  /** Names the schema for the API; also what shows up in OpenAI's logs. */
  schemaName: string;
  schema: Record<string, unknown>;
  prompt: string;
  language: Language;
  /** Appended to the shared "return only JSON" system line. */
  systemNote?: string;
  /** Only reaches gpt-4/3 models; reasoning models refuse the knob entirely. */
  temperature?: number;
  /** Avoid a stalled provider request holding an interaction or an evaluation
   * forever. Callers already have fallback/retry behaviour for an error. */
  timeoutMs?: number;
  /** Different jobs have different quality/cost needs. */
  model?: string;
  reasoningEffort?: "low" | "medium" | "high";
};

export type JsonUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
};

export type JsonResult<T> = { data: T; usage: JsonUsage } | { error: string; usage?: JsonUsage };

/**
 * One JSON-schema chat completion.
 *
 * Extracted because three call sites had each grown their own copy, and they had
 * already drifted apart: the report route still defaulted to gpt-4.1-mini and
 * sent a temperature unconditionally, so pointing OPENAI_MODEL at the documented
 * default made every report fail its transport check and fall back silently.
 * Anything model-shaped belongs here now, so a fix lands once.
 */
export async function requestJson<T>({
  apiKey,
  schemaName,
  schema,
  prompt,
  language,
  systemNote,
  temperature,
  timeoutMs = 20_000,
  model: requestedModel,
  reasoningEffort,
}: JsonRequest): Promise<JsonResult<T>> {
  const model = requestedModel ?? utilityModel();
  const system = [
    `Return only valid JSON matching the schema. Write all audience-facing text in ${language === "da" ? "Danish" : "English"}. No markdown.`,
    systemNote,
  ]
    .filter(Boolean)
    .join(" ");

  let response: Response;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        ...samplingFor(model, temperature),
        ...(!/^gpt-(4|3)/.test(model) && reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: schemaName, strict: true, schema },
        },
      }),
    });
  } catch {
    return { error: controller.signal.aborted ? "openai_timeout" : "openai_unreachable" };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) return { error: `openai_${response.status}` };

  const body = await response.json();
  const usage: JsonUsage = {
    model: typeof body?.model === "string" ? body.model : model,
    inputTokens: Number(body?.usage?.prompt_tokens) || 0,
    outputTokens: Number(body?.usage?.completion_tokens) || 0,
    totalTokens: Number(body?.usage?.total_tokens) || 0,
    latencyMs: Date.now() - startedAt,
  };
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) return { error: "empty_openai_response", usage };

  try {
    return { data: JSON.parse(content) as T, usage };
  } catch {
    return { error: "unparseable_openai_response", usage };
  }
}
