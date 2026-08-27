import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getAudienceProfile } from "@/lib/audience";
import type { AiDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { locationTypes, responseSchema, technologies, validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import { requestJson } from "@/lib/openaiJson";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { planRound } from "@/lib/roundPlan";
import type { GeneratedDilemma, UserRole } from "@/types/world2046";

/** Bounded diagnostic: ten roles, one model call each, no retries. */
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

type DiagnosticCase = {
  role: UserRole;
  callNumber: number;
  plan: { futurePressureId: string; response: string; problemAreas: string[]; severity: string };
  transportError?: string;
  raw?: AiDilemma;
  validation: { accepted: true } | { accepted: false; reason: string };
  acceptedDilemma?: GeneratedDilemma;
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

function renderCase(item: DiagnosticCase) {
  const raw = item.raw;
  const status = item.validation.accepted
    ? "GODKENDT"
    : item.transportError
      ? `PROVIDER-FEJL (${item.transportError})`
      : `AFVIST (${item.validation.reason})`;

  return [
    `## ${item.callNumber}. ${item.role} — ${status}`,
    "",
    `- **Plan:** ${item.plan.futurePressureId} · ${item.plan.problemAreas.join(", ")} · ${item.plan.severity}`,
    `- **Planlagt 2046-svar:** ${item.plan.response}`,
    ...(raw ? [
      `- **Modelsted:** ${String(raw.city)}, ${String(raw.country)} · ${String(raw.locationType)}`,
      `- **2046-virkelighed:** ${String(raw.normalized2046)}`,
      `- **Konflikt:** ${String(raw.coreTension?.want)} · men også ${String(raw.coreTension?.butAlsoWant)}`,
      `- **Kan ikke få begge:** ${String(raw.coreTension?.whyCannotHaveBoth)}`,
      "",
      `### ${String(raw.title)}`,
      "",
      String(raw.landingScene),
      "",
      String(raw.scenePrompt),
      "",
      `*${String(raw.stake)}*`,
      "",
      `**${String(raw.question)}**`,
      "",
      ...(Array.isArray(raw.choices)
        ? raw.choices.map((choice, index) => `${index + 1}. **${String(choice.label)}** — ${String(choice.description)} → ${String(choice.consequence)}`)
        : ["Choices mangler."]),
    ] : ["", "Intet model-JSON blev returneret."]),
    "",
  ].join("\n");
}

describe("bounded dilemma generator diagnostic", () => {
  it("makes exactly one model call for each of the ten roles", async () => {
    loadEnvLocal();
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the bounded diagnostic");

    expect(CASES).toHaveLength(10);
    expect(new Set(CASES.map((item) => item.role)).size).toBe(10);

    let modelCalls = 0;
    const results: DiagnosticCase[] = [];

    for (const item of CASES) {
      if (modelCalls >= 10) throw new Error("Hard stop: refusing an eleventh model call");
      const plan = planRound([], undefined, undefined, getAudienceProfile(item.role).preferredProblemAreas);
      const input: DilemmaGenerationRequest = {
        role: item.role,
        answers: { role: item.role, hope: item.hope, fear: item.fear },
        previousDilemmas: [],
        preferredSeverity: "low",
        language: "da",
        generationPlan: plan,
      };

      modelCalls += 1;
      const outcome = await requestJson<AiDilemma>({
        apiKey: process.env.OPENAI_API_KEY,
        schemaName: "world2046_dilemma_bounded_diagnostic",
        schema: responseSchema,
        prompt: buildDilemmaPrompt(input, { technologies, locationTypes }),
        language: input.language,
        timeoutMs: 40_000,
      });

      const planRecord = {
        futurePressureId: plan.pressure.id,
        response: plan.response,
        problemAreas: plan.problemAreas,
        severity: plan.severity,
      };
      if ("error" in outcome) {
        results.push({
          role: item.role,
          callNumber: modelCalls,
          plan: planRecord,
          transportError: outcome.error,
          validation: { accepted: false, reason: outcome.error },
        });
        continue;
      }

      const validation = validateAiDilemmaDetailed(outcome.data, input);
      results.push({
        role: item.role,
        callNumber: modelCalls,
        plan: planRecord,
        raw: outcome.data,
        validation: "dilemma" in validation ? { accepted: true } : { accepted: false, reason: validation.reason },
        acceptedDilemma: "dilemma" in validation ? validation.dilemma : undefined,
      });
    }

    writeFileSync("dilemma-eval-raw.json", `${JSON.stringify({ modelCalls, cases: results }, null, 2)}\n`);
    writeFileSync("dilemma-eval.md", [
      "# Bounded dilemma-diagnostic",
      "",
      `Præcis ${modelCalls} modelkald. Ingen retries eller regenerationer.`,
      "",
      ...results.map(renderCase),
    ].join("\n"));

    expect(modelCalls).toBe(10);
    expect(results).toHaveLength(10);
  }, 600_000);
});
