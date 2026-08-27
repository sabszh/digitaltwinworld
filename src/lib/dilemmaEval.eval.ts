import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { technologies, locationTypes, responseSchema, validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import type { AiDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { CompletedDilemma, GeneratedDilemma, UserRole, ValueProfile } from "@/types/world2046";
import { planRound } from "@/lib/roundPlan";
import { getAudienceProfile } from "@/lib/audience";
import { requestJson } from "@/lib/openaiJson";

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
    role: "Barn",
    hope: "at der er plads til at lege og være sammen",
    fear: "at computere bestemmer for meget",
  },
  {
    role: "Ung",
    hope: "at der stadig er tid til at kede sig",
    fear: "at man aldrig får fred for at blive målt",
  },
  {
    role: "Medarbejder",
    hope: "at teknologi giver mere tid til det arbejde, der betyder noget",
    fear: "at blive målt og vurderet uden selv at blive hørt",
  },
  {
    role: "Arbejdsgiver",
    hope: "at nye løsninger kan skabe en sund og robust arbejdsplads",
    fear: "at effektivitet gør mennesker til tal",
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
  {
    role: "For alle",
    hope: "at teknologi gør hverdagen lettere for flere",
    fear: "at nogen bliver glemt, når alt bliver digitalt",
  },
  {
    role: "Borger",
    hope: "at fælles løsninger stadig føles retfærdige",
    fear: "at miste indflydelse på mit eget liv",
  },
  {
    role: "Beslutningstager",
    hope: "at vi kan handle tidligt på de store problemer",
    fear: "at gevinsterne skjuler hvem der betaler prisen",
  },
];

async function generateOne(input: DilemmaGenerationRequest): Promise<{ dilemma?: GeneratedDilemma; reason?: string; detail?: string }> {
  const outcome = await requestJson<AiDilemma>({
    apiKey: process.env.OPENAI_API_KEY ?? "",
    schemaName: "world2046_dilemma_eval",
    schema: responseSchema,
    prompt: buildDilemmaPrompt(input, { technologies, locationTypes }),
    language: input.language,
    timeoutMs: 40_000,
  });
  if ("error" in outcome) return { reason: outcome.error };
  const parsed = outcome.data;
  const result = validateAiDilemmaDetailed(parsed, input);
  if ("dilemma" in result) return { dilemma: result.dilemma };
  // Print what was thrown away: a rejection is only worth having if it is
  // possible to tell an over-strict gate from a genuinely bad dilemma.
  console.warn(
    `REJECTED ${result.reason}\n  normalized2046: ${parsed.normalized2046}\n  question: ${parsed.question}\n` +
      (parsed.choices ?? []).map((choice) => `  - ${choice.label} | ${choice.description}`).join("\n"),
  );
  return {
    reason: result.reason,
    detail: [
      `område/sted: ${String(parsed.problemArea)} / ${String(parsed.locationType)}`,
      `spørgsmål: ${String(parsed.question)}`,
      ...(Array.isArray(parsed.choices)
        ? parsed.choices.map((choice) => `${String(choice?.id)}: ${String(choice?.label)}`)
        : ["choices mangler eller er ikke en liste"]),
    ].join(" · "),
  };
}

function render(dilemma: GeneratedDilemma, round: number) {
  return [
    `#### Stop ${round}: ${dilemma.city}, ${dilemma.country} — ${dilemma.exactPlace?.name ?? "?"}`,
    `- **pres:** ${dilemma.futurePressureId} · **severity:** ${dilemma.severity} · **område:** ${dilemma.problemArea}`,
    `- **2046-virkelighed:** ${dilemma.normalized2046}`,
    `- **konflikt:** ${dilemma.coreTension?.want} · men også ${dilemma.coreTension?.butAlsoWant}`,
    `- **kan ikke få begge:** ${dilemma.coreTension?.whyCannotHaveBoth}`,
    ``,
    `**${dilemma.title}**`,
    ``,
    `${dilemma.landingScene ?? dilemma.scenePrompt}`,
    ``,
    `*${dilemma.stake ?? ""}*`,
    ``,
    `**${dilemma.question}**`,
    ``,
    ...dilemma.choices.map((choice, index) => `${index + 1}. **${choice.label}** — ${choice.description}`),
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

      const requestedRoles = new Set(
        (process.env.DILEMMA_EVAL_ROLES ?? "")
          .split(",")
          .map((role) => role.trim())
          .filter(Boolean),
      );
      const journeysToRun = requestedRoles.size
        ? JOURNEYS.filter((journey) => requestedRoles.has(journey.role))
        : JOURNEYS;
      const rounds = Math.max(1, Math.min(5, Number(process.env.DILEMMA_EVAL_ROUNDS ?? 5) || 5));
      const runJourney = async (journey: typeof JOURNEYS[number]) => {
        const lines: string[] = [`## Rejse: ${journey.role}`, ""];
        const rejected: string[] = [];
        const previous: CompletedDilemma[] = [];

        for (let round = 0; round < rounds; round += 1) {
          const input: DilemmaGenerationRequest = {
            role: journey.role,
            answers: { role: journey.role, hope: journey.hope, fear: journey.fear },
            previousDilemmas: previous,
            preferredSeverity: round === 0 ? "low" : "medium",
            language: "da",
            generationPlan: planRound(previous, undefined, undefined, getAudienceProfile(journey.role).preferredProblemAreas),
          };

          // The participant-facing client now retries behind the travel view
          // until a valid destination exists. Mirror that behaviour here so a
          // three-round evaluation actually contains three reviewable rounds.
          let dilemma: GeneratedDilemma | undefined;
          let attempt = 0;
          while (!dilemma) {
            attempt += 1;
            const generated = await generateOne(input);
            dilemma = generated.dilemma;
            if (!dilemma) {
              console.warn(`[eval] ${journey.role} · stop ${round + 1} · forsøg ${attempt} afvist: ${generated.reason}`);
              rejected.push(`${journey.role} runde ${round + 1}, forsøg ${attempt}: ${generated.reason}${generated.detail ? ` · ${generated.detail}` : ""}`);
              const delay = Math.min(8000, 1500 * 2 ** Math.min(attempt - 1, 3));
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
          console.warn(`[eval] ${journey.role} · stop ${round + 1} godkendt efter ${attempt} forsøg`);

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
            presented: {
              title: dilemma.title,
              scene: dilemma.scenePrompt,
              stake: dilemma.stake,
              landingScene: dilemma.landingScene,
              landingDetail: dilemma.landingDetail,
              place: dilemma.exactPlace
                ? { name: dilemma.exactPlace.name, latitude: dilemma.marker.lat, longitude: dilemma.marker.lng }
                : undefined,
              choices: dilemma.choices.map(({ id, label, description }) => ({ id, label, description })),
            },
            futurePressureId: dilemma.futurePressureId,
            coreTension: dilemma.coreTension,
            selectedChoiceId: dilemma.choices[0].id,
            selectedChoiceLabel: dilemma.choices[0].label,
            valueImpacts: zeroes,
          });
        }
        return { lines, rejected };
      };

      const concurrency = Math.max(1, Math.min(4, Number(process.env.DILEMMA_EVAL_CONCURRENCY ?? 3) || 3));
      const journeys: Array<Awaited<ReturnType<typeof runJourney>>> = [];
      for (let start = 0; start < journeysToRun.length; start += concurrency) {
        const batch = journeysToRun.slice(start, start + concurrency);
        journeys.push(...await Promise.all(batch.map(runJourney)));
      }

      const lines = ["# Dilemma-evaluering", "", ...journeys.flatMap((journey) => journey.lines)];
      const rejected = journeys.flatMap((journey) => journey.rejected);
      lines.push("## Afvisninger", "", rejected.length ? rejected.map((item) => `- ${item}`).join("\n") : "Ingen.");
      writeFileSync("dilemma-eval.md", lines.join("\n"));
      expect(lines.length).toBeGreaterThan(5);
    },
    1_200_000,
  );
});
