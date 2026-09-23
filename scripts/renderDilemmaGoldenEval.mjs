import { readFileSync, writeFileSync } from "node:fs";

const raw = JSON.parse(readFileSync("dilemma-golden-examples-eval-raw.json", "utf8"));
const assessment = JSON.parse(readFileSync("dilemma-golden-examples-eval-assessment.json", "utf8"));
const reviews = new Map(assessment.cases.map((item) => [item.index, item]));
const roleStats = new Map();

for (const item of raw.cases) {
  const review = reviews.get(item.index);
  const stats = roleStats.get(item.role) ?? { cases: 0, worthy: 0, totals: Array(10).fill(0) };
  stats.cases += 1;
  if (review.productionWorthy) stats.worthy += 1;
  review.scores.forEach((score, index) => { stats.totals[index] += score; });
  roleStats.set(item.role, stats);
}

const average = (values) => (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
const productionWorthy = assessment.cases.filter((item) => item.productionWorthy).length;
const copyCounts = assessment.cases.reduce((counts, item) => {
  counts[item.exampleCopying] = (counts[item.exampleCopying] ?? 0) + 1;
  return counts;
}, {});

function renderScores(review) {
  return [
    "| Dimension | Score |",
    "|---|---:|",
    ...assessment.dimensions.map((dimension, index) => `| ${dimension} | ${review.scores[index]}/5 |`),
    ...(review.childComprehension ? [`| Child comprehension | ${review.childComprehension}/5 |`] : []),
  ].join("\n");
}

function renderCase(item) {
  const review = reviews.get(item.index);
  const status = item.validation.accepted ? "TEKNISK GODKENDT" : `AFVIST (${item.validation.reason})`;
  const dilemma = item.raw;
  return [
    `## ${item.index}. ${item.role} — ${status}`,
    "",
    `- Model: ${item.model}`,
    `- Development: ${item.seed.development} (\`${item.seed.developmentId}\`)`,
    `- Sted: ${item.seed.city}, ${item.seed.country}`,
    `- Golden examples: \`${item.seed.sameRoleExampleId}\` + \`${item.seed.relatedQuestionExampleId}\``,
    `- Latency/tokens: ${item.usage?.latencyMs ?? 0} ms · ${item.usage?.inputTokens ?? 0} input · ${item.usage?.outputTokens ?? 0} output`,
    "",
    ...(dilemma ? [
      `### ${dilemma.title}`,
      "",
      `**Future normal:** ${dilemma.futureNormal}`,
      "",
      `**Human cost:** ${dilemma.humanCost}`,
      "",
      `**Decision:** ${dilemma.decision}`,
      "",
      dilemma.scene,
      "",
      `**Det står på spil:** ${dilemma.stake}`,
      "",
      `**${dilemma.question}**`,
      "",
      ...dilemma.choices.map((choice) => `${choice.id.toUpperCase()}. **${choice.label}** — ${choice.consequence}`),
    ] : ["Intet model-JSON blev returneret."]),
    "",
    "### Redaktionel vurdering",
    "",
    renderScores(review),
    "",
    `- Production-worthy: ${review.productionWorthy ? "ja" : "nej"}`,
    `- Example copying: ${review.exampleCopying}`,
    `- Note: ${review.note}`,
    "",
  ].join("\n");
}

const dimensionAverages = assessment.dimensions.map((dimension, index) => ({
  dimension,
  score: average(assessment.cases.map((item) => item.scores[index])),
}));

const report = [
  "# World 2046 — developments + golden examples eval",
  "",
  "Præcis 20 Terra authoring-kald: to per rolle, ingen retries og ingen regeneration. Alle rå outputs er gengivet uredigeret nedenfor.",
  "",
  "## Setup og resultat",
  "",
  `- Model: ${raw.summary.model}`,
  `- Kald: ${raw.summary.calls}`,
  `- Teknisk accepteret: ${raw.summary.accepted}/20`,
  `- Redaktionelt production-worthy: ${productionWorthy}/20`,
  `- Gennemsnitlig latency: ${raw.summary.averageLatencyMs} ms`,
  `- Tokens: ${raw.summary.inputTokens} input · ${raw.summary.outputTokens} output`,
  `- Example copying: ${copyCounts.none ?? 0} none · ${copyCounts["mild structural similarity"] ?? 0} mild · ${copyCounts["too close"] ?? 0} too close`,
  "",
  "## Gennemsnitlige scores",
  "",
  "| Dimension | Gennemsnit |",
  "|---|---:|",
  ...dimensionAverages.map((item) => `| ${item.dimension} | ${item.score}/5 |`),
  "",
  "## Rolleoverblik",
  "",
  "| Rolle | Production-worthy | Gennemsnit på tværs af 10 dimensioner |",
  "|---|---:|---:|",
  ...[...roleStats].map(([role, stats]) => `| ${role} | ${stats.worthy}/${stats.cases} | ${average(stats.totals.map((total) => total / stats.cases))}/5 |`),
  "",
  "## Redaktionel summary",
  "",
  "- **Barn er sprogligt forståeligt, men endnu ikke løst.** Begge børnecases kan forstås uden en voksenforklaring (4/5), men case 1 vender tilbage til den allerede problematiske skole/mistrivsel/privacy-scene, og case 2 har choices, der ikke alle besvarer beslutningen.",
  "- **Choices er bedre formet, men workarounds findes stadig.** De bedste cases holder alle fire svar på samme akse (især 6, 9, 10, 13 og 18). I 1, 2, 4, 8 og 17 skifter mindst ét svar spørgsmål, flytter ansvaret eller er åbenlyst svagere.",
  "- **Natural conflict er den største fejl.** Cases 3, 7, 11, 13, 15 og 20 bruger sidste plads, armbånd, én undtagelse, fast deadline eller et budget, der kun rækker til én, som motor for konflikten. Cases 7 og 15 kopierer samtidig scarcity-strukturen for tæt fra deres valgte golden example.",
  "- **Developments er ikke altid centrale nok.** I case 8, 16 og 20 kunne næsten samme dilemma skrives uden den valgte udvikling; autonom transport, simulationsværktøj og AI-administration bliver baggrund frem for årsag til den menneskelige pris.",
  "- **Bedst fungerende roller:** Forælder og Fagperson gav 2/2 production-worthy; Medarbejder, Arbejdsgiver og Borger gav én stærk case hver. **Svagest:** Barn, Ung, Lærer/pædagog, For alle og Beslutningstager gav 0/2 efter en streng redaktionel vurdering.",
  "- **Example copying:** 16/20 viser ingen konkret kopiering, 2/20 har mild strukturel lighed, og 2/20 ligger for tæt. Few-shot-laget skaber altså ikke generel repetition, men enkelte scarcity-eksempler lærer modellen netop den mekanik, vi vil undgå.",
  "- **Developments der gav svage mønstre:** `ai-prioritises-resources`, `public-cooling-rooms`, `grid-responsive-homes` og `ai-administration` fremkaldte konstrueret ressourcefordeling. `ai-detects-distress` gav igen den snævre skole/privacy-scene. Det peger på content-library-arbejde, ikke flere runtime-regler.",
  "",
  "## Konklusion",
  "",
  "Arkitekturen er væsentligt mere forståelig, og Terra leverer konsekvent korrekt form, konkrete scener og god rolle-tone. Golden examples løfter især sprog, stakes og beslutningsklarhed. Kvalitetsproblemet er nu synligt og redaktionelt håndterbart: enkelte developments og golden examples trækker modellen mod scarcity, og choice-kvaliteten er stadig ustabil. I overensstemmelse med eval-reglen er der ikke foretaget automatisk tuning efter disse resultater.",
  "",
  "# Alle 20 rå cases med scoring",
  "",
  ...raw.cases.map(renderCase),
].join("\n");

writeFileSync("dilemma-golden-examples-eval.md", `${report.trimEnd()}\n`);
