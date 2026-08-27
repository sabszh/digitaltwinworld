import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { userRoles } from "@/data/taxonomies";
import { creativeDilemmaSchema, validateCreativeDilemma } from "@/lib/creativeDilemma";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { requestJson } from "@/lib/openaiJson";
import type { JsonUsage } from "@/lib/openaiJson";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import type { DilemmaSeed } from "@/lib/roundPlan";
import type { CompletedDilemma, ValueProfile } from "@/types/world2046";

type EvalCase = {
  index: number;
  role: DilemmaGenerationRequest["role"];
  model: string;
  seed: {
    developmentId: string;
    development: string;
    themes: string[];
    city: string;
    country: string;
    sameRoleExampleId: string;
    relatedQuestionExampleId: string;
  };
  usage?: JsonUsage;
  transportError?: string;
  raw?: CreativeDilemma;
  validation: { accepted: true } | { accepted: false; reason: string };
};

const zeroes: ValueProfile = {
  trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0,
  safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0,
};

function loadEnvLocal() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function historyEntry(seed: DilemmaSeed, index: number): CompletedDilemma {
  return {
    dilemmaId: `eval-${index}`,
    problemArea: "Digital tillid, rettigheder og styring",
    region: seed.location.region,
    country: seed.location.country,
    city: seed.location.city,
    locationType: "hjemmet",
    technology: "personlig data-agent",
    question: "Eval seed",
    presented: { title: "Eval seed", scene: "Eval seed", choices: [] },
    futurePressureId: seed.development.id,
    selectedChoiceId: "__eval__",
    selectedChoiceLabel: "__eval__",
    valueImpacts: zeroes,
  };
}

function renderCase(item: EvalCase) {
  const raw = item.raw;
  const status = item.validation.accepted ? "TEKNISK GODKENDT" : `AFVIST (${item.validation.reason})`;
  return [
    `## ${item.index}. ${item.role} — ${status}`,
    "",
    `- Model: ${item.model}`,
    `- Development: ${item.seed.development} (\`${item.seed.developmentId}\`)`,
    `- Sted: ${item.seed.city}, ${item.seed.country}`,
    `- Examples: \`${item.seed.sameRoleExampleId}\` + \`${item.seed.relatedQuestionExampleId}\``,
    `- Latency/tokens: ${item.usage?.latencyMs ?? 0} ms · ${item.usage?.inputTokens ?? 0} input · ${item.usage?.outputTokens ?? 0} output`,
    "",
    ...(raw ? [
      `### ${raw.title}`,
      "",
      `**Future normal:** ${raw.futureNormal}`,
      "",
      `**Human cost:** ${raw.humanCost}`,
      "",
      `**Decision:** ${raw.decision}`,
      "",
      raw.scene,
      "",
      `**Det står på spil:** ${raw.stake}`,
      "",
      `**${raw.question}**`,
      "",
      ...raw.choices.map((choice) => `${choice.id.toUpperCase()}. **${choice.label}** — ${choice.consequence}`),
    ] : ["Intet model-JSON blev returneret."]),
    "",
    "### Redaktionel scoring",
    "",
    "Afventer uredigeret redaktionel gennemgang efter den bounded kørsel.",
    "",
  ].join("\n");
}

describe("bounded golden-example production diagnostic", () => {
  it("runs exactly twenty Terra generations with no retries", async () => {
    loadEnvLocal();
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the bounded diagnostic");

    const roles = userRoles.flatMap((role) => [role, role]);
    expect(roles).toHaveLength(20);
    const history: CompletedDilemma[] = [];
    const plans = roles.map((role, index) => {
      const seed = selectDilemmaSeed(history, role, (max) => index % max);
      history.push(historyEntry(seed, index));
      return { role, seed };
    });
    expect(new Set(plans.map(({ seed }) => seed.development.id)).size).toBe(20);
    expect(new Set(plans.map(({ seed }) => seed.location.city)).size).toBe(20);

    const results: EvalCase[] = [];
    let calls = 0;
    for (let index = 0; index < plans.length; index += 1) {
      if (calls >= 20) throw new Error("Hard stop: refusing a twenty-first authoring call");
      const { role, seed } = plans[index];
      const input: DilemmaGenerationRequest = {
        role,
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
        schemaName: "world2046_golden_examples_eval",
        schema: creativeDilemmaSchema,
        prompt: buildDilemmaPrompt(input),
        language: "da",
        timeoutMs: 90_000,
      });
      const base = {
        index: index + 1,
        role,
        model: "gpt-5.6-terra",
        seed: {
          developmentId: seed.development.id,
          development: seed.development.development,
          themes: seed.development.themes,
          city: seed.location.city,
          country: seed.location.country,
          sameRoleExampleId: seed.examples.sameRole.id,
          relatedQuestionExampleId: seed.examples.relatedQuestion.id,
        },
      };
      if ("error" in outcome) {
        results.push({ ...base, usage: outcome.usage, transportError: outcome.error, validation: { accepted: false, reason: outcome.error } });
        continue;
      }
      const validation = validateCreativeDilemma(outcome.data, input);
      results.push({
        ...base,
        usage: outcome.usage,
        raw: outcome.data,
        validation: "creative" in validation
          ? { accepted: true }
          : { accepted: false, reason: validation.reason },
      });
    }

    const summary = {
      calls,
      model: "gpt-5.6-terra",
      accepted: results.filter((item) => item.validation.accepted).length,
      rejected: results.filter((item) => !item.validation.accepted).length,
      inputTokens: results.reduce((sum, item) => sum + (item.usage?.inputTokens ?? 0), 0),
      outputTokens: results.reduce((sum, item) => sum + (item.usage?.outputTokens ?? 0), 0),
      averageLatencyMs: Math.round(results.reduce((sum, item) => sum + (item.usage?.latencyMs ?? 0), 0) / results.length),
    };
    writeFileSync("dilemma-golden-examples-eval-raw.json", `${JSON.stringify({ summary, cases: results }, null, 2)}\n`);
    writeFileSync("dilemma-golden-examples-eval.md", [
      "# World 2046 — developments + golden examples eval",
      "",
      "Præcis 20 Terra authoring-kald: to per rolle, ingen retries og ingen regeneration.",
      "",
      "## Setup",
      "",
      `- Model: ${summary.model}`,
      `- Teknisk accepteret: ${summary.accepted}/20`,
      `- Gennemsnitlig latency: ${summary.averageLatencyMs} ms`,
      `- Tokens: ${summary.inputTokens} input · ${summary.outputTokens} output`,
      "",
      ...results.map(renderCase),
    ].join("\n"));

    expect(calls).toBe(20);
    expect(results).toHaveLength(20);
  }, 2_400_000);
});
