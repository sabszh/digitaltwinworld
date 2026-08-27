import type { DilemmaExample } from "@/data/dilemmaExamples";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";

/** Legacy structured-output diagnostics still import this list. */
export const valueKeys = [
  "trust", "freedom", "equality", "efficiency", "humanContact", "safety",
  "innovation", "sustainability", "localControl", "transparency",
] as const;

function renderExample(example: DilemmaExample) {
  const { dilemma } = example;
  return [
    `Rolle: ${example.role}`,
    `Fremtidens normal: ${dilemma.futureNormal}`,
    `Menneskelig pris: ${dilemma.humanCost}`,
    `Beslutning: ${dilemma.decision}`,
    `Titel: ${dilemma.title}`,
    `Scene: ${dilemma.scene}`,
    `Det står på spil: ${dilemma.stake}`,
    `Spørgsmål: ${dilemma.question}`,
    ...dilemma.choices.map((choice) => `${choice.id.toUpperCase()}. ${choice.label} — ${choice.consequence}`),
  ].join("\n");
}

export function buildDilemmaPrompt(input: DilemmaGenerationRequest) {
  const seed = input.generationPlan ?? selectDilemmaSeed(input.previousDilemmas, input.role);
  const childGuidance = input.role === "Barn" ? `
Barnet er ca. 7-11 år.
Vis fremtiden gennem noget barnet kan se, høre eller opleve ske.
Barnet må kun vælge noget, det selv kan gøre eller sige.
Brug kun ord og situationer, et barn kan forstå uden voksenforklaring.
` : "";

  return `Skriv ét nyt dilemma om livet i 2046 på ${input.language === "da" ? "dansk" : "engelsk"}.

Rolle:
${input.role}

Sted:
${seed.location.city}, ${seed.location.country}

Fremtidsudvikling:
${seed.development.development}

Her er to redaktionelt godkendte eksempler på det kvalitetsniveau, den konkrethed og den type menneskelige konflikt vi søger.

Eksemplerne er inspiration. Kopiér ikke deres personer, relationer, steder, situationer, formuleringer eller konkrete choices.

EKSEMPEL 1 — SAMME ROLLE
${renderExample(seed.examples.sameRole)}

EKSEMPEL 2 — BESLÆGTET FREMTIDSSPØRGSMÅL
${renderExample(seed.examples.relatedQuestion)}

Skab nu et helt nyt dilemma ud fra den angivne fremtidsudvikling.

Vis fremtidsudviklingen gennem en konkret situation, som rollen selv oplever.

Dilemmaet handler om én beslutning.

Alle fire choices skal besvare den samme beslutning og have en forskellig menneskelig pris.

Choices må ikke ændre reglerne, bede om en ny vurdering, udskyde valget eller løse problemet teknisk.
${childGuidance}
Skriv kun det dilemma deltageren skal opleve.

Returnér det krævede JSON.`;
}

/** @deprecated Frozen legacy diagnostics are data artifacts, not production authoring. */
export function buildLegacyDilemmaPrompt() {
  throw new Error("legacy_dilemma_prompt_is_not_available_in_production");
}
