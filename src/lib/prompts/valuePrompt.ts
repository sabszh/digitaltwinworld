import type { CompletedDilemma } from "@/types/world2046";
import type { Language } from "@/lib/i18n";

/** Dilemmas the traveller answered in their own words. Picked options need no
 *  scoring — they already carry the impacts written at generation time. */
export function writtenAnswers(completed: CompletedDilemma[]) {
  return completed.filter((item) => item.customAnswer?.trim() && item.scoringChoices?.length === 4);
}

export const valueResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dilemmaId: { type: "string" },
          choiceId: { type: "string", enum: ["a", "b", "c", "d", "unscored"] },
        },
        required: ["dilemmaId", "choiceId"],
      },
    },
  },
  required: ["matches"],
};

/**
 * Ask only which authored action an answer most closely resembles — never what
 * the person is like and never which values it should imply.
 *
 * This runs as its own call, separate from the report writer. If the model that
 * narrates the profile also produced the numbers it narrates, it marks its own
 * homework and writes the story its own scoring implied. Here it never sees the
 * profile, the other stops, or the closing text.
 */
export function buildValuePrompt(items: CompletedDilemma[], language: Language) {
  const cases = items
    .map((item) => {
      return [
        `dilemmaId: ${item.dilemmaId}`,
        `Situation: ${item.question}`,
        `Det personen vil: ${item.coreTension?.want ?? ""}. Men også: ${item.coreTension?.butAlsoWant ?? ""}.`,
        `Muligheder:`,
        ...(item.scoringChoices ?? []).map((choice) => `${choice.id}: ${choice.label} — ${choice.description ?? ""}`),
        `Personen skrev selv: "${item.customAnswer}"`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return `Du matcher skrevne svar med allerede beskrevne handlinger. Du vurderer ikke personen.

For hvert tilfælde skal du afgøre, hvilken af de fire handlinger personens egne ord ligger tættest på.

- Svar med choiceId "a", "b", "c" eller "d" kun hvis svaret reelt ligner den handling.
- Svar "unscored", hvis svaret kombinerer handlinger, afviser præmissen, foreslår noget femte, stiller et spørgsmål eller er for uklart. Vær hellere "unscored" end at gætte.

"unscored" er et rigtigt svar, ikke en fejl. Du må ikke oversætte svaret til værdier eller til en personlighed.

Læg ikke noget i svaret, som ikke står der. Bedøm ikke, om svaret er klogt, rimeligt eller sympatisk. Sproget er ${language === "da" ? "dansk" : "engelsk"}.

${cases}

Returnér ét match per dilemmaId, kun JSON.`;
}
