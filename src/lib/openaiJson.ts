import type { Language } from "@/lib/i18n";

export const DEFAULT_MODEL = "gpt-5.6-luna";

/**
 * Per-family sampling. The two families take mutually exclusive knobs, and
 * passing the wrong one fails the whole request rather than being ignored.
 *
 * gpt-4.x: an explicit 0.95 matters — on the default the generator came back
 * with the same handful of scenes all journey.
 * Reasoning models: temperature is rejected outright, and left to its own
 * devices the model spends 2-3k reasoning tokens and 30-37 s on one dilemma,
 * which blows the client's 20 s abort (UX_TIMING.dilemmaFetchTimeoutMs) so every
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
};

export type JsonResult<T> = { data: T } | { error: string };

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
}: JsonRequest): Promise<JsonResult<T>> {
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  const system = [
    `Return only valid JSON matching the schema. Write all audience-facing text in ${language === "da" ? "Danish" : "English"}. No markdown.`,
    systemNote,
  ]
    .filter(Boolean)
    .join(" ");

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        ...samplingFor(model, temperature),
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
    return { error: "openai_unreachable" };
  }

  if (!response.ok) return { error: `openai_${response.status}` };

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) return { error: "empty_openai_response" };

  try {
    return { data: JSON.parse(content) as T };
  } catch {
    return { error: "unparseable_openai_response" };
  }
}
