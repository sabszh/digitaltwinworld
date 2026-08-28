import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_DILEMMA_MODEL,
  DEFAULT_UTILITY_MODEL,
  dilemmaModel,
  requestJson,
  utilityModel,
} from "@/lib/openaiJson";

const original = {
  DILEMMA_MODEL: process.env.DILEMMA_MODEL,
  UTILITY_MODEL: process.env.UTILITY_MODEL,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
};

afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("task-specific OpenAI models", () => {
  it("defaults creative dilemmas to Terra and utilities to Luna", () => {
    delete process.env.DILEMMA_MODEL;
    delete process.env.UTILITY_MODEL;
    delete process.env.OPENAI_MODEL;
    expect(dilemmaModel()).toBe(DEFAULT_DILEMMA_MODEL);
    expect(utilityModel()).toBe(DEFAULT_UTILITY_MODEL);
  });

  it("configures creative and utility work independently", () => {
    process.env.DILEMMA_MODEL = "creative-model";
    process.env.UTILITY_MODEL = "utility-model";
    process.env.OPENAI_MODEL = "legacy-model";
    expect(dilemmaModel()).toBe("creative-model");
    expect(utilityModel()).toBe("utility-model");
  });
});

describe("requestJson completion budget", () => {
  it("sends the supported max_completion_tokens parameter", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      model: "gpt-5.6-terra",
      choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await requestJson({
      apiKey: "test-key",
      model: "gpt-5.6-terra",
      schemaName: "bounded_test",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: { ok: { type: "boolean" } },
        required: ["ok"],
      },
      prompt: "Return a bounded object.",
      language: "en",
      maxCompletionTokens: 2_400,
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.max_completion_tokens).toBe(2_400);
    expect(body).not.toHaveProperty("max_tokens");
  });
});
