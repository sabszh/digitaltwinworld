import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_DILEMMA_MODEL, DEFAULT_UTILITY_MODEL, dilemmaModel, utilityModel } from "@/lib/openaiJson";

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
