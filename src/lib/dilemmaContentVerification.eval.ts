import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { selectDilemmaExamples } from "@/data/dilemmaExamples";
import { futureDevelopments } from "@/data/futureDevelopments";
import { locations } from "@/data/locations";
import { creativeDilemmaSchema, validateCreativeDilemma } from "@/lib/creativeDilemma";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { requestJson } from "@/lib/openaiJson";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import type { DilemmaSeed } from "@/lib/roundPlan";
import type { UserRole } from "@/types/world2046";

const CASES: Array<{ role: UserRole; developmentId: string }> = [
  { role: "Barn", developmentId: "digital-deceased" },
  { role: "Barn", developmentId: "ai-simulates-life-choices" },
  { role: "Ung", developmentId: "social-robots-lasting" },
  { role: "For alle", developmentId: "grid-responsive-homes" },
];

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

describe("final content-selection verification", () => {
  it("runs four unresolved cases exactly once", async () => {
    loadEnvLocal();
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
    const results: unknown[] = [];
    let calls = 0;
    for (let index = 0; index < CASES.length; index += 1) {
      if (calls >= 4) throw new Error("Hard stop: refusing a fifth call");
      const item = CASES[index];
      const development = futureDevelopments.find((candidate) => candidate.id === item.developmentId)!;
      const seed: DilemmaSeed = {
        round: index,
        development,
        location: locations[index + 15],
        examples: selectDilemmaExamples(item.role, development, (max) => index % max),
        severity: index === 0 ? "low" : "medium",
      };
      const input: DilemmaGenerationRequest = {
        role: item.role,
        previousDilemmas: [],
        preferredSeverity: seed.severity,
        language: "da",
        generationPlan: seed,
      };
      calls += 1;
      const outcome = await requestJson<CreativeDilemma>({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-5.6-terra",
        reasoningEffort: "low",
        schemaName: "world2046_content_verification",
        schema: creativeDilemmaSchema,
        prompt: buildDilemmaPrompt(input),
        language: "da",
        timeoutMs: 90_000,
      });
      if ("error" in outcome) {
        results.push({ index: index + 1, ...item, error: outcome.error, usage: outcome.usage });
        continue;
      }
      const validation = validateCreativeDilemma(outcome.data, input);
      results.push({
        index: index + 1,
        ...item,
        examples: { sameRole: seed.examples.sameRole.id, related: seed.examples.relatedQuestion.id },
        raw: outcome.data,
        usage: outcome.usage,
        validation: "creative" in validation ? { accepted: true } : { accepted: false, reason: validation.reason },
      });
    }
    writeFileSync("dilemma-content-verification-raw.json", `${JSON.stringify({ calls, cases: results }, null, 2)}\n`);
    expect(calls).toBe(4);
    expect(results).toHaveLength(4);
  }, 600_000);
});
