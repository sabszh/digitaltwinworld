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
SÆRLIGE KRAV TIL BØRN
Barnet er ca. 7-11 år og skal forstå både situationen og valget ved første gennemlæsning.

MENING OG ÅRSAG
- Byg én enkel kæde: Noget sker. Det giver barnet ét problem. Barnet gør eller siger én ting. En direkte følge opstår.
- Alle personer, regler og oplysninger, som et choice bygger på, skal allerede være tydelige i scenen.
- Hvert choice skal være muligt for barnet at gøre lige nu og skal svare direkte på spørgsmålet.
- Hver consequence skal være en sandsynlig, direkte følge af netop den handling. Opfind ikke en ny hændelse for at gøre valget svært.
- Hvis en consequence ikke kan forklares med "det sker, fordi barnet valgte at ...", skal den skrives om.
- Konflikten må ikke bero på en misforståelse, en kunstig mangel, en skjult regel eller en person, der uden grund opfører sig mærkeligt.

BARNETS ROLLE
- Brug en kendt hverdag: skole, hjem, ven, søskende, leg, fritid, transport eller online liv.
- Vis fremtiden gennem én ting, barnet kan se, høre eller mærke. Forklar ikke systemet bag.
- Barnet må kun vælge over sin egen handling, sine egne ord eller sine egne oplysninger.
- Barnet må ikke fordele strøm, penge eller offentlige goder, træffe en medicinsk beslutning, løse en nødsituation alene eller tage ansvar, som naturligt tilhører en voksen.
- Hvis fremtidsudviklingen handler om et voksensystem, så vis kun, hvordan det ændrer barnets egen dag eller en nær relation.

NATURLIGT SPROG
- Skriv enkelt, ærligt og direkte, så en 10-årig kan forstå hvert ord og hele situationen uden hjælp fra en voksen.
- Tal til barnet i øjenhøjde. Skriv ikke voksensprog med kortere sætninger; forklar selve tanken på en enkel måde.
- Sig tydeligt, hvad der sker, og hvad hvert valg koster. Skjul ikke konsekvensen bag pæne, uklare eller forsigtige ord.
- Læs teksten som en 10-årig: Hvis barnet ikke straks kan fortælle med egne ord, hvad problemet er, og hvad det kan gøre, skal teksten skrives om.
- Skriv som et menneske ville forklare situationen højt til et barn. Brug almindeligt, mundret dansk.
- Brug konkrete navneord og verber. Undgå fagord, systemord, engelske termer, billedsprog og abstrakte formuleringer.
- Ét choice er én tydelig handling. Label siger handlingen; consequence siger kun den vigtigste pris og gentager ikke gevinsten.
- Undgå sygdom, død, savnede personer, alvorlige ulykker og andre skræmmende konflikter.
` : "";
  const lengthGuidance = input.role === "Barn" ? `
SÆRLIGE TEKSTGRÆNSER TIL BØRN
- title: højst 6 ord.
- scene: 2-3 sætninger, højst 30 ord i alt og højst 12 ord pr. sætning. Første sætning skal kunne stå alene som ankomst.
- stake: 1 sætning på højst 12 ord.
- question: 1 direkte spørgsmål på højst 8 ord.
- hver choice label: højst 4 ord.
- hver choice consequence: højst 10 ord og kun én direkte pris.
- Brug aldrig en afbrudt sætning eller en label med "..." eller "…".
- Undgå at gentage samme oplysning i scene, stake, question og choices.
` : `
Skriv kort og konkret:
- scene: højst 3 korte sætninger og 460 tegn; første sætning skal kunne stå alene som ankomst.
- stake: 1 kort sætning, højst 125 tegn.
- question: 1 direkte sætning, højst 105 tegn.
- hver choice consequence: 1 kort sætning, højst 105 tegn.
- undgå at gentage samme oplysning i scene, stake og question.
`;

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

SPROG FOR ALLE MÅLGRUPPER
- Skriv enkelt, ærligt og forståeligt. Deltageren skal forstå situationen og valget ved første gennemlæsning.
- Brug almindelige, konkrete ord og korte, naturlige sætninger. Skriv som et menneske, der forklarer situationen højt.
- Sig direkte, hvad der sker, hvem det rammer, og hvad hvert valg koster.
- Undgå fagord, myndighedssprog, systemord, abstraktioner, metaforer og kryptiske eller højtidelige formuleringer.
- Skjul aldrig en konsekvens bag vage, pæne eller forsigtige ord. Hvis en sætning kan siges enklere uden at miste mening, så gør det.

Alle fire choices skal besvare den samme beslutning og have en forskellig menneskelig pris.

Choices må ikke ændre reglerne, bede om en ny vurdering, udskyde valget eller løse problemet teknisk.
${childGuidance}
${lengthGuidance}

Kontrollér lydløst før du svarer, at scenen, spørgsmålet, alle fire handlinger og deres følger hænger direkte sammen.

Skriv kun det dilemma deltageren skal opleve.

Returnér det krævede JSON.`;
}

/** @deprecated Frozen legacy diagnostics are data artifacts, not production authoring. */
export function buildLegacyDilemmaPrompt() {
  throw new Error("legacy_dilemma_prompt_is_not_available_in_production");
}
