import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { technologies, locationTypes, responseSchema, validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import type { AiDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { CompletedDilemma, GeneratedDilemma, UserRole, ValueProfile } from "@/types/world2046";
import { planRound } from "@/lib/roundPlan";

/**
 * Batch generator for reviewing dilemma quality by hand.
 *
 * Not part of `npm test` — it costs money and calls a live model. Run it with
 *   npm run eval:dilemmas
 * and read the markdown it writes to dilemma-eval.md. It walks whole journeys
 * rather than single rounds, because the things most likely to be wrong now are
 * cross-round: five stops that turn out to be the same stop, or five crises in a
 * row.
 */

const zeroes: ValueProfile = {
  trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0,
  safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0,
};

/** vitest does not read .env.local the way next does. */
function loadEnvLocal() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const JOURNEYS: Array<{ role: UserRole; hope: string; fear: string }> = [
  {
    role: "Ung",
    hope: "at der stadig er tid til at kede sig",
    fear: "at man aldrig får fred for at blive målt",
  },
  {
    role: "Fagperson",
    hope: "at vi tør bruge teknologien til det, der er svært",
    fear: "at ingen længere kan svare på hvorfor",
  },
  {
    role: "Forælder",
    hope: "at mine børn kan bo tæt på os",
    fear: "at hverdagen bliver for dyr for almindelige familier",
  },
  {
    role: "Lærer / pædagog",
    hope: "at der er plads til de elever, der ikke passer ind",
    fear: "at faglighed bliver noget, man køber sig til",
  },
];

const model = process.env.OPENAI_MODEL ?? "gpt-5.6-luna";

async function generateOne(input: DilemmaGenerationRequest): Promise<{ dilemma?: GeneratedDilemma; reason?: string }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      ...(/^gpt-(4|3)/.test(model) ? { temperature: 0.95 } : { reasoning_effort: "low" }),
      messages: [
        {
          role: "system",
          content: `Return only valid JSON matching the schema. Write all audience-facing text in ${input.language === "da" ? "Danish" : "English"}. No markdown.`,
        },
        { role: "user", content: buildDilemmaPrompt(input, { technologies, locationTypes }) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "world2046_dilemma", strict: true, schema: responseSchema },
      },
    }),
  });

  if (!response.ok) return { reason: `openai_${response.status}` };
  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content) as AiDilemma;
  const result = validateAiDilemmaDetailed(parsed, input);
  if ("dilemma" in result) return { dilemma: result.dilemma };
  // Print what was thrown away: a rejection is only worth having if it is
  // possible to tell an over-strict gate from a genuinely bad dilemma.
  console.warn(
    `REJECTED ${result.reason}\n  normalized2046: ${parsed.normalized2046}\n  question: ${parsed.question}\n` +
      (parsed.choices ?? []).map((choice) => `  - ${choice.label} | ${choice.description}`).join("\n"),
  );
  return { reason: result.reason };
}

function render(dilemma: GeneratedDilemma, round: number) {
  return [
    `#### Stop ${round}: ${dilemma.city}, ${dilemma.country} — ${dilemma.exactPlace?.name ?? "?"}`,
    `- **pres:** ${dilemma.futurePressureId} · **relation:** ${dilemma.userRelation} · **severity:** ${dilemma.severity} · **område:** ${dilemma.problemArea}`,
    `- **2046-virkelighed:** ${dilemma.normalized2046}`,
    `- **spænding:** ${dilemma.coreTension?.valueA} ↔ ${dilemma.coreTension?.valueB}`,
    `- **akse:** ${dilemma.decisionAxis}`,
    ``,
    `**${dilemma.title}**`,
    ``,
    `${dilemma.landingScene ?? dilemma.scenePrompt}`,
    ``,
    `*${dilemma.stake ?? ""}*`,
    ``,
    `**${dilemma.question}**`,
    ``,
    ...dilemma.choices.map(
      (choice, index) => `${index + 1}. [pos ${choice.axisPosition}] **${choice.label}** — ${choice.description}`,
    ),
    ``,
  ].join("\n");
}

describe("dilemma generator evaluation", () => {
  it(
    "generates whole journeys for manual review",
    async () => {
      loadEnvLocal();
      if (!process.env.OPENAI_API_KEY) {
        console.warn("No OPENAI_API_KEY — skipping.");
        return;
      }

      const lines: string[] = ["# Dilemma-evaluering", ""];
      const rejected: string[] = [];

      for (const journey of JOURNEYS) {
        lines.push(`## Rejse: ${journey.role}`, "");
        const previous: CompletedDilemma[] = [];

        for (let round = 0; round < 5; round += 1) {
          const input: DilemmaGenerationRequest = {
            role: journey.role,
            answers: { role: journey.role, hope: journey.hope, fear: journey.fear },
            previousDilemmas: previous,
            preferredSeverity: round === 0 ? "low" : "medium",
            language: "da",
            generationPlan: planRound(previous),
          };

          // Same one-retry policy as the API route, so the numbers here are the
          // numbers a player would actually see.
          let { dilemma, reason } = await generateOne(input);
          if (!dilemma) ({ dilemma, reason } = await generateOne(input));
          if (!dilemma) {
            rejected.push(`${journey.role} runde ${round + 1}: ${reason}`);
            lines.push(`#### Stop ${round + 1}: AFVIST (${reason})`, "");
            continue;
          }

          lines.push(render(dilemma, round + 1));
          previous.push({
            dilemmaId: dilemma.id,
            problemArea: dilemma.problemArea,
            region: dilemma.region,
            country: dilemma.country,
            city: dilemma.city,
            exactPlaceName: dilemma.exactPlace?.name,
            locationType: dilemma.locationType,
            technology: dilemma.technology,
            question: dilemma.question,
            futurePressureId: dilemma.futurePressureId,
            coreTension: dilemma.coreTension,
            selectedChoiceId: dilemma.choices[0].id,
            selectedChoiceLabel: dilemma.choices[0].label,
            valueImpacts: zeroes,
          });
        }
      }

      lines.push("## Afvisninger", "", rejected.length ? rejected.map((item) => `- ${item}`).join("\n") : "Ingen.");
      writeFileSync("dilemma-eval.md", lines.join("\n"));
      expect(lines.length).toBeGreaterThan(5);
    },
    1_200_000,
  );
});
