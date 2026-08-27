import { describe, expect, it } from "vitest";
import { emptyValueProfile } from "@/data/taxonomies";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import type { CompletedDilemma } from "@/types/world2046";

function history(choice: "a" | "d"): CompletedDilemma {
  return {
    dilemmaId: "current",
    problemArea: "Digital tillid, rettigheder og styring",
    region: "Norden",
    country: "Danmark",
    city: "Aarhus",
    locationType: "digital borgerservice",
    technology: "digital ID-wallet",
    question: "Hvor meget vil du bevise om dig selv?",
    presented: {
      title: "Dit digitale bevis",
      scene: "En konkret scene i 2046.",
      choices: ["a", "b", "c", "d"].map((id) => ({ id, label: `Valg ${id}` })),
    },
    futurePressureId: "digital-identity",
    selectedChoiceId: choice,
    selectedChoiceLabel: `Valg ${choice}`,
    customAnswer: choice === "d" ? "Min egen helt anden handling" : undefined,
    reflection: choice === "d" ? "Jeg valgte ud fra privatliv." : undefined,
    valueImpacts: choice === "a"
      ? { ...emptyValueProfile, safety: 2, freedom: -1 }
      : { ...emptyValueProfile, freedom: 2, safety: -1 },
  };
}

describe("next-dilemma prefetch independence", () => {
  it("produces the same round plan and author prompt regardless of the latest choice", () => {
    const choiceA = history("a");
    const choiceD = history("d");
    const planA = selectDilemmaSeed([choiceA], "Borger", () => 0);
    const planD = selectDilemmaSeed([choiceD], "Borger", () => 0);

    expect(planA).toEqual(planD);

    const request = (previous: CompletedDilemma[], generationPlan: typeof planA): DilemmaGenerationRequest => ({
      role: "Borger",
      previousDilemmas: previous,
      preferredSeverity: "medium",
      language: "da",
      generationPlan,
    });
    expect(buildDilemmaPrompt(request([choiceA], planA))).toBe(buildDilemmaPrompt(request([choiceD], planD)));
  });
});
