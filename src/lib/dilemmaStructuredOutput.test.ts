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
    question: "Hvad gør du, mens Sofie stadig venter?",
    locationType: "folkeskole",
    technology: "personlig læringsassistent",
    country: "Danmark",
    region: "Norden",
    city: "Herning",
    marker: { lat: 56.13, lng: 8.97 },
    coreTension: { want: "at Sofie får hjælp nu", butAlsoWant: "at resten af klassen også når videre", whyCannotHaveBoth: "Læreren kan kun bruge den næste tid hos én gruppe." },
    logic: {
      rule: "Elevernes plads i hjælpekøen ligger fast fra morgenstunden og følger dem hele dagen.",
      benefit: "Læreren når flere elever, fordi ingen skal bruge timen på at fordele hjælpen.",
      trigger: "Sofie, 11 år, holder tabletten, mens hun venter som nummer fjorten i hjælpekøen.",
      decision: "Læreren skal vælge, om og hvordan Sofie kan flyttes frem i hjælpekøen i dag.",
      choiceConstraint: "Læreren kan kun bruge den næste arbejdsblok ét sted, før fremlæggelsen begynder.",
    },
    futurePressureId: "automation",
    normalized2046: "Elevernes plads i hjælpekøen ligger fast fra morgenstunden og følger dem hele dagen.",
    choices: [
      { id: "a", label: "Hjælp Sofie først", description: "Du tager Sofie ud til fem minutters hjælp, men de andre grupper må vente.", consequence: "Sofie kan nå fremlæggelsen bedre, mens to andre grupper mister deres tur.", valueImpacts: impacts({ equality: 2, humanContact: 1, efficiency: -1 }) },
      { id: "b", label: "Lad køen stå", description: "Du følger køen som den er, så alle kender rækkefølgen, men Sofie venter videre.", consequence: "Klassen beholder roen, men Sofie går til fremlæggelsen uden den hjælp hun bad om.", valueImpacts: impacts({ efficiency: 2, trust: 1, equality: -1 }) },
      { id: "c", label: "Byt med en gruppe", description: "Du spørger én gruppe om at bytte tid med Sofie, men den gruppe mister sin planlagte hjælp.", consequence: "Sofie kommer frem uden at bryde hele køen, men en anden gruppe må ændre sin opgave.", valueImpacts: impacts({ localControl: 1, equality: 1, efficiency: -1 }) },
      { id: "d", label: "Del hjælpen kort", description: "Du giver alle grupper en kort fælles gennemgang, men ingen får den fulde hjælp nu.", consequence: "Flere får et næste skridt, men Sofies særlige problem bliver kun delvist løst.", valueImpacts: impacts({ equality: 1, efficiency: 1, humanContact: -1 }) },
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

  it("keeps scoring attached to each concrete action when the order is shuffled", () => {
    const result = validateAiDilemmaDetailed(baseline(), request);
    expect(result).toHaveProperty("dilemma");
    if (!("dilemma" in result)) return;
    // Order is randomised for the player; the pairing of position, label and
    // impacts must survive it, since that pairing is the whole score.
    for (const choice of result.dilemma.choices) {
      const original = baseline().choices.find((item) => item.id === choice.id);
      expect(choice.valueImpacts).toEqual(original?.valueImpacts);
    }
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
        baseline({ question: "Hvad gør du uden at læreren ændrer køen?" }),
        request,
      ),
    ).toEqual({ reason: "biased_question" });
  });

  it("rejects a choice set without a reason the actions compete", () => {
    const dilemma = baseline();
    dilemma.logic.choiceConstraint = "";
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "incoherent_logic:incomplete" });
  });

  it("rejects a collapsed human conflict", () => {
    expect(validateAiDilemmaDetailed(baseline({ coreTension: { want: "at Sofie får hjælp", butAlsoWant: "at Sofie får hjælp", whyCannotHaveBoth: "Tiden er knap." } }), request)).toEqual({
      reason: "unusable_choice_set:collapsed_human_conflict",
    });
  });

  it("rejects a choice with no value impact", () => {
    const dilemma = baseline();
    dilemma.choices[0].valueImpacts = impacts({});
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "bad_choices:relevant_values" });
  });

  it("rejects an option that presents a gain without a visible price", () => {
    const dilemma = baseline();
    dilemma.choices[0].description = "Du ringer Sofie op, så hun kan få hjælp med det samme.";
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "bad_choices:missing_tradeoff" });
  });

  it("still allows a title that names two people", () => {
    expect(validateAiDilemmaDetailed(baseline({ title: "Mødet mellem Sofie og hendes lærer" }), request)).toHaveProperty("dilemma");
  });

  it("allows a question title when the dilemma itself is coherent", () => {
    expect(validateAiDilemmaDetailed(baseline({ title: "Hvem hjælper Sofie i dag?" }), request)).toHaveProperty("dilemma");
  });

  it("checks the visible stake text for child language", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ stake: "Reservedelen kan kun bruges ét sted, så mælken eller isen må vente." }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "audience_language" });
  });

  it("rejects false civic authority for a child", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ landingScene: "Du sidder i Aalborgs ungebyråd og skal sætte dit kryds om en ny plan." }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "implausible_role" });
  });

  it("rejects medical authority for a child", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ scenePrompt: "På platformen skal du dele en test, før du må give andre medicinråd." }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "implausible_role" });
  });

  it("rejects a visible stake that would be cut off in the card", () => {
    expect(validateAiDilemmaDetailed(baseline({ stake: "Sofie ".repeat(30) }), request)).toEqual({
      reason: "visible_text_too_long",
    });
  });
});
