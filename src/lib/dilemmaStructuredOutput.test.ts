import { describe, expect, it } from "vitest";
import { validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { ValueProfile } from "@/types/world2046";

/** isChoice requires every value key to be present, so partial impacts are
 *  filled out here rather than in each fixture. */
function impacts(partial: Partial<ValueProfile>): ValueProfile {
  const zeroes = {
    trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0,
    safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0,
  };
  return { ...zeroes, ...partial };
}

const request: DilemmaGenerationRequest = {
  role: "Fagperson",
  language: "da",
  preferredSeverity: "medium",
  previousDilemmas: [],
};

/** A generated dilemma that passes every gate, so each test can break exactly
 *  one thing and know which rule fired. */
function baseline(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-1",
    problemArea: "Uddannelse og læring",
    validLocationTypes: ["folkeskole"],
    targetGroups: ["unge"],
    technologies: ["personlig læringsassistent"],
    tags: ["skole"],
    severity: "medium",
    title: "Sofie står nummer fjorten i køen",
    scenePrompt: "Sofie, 11 år, holder tabletten og venter på sin plads i rækken.",
    landingScene: "Sofie, 11 år, holder tabletten ved sin plads. Sofie står nummer fjorten i hjælpekøen før fremlæggelsen.",
    stake: "Sofie risikerer at gå til fremlæggelsen uden den hjælp, hun mangler til den sidste opgave.",
    question: "Hvordan skal rækkefølgen være, når læringsassistenten har lagt køen for klassen?",
    locationType: "folkeskole",
    technology: "personlig læringsassistent",
    country: "Danmark",
    region: "Norden",
    city: "Herning",
    marker: { lat: 56.13, lng: 8.97 },
    coreTension: { valueA: "equality", valueB: "efficiency", summary: "Hvem der hjælpes først." },
    decisionAxis: "Hvem må bryde assistentens rækkefølge for én elev i dag?",
    logic: {
      rule: "Elevernes plads i hjælpekøen ligger fast fra morgenstunden og følger dem hele dagen.",
      benefit: "Læreren når flere elever, fordi ingen skal bruge timen på at fordele hjælpen.",
      trigger: "Sofie, 11 år, holder tabletten, mens hun venter som nummer fjorten i hjælpekøen.",
      decision: "Læreren skal vælge, om og hvordan Sofie kan flyttes frem i hjælpekøen i dag.",
    },
    futurePressureId: "automation",
    normalized2046: "Elevernes plads i hjælpekøen ligger fast fra morgenstunden og følger dem hele dagen.",
    userRelation: "underviser",
    choices: [
      { id: "a", label: "Læreren kan bryde assistentens kø", description: "Læreren sætter systemets rækkefølge til side for én elev i dag.", axisPosition: 1, consequence: "Det ændrer hverdagen i klassen.", valueImpacts: impacts({ equality: 2, efficiency: -1 }) },
      { id: "b", label: "Klassen kan se assistentens rangorden", description: "Alle ved hvem systemet har sat øverst, og hvorfor.", axisPosition: 2, consequence: "Det ændrer hverdagen i klassen.", valueImpacts: impacts({ equality: 1, efficiency: 0 }) },
      { id: "c", label: "Forældrene skriver reglen om hvert år", description: "De vælger hvad køen kigger på, men den ligger fast et helt skoleår.", axisPosition: 3, consequence: "Det ændrer hverdagen i klassen.", valueImpacts: impacts({ equality: 0, efficiency: 1 }) },
      { id: "d", label: "Assistentens rangorden står urørt", description: "Ingen kan gøre undtagelser, og læreren kan ikke rykke nogen frem.", axisPosition: 4, consequence: "Det ændrer hverdagen i klassen.", valueImpacts: impacts({ equality: -1, efficiency: 2 }) },
    ],
    ...overrides,
  };
}

describe("validateAiDilemmaDetailed", () => {
  it("accepts a dilemma where the machine is in the options", () => {
    expect(validateAiDilemmaDetailed(baseline(), request)).toHaveProperty("dilemma");
  });

  it("rejects a shrug in place of a 2046 reality", () => {
    for (const normalized2046 of ["AI spiller en større rolle i skolen", "Teknologien", "Systemerne er blevet mere avancerede end før"]) {
      expect(validateAiDilemmaDetailed(baseline({ normalized2046 }), request)).toEqual({ reason: "generic_future" });
    }
  });

  it("rejects a future pressure that is not in the future space", () => {
    expect(validateAiDilemmaDetailed(baseline({ futurePressureId: "vandmangel-2046" }), request)).toEqual({
      reason: "bad_future_pressure",
    });
  });

  it("rejects a location type that does not belong to the problem area", () => {
    expect(validateAiDilemmaDetailed(baseline({ locationType: "hospital" }), request)).toEqual({ reason: "bad_location_fit" });
  });

  it("keeps scoring attached to each option when the order is shuffled", () => {
    const result = validateAiDilemmaDetailed(baseline(), request);
    expect(result).toHaveProperty("dilemma");
    if (!("dilemma" in result)) return;
    // Order is randomised for the player; the pairing of position, label and
    // impacts must survive it, since that pairing is the whole score.
    for (const choice of result.dilemma.choices) {
      const original = baseline().choices.find((item) => item.id === choice.id);
      expect(choice.axisPosition).toBe(original?.axisPosition);
      expect(choice.valueImpacts).toEqual(original?.valueImpacts);
    }
    expect(new Set(result.dilemma.choices.map((choice) => choice.axisPosition))).toEqual(new Set([1, 2, 3, 4]));
  });

  it("rejects a problem area the journey has already visited", () => {
    const previous = [{ ...baseline(), selectedChoiceId: "a", selectedChoiceLabel: "x" }].map((item) => ({
      dilemmaId: item.id,
      problemArea: "Uddannelse og læring" as const,
      region: item.region,
      country: item.country,
      city: item.city,
      locationType: item.locationType as "folkeskole",
      technology: item.technology as "personlig læringsassistent",
      question: item.question,
      selectedChoiceId: "a",
      selectedChoiceLabel: "x",
      valueImpacts: impacts({}),
    }));
    expect(validateAiDilemmaDetailed(baseline({ country: "Kenya", region: "Afrika" }), { ...request, previousDilemmas: previous })).toEqual({
      reason: "problem_area_reused",
    });
  });

  it("rejects a title that names both sides of the tension", () => {
    for (const title of ["Valget mellem tryghed og personlig frihed", "Balancen mellem tryghed og privatliv"]) {
      expect(validateAiDilemmaDetailed(baseline({ title }), request)).toEqual({ reason: "title_names_tension" });
    }
  });

  it("rejects a question that fixes one side of the outcome", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ question: "Hvordan hjælper vi Sofie uden at læreren ændrer køen?" }),
        request,
      ),
    ).toEqual({ reason: "biased_question" });
  });

  it("still allows a title that names two people", () => {
    expect(validateAiDilemmaDetailed(baseline({ title: "Mødet mellem Sofie og hendes lærer" }), request)).toHaveProperty("dilemma");
  });

  it("allows a question title when the dilemma itself is coherent", () => {
    expect(validateAiDilemmaDetailed(baseline({ title: "Hvem hjælper Sofie i dag?" }), request)).toHaveProperty("dilemma");
  });
});
