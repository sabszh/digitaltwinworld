import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { creativeDilemmaSchema, validateCreativeDilemma } from "@/lib/creativeDilemma";
import type { AiDilemma, CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { locationTypes, responseSchema, technologies, validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import type { JsonUsage } from "@/lib/openaiJson";
import { requestJson } from "@/lib/openaiJson";
import { buildDilemmaPrompt, buildLegacyDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { planRound } from "@/lib/roundPlan";
import type { RoundPlan } from "@/lib/roundPlan";
import type { UserRole } from "@/types/world2046";

const CASES: Array<{ role: UserRole; hope: string; fear: string }> = [
  { role: "Barn", hope: "at der er plads til at lege og være sammen", fear: "at computere bestemmer for meget" },
  { role: "Ung", hope: "at der stadig er tid til at kede sig", fear: "at man aldrig får fred for at blive målt" },
  { role: "Forælder", hope: "at mine børn kan bo tæt på os", fear: "at hverdagen bliver for dyr for almindelige familier" },
  { role: "Lærer / pædagog", hope: "at der er plads til de elever, der ikke passer ind", fear: "at faglighed bliver noget, man køber sig til" },
  { role: "Fagperson", hope: "at vi tør bruge teknologien til det, der er svært", fear: "at ingen længere kan svare på hvorfor" },
  { role: "Arbejdsgiver", hope: "at nye løsninger kan skabe en sund og robust arbejdsplads", fear: "at effektivitet gør mennesker til tal" },
  { role: "Medarbejder", hope: "at teknologi giver mere tid til det arbejde, der betyder noget", fear: "at blive målt og vurderet uden selv at blive hørt" },
  { role: "For alle", hope: "at teknologi gør hverdagen lettere for flere", fear: "at nogen bliver glemt, når alt bliver digitalt" },
  { role: "Borger", hope: "at fælles løsninger stadig føles retfærdige", fear: "at miste indflydelse på mit eget liv" },
  { role: "Beslutningstager", hope: "at vi kan handle tidligt på de store problemer", fear: "at gevinsterne skjuler hvem der betaler prisen" },
];

type SetupId = "A" | "B" | "C";
type EvalSetup = { id: SetupId; label: string; model: string; simplified: boolean };
const SETUPS: EvalSetup[] = [
  { id: "A", label: "baseline", model: "gpt-5.6-luna", simplified: false },
  { id: "B", label: "simplified", model: "gpt-5.6-luna", simplified: true },
  { id: "C", label: "simplified + Terra", model: "gpt-5.6-terra", simplified: true },
];

type EvalCase = {
  setup: SetupId;
  role: UserRole;
  planIndex: number;
  model: string;
  plan: {
    futurePressureId: string;
    pressure: string;
    responses: string[];
    problemAreas: string[];
    city: string;
    country: string;
  };
  usage?: JsonUsage;
  transportError?: string;
  raw?: AiDilemma | CreativeDilemma;
  validation: { accepted: true } | { accepted: false; reason: string };
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

function fixedPlan(index: number, item: typeof CASES[number]): RoundPlan {
  const pick = (max: number) => index % max;
  return planRound([], pick, `${item.hope} ${item.fear}`);
}

function requestFor(item: typeof CASES[number], plan: RoundPlan): DilemmaGenerationRequest {
  return {
    role: item.role,
    answers: { role: item.role, hope: item.hope, fear: item.fear },
    previousDilemmas: [],
    preferredSeverity: "low",
    language: "da",
    generationPlan: plan,
  };
}

function renderCase(item: EvalCase) {
  const raw = item.raw;
  const status = item.validation.accepted ? "GODKENDT" : `AFVIST (${item.validation.reason})`;
  const choices = raw && Array.isArray(raw.choices)
    ? raw.choices.map((choice, index) => `${index + 1}. **${choice.label}** — ${choice.description} → ${choice.consequence}`)
    : [];
  return [
    `### ${item.setup}${item.planIndex + 1}. ${item.role} — ${status}`,
    "",
    `- Plan: ${item.plan.futurePressureId} · ${item.plan.city}, ${item.plan.country}`,
    `- Model: ${item.model}`,
    `- Latency/tokens: ${item.usage?.latencyMs ?? 0} ms · ${item.usage?.inputTokens ?? 0} in · ${item.usage?.outputTokens ?? 0} out`,
    ...(raw ? [
      "",
      `#### ${raw.title}`,
      "",
      raw.landingScene ?? "",
      "",
      raw.scenePrompt,
      "",
      `*${raw.stake}*`,
      "",
      `**${raw.question}**`,
      "",
      ...choices,
    ] : ["", "Intet model-JSON blev returneret."]),
    "",
  ].join("\n");
}

describe("bounded A/B/C dilemma diagnostic", () => {
  it("runs the same ten plans once per setup with no retries", async () => {
    loadEnvLocal();
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the bounded diagnostic");
    expect(CASES).toHaveLength(10);

    const plans = CASES.map((item, index) => fixedPlan(index, item));
    const calls: Record<SetupId, number> = { A: 0, B: 0, C: 0 };
    const results: EvalCase[] = [];

    for (const setup of SETUPS) {
      for (let index = 0; index < CASES.length; index += 1) {
        if (calls[setup.id] >= 10) throw new Error(`Hard stop: refusing an eleventh ${setup.id} call`);
        const item = CASES[index];
        const plan = plans[index];
        const input = requestFor(item, plan);
        calls[setup.id] += 1;

        const common = {
          apiKey: process.env.OPENAI_API_KEY,
          model: setup.model,
          reasoningEffort: "low" as const,
          language: input.language,
          timeoutMs: 60_000,
        };
        const outcome = setup.simplified
          ? await requestJson<CreativeDilemma>({
              ...common,
              schemaName: `world2046_eval_${setup.id.toLowerCase()}`,
              schema: creativeDilemmaSchema,
              prompt: buildDilemmaPrompt(input),
            })
          : await requestJson<AiDilemma>({
              ...common,
              schemaName: "world2046_eval_a",
              schema: responseSchema,
              prompt: buildLegacyDilemmaPrompt(input, { technologies, locationTypes }),
            });

        const base = {
          setup: setup.id,
          role: item.role,
          planIndex: index,
          model: setup.model,
          plan: {
            futurePressureId: plan.pressure.id,
            pressure: plan.pressure.pressure,
            responses: plan.responses,
            problemAreas: plan.problemAreas,
            city: plan.location.city,
            country: plan.location.country,
          },
        } as const;

        if ("error" in outcome) {
          results.push({ ...base, usage: outcome.usage, transportError: outcome.error, validation: { accepted: false, reason: outcome.error } });
          continue;
        }

        const validation = setup.simplified
          ? validateCreativeDilemma(outcome.data, input)
          : validateAiDilemmaDetailed(outcome.data, input);
        results.push({
          ...base,
          usage: outcome.usage,
          raw: outcome.data,
          validation: "creative" in validation || "dilemma" in validation
            ? { accepted: true }
            : { accepted: false, reason: validation.reason },
        });
      }
    }

    const summary = SETUPS.map((setup) => {
      const items = results.filter((item) => item.setup === setup.id);
      return {
        setup: setup.id,
        label: setup.label,
        model: setup.model,
        accepted: items.filter((item) => item.validation.accepted).length,
        attempts: items.length,
        averageLatencyMs: Math.round(items.reduce((sum, item) => sum + (item.usage?.latencyMs ?? 0), 0) / items.length),
        inputTokens: items.reduce((sum, item) => sum + (item.usage?.inputTokens ?? 0), 0),
        outputTokens: items.reduce((sum, item) => sum + (item.usage?.outputTokens ?? 0), 0),
      };
    });

    writeFileSync("dilemma-comparison-raw.json", `${JSON.stringify({ calls, plans, summary, cases: results }, null, 2)}\n`);
    writeFileSync("dilemma-comparison.md", [
      "# World 2046 A/B/C diagnostic",
      "",
      "Samme 10 planer i hvert setup. Ét authoring-kald per rolle per setup. Ingen retries eller regenerationer.",
      "",
      "## Automatisk summary",
      "",
      ...summary.map((item) => `- ${item.setup}: ${item.accepted}/${item.attempts} accepted · ${item.averageLatencyMs} ms avg · ${item.inputTokens} input · ${item.outputTokens} output`),
      "",
      ...SETUPS.flatMap((setup) => [
        `## Setup ${setup.id} — ${setup.label}`,
        "",
        ...results.filter((item) => item.setup === setup.id).map(renderCase),
      ]),
    ].join("\n"));

    expect(calls).toEqual({ A: 10, B: 10, C: 10 });
    expect(results).toHaveLength(30);
  }, 1_800_000);
});
