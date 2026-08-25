import type { CompletedDilemma } from "@/types/world2046";
import type { Language } from "@/lib/i18n";

/** Dilemmas the traveller answered in their own words. Picked options need no
 *  scoring — they already carry the impacts written at generation time. */
export function writtenAnswers(completed: CompletedDilemma[]) {
  return completed.filter((item) => item.customAnswer?.trim() && item.coreTension);
}

export const valueResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    placements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dilemmaId: { type: "string" },
          // A string enum rather than a number plus a flag: the model has to
          // commit to "this rejects the premise" as a first-class answer instead
          // of picking a position it does not believe.
          position: { type: "string", enum: ["1", "2", "3", "4", "off-axis"] },
        },
        required: ["dilemmaId", "position"],
      },
    },
  },
  required: ["placements"],
};

/**
 * Ask only where an answer sits — never what the person is like.
 *
 * This runs as its own call, separate from the report writer. If the model that
 * narrates the profile also produced the numbers it narrates, it marks its own
 * homework and writes the story its own scoring implied. Here it never sees the
 * profile, the other stops, or the closing text.
 */
export function buildValuePrompt(items: CompletedDilemma[], language: Language) {
  const cases = items
    .map((item) => {
      const tension = item.coreTension;
      return [
        `dilemmaId: ${item.dilemmaId}`,
        `Situation: ${item.question}`,
        `Konflikten står mellem "${tension?.valueA}" og "${tension?.valueB}": ${tension?.summary ?? ""}`,
        `Aksen går fra position 1 (mest "${tension?.valueA}") til position 4 (mest "${tension?.valueB}").`,
        `Personen skrev selv: "${item.customAnswer}"`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return `Du placerer skrevne svar på en akse. Du vurderer ikke personen.

For hvert tilfælde nedenfor skal du afgøre, hvor personens egne ord ligger på netop dette dilemmas akse.

- Svar "1", "2", "3" eller "4", hvis svaret tager stilling inde i situationen.
- Svar "off-axis", hvis svaret afviser hele præmissen, stiller et spørgsmål i stedet for at vælge, handler om noget helt andet, eller er for kort eller for uklart til at placeres. Vær hellere "off-axis" end at gætte.

"off-axis" er et rigtigt svar, ikke en fejl. Et svar som "ingen af delene, systemet burde slet ikke findes" er off-axis — det er en holdning, men ikke et punkt på denne akse.

Læg ikke noget i svaret, som ikke står der. Bedøm ikke, om svaret er klogt, rimeligt eller sympatisk. Sproget er ${language === "da" ? "dansk" : "engelsk"}.

${cases}

Returnér én placering per dilemmaId, kun JSON.`;
}
