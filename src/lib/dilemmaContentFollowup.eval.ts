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
  { role: "Lærer / pædagog", developmentId: "public-cooling-rooms" },
  { role: "Lærer / pædagog", developmentId: "driverless-transport-normal" },
  { role: "Arbejdsgiver", developmentId: "synthetic-actors" },
  { role: "Medarbejder", developmentId: "personal-data-agents" },
  { role: "For alle", developmentId: "grid-responsive-homes" },
  { role: "For alle", developmentId: "policy-simulations" },
  { role: "Beslutningstager", developmentId: "ai-administration" },
];

function loadEnvLocal() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function seedFor(index: number, role: UserRole, developmentId: string): DilemmaSeed {
  const development = futureDevelopments.find((item) => item.id === developmentId);
  if (!development) throw new Error(`Unknown development: ${developmentId}`);
  const location = locations[index + 3];
  return {
    round: index === 0 ? 0 : 1,
    development,
    location,
    examples: selectDilemmaExamples(role, development, (max) => index % max),
    severity: index === 0 ? "low" : "medium",
  };
}

describe("bounded content-library follow-up", () => {
  it("runs exactly ten affected cases once each", async () => {
    loadEnvLocal();
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
    expect(CASES).toHaveLength(10);
    const results: unknown[] = [];
    let calls = 0;

    for (let index = 0; index < CASES.length; index += 1) {
      if (calls >= 10) throw new Error("Hard stop: refusing an eleventh call");
      const item = CASES[index];
      const seed = seedFor(index, item.role, item.developmentId);
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
        schemaName: "world2046_content_followup",
        schema: creativeDilemmaSchema,
        prompt: buildDilemmaPrompt(input),
        language: "da",
        timeoutMs: 90_000,
      });
      if ("error" in outcome) {
        results.push({ index: index + 1, ...item, seed, error: outcome.error, usage: outcome.usage });
        continue;
      }
      const validation = validateCreativeDilemma(outcome.data, input);
      results.push({
        index: index + 1,
        ...item,
        seed: {
          development: seed.development.development,
          city: seed.location.city,
          country: seed.location.country,
          sameRoleExampleId: seed.examples.sameRole.id,
          relatedQuestionExampleId: seed.examples.relatedQuestion.id,
        },
        raw: outcome.data,
        usage: outcome.usage,
        validation: "creative" in validation ? { accepted: true } : { accepted: false, reason: validation.reason },
      });
    }

    writeFileSync("dilemma-content-followup-raw.json", `${JSON.stringify({ calls, cases: results }, null, 2)}\n`);
    expect(calls).toBe(10);
    expect(results).toHaveLength(10);
  }, 1_200_000);
});
