import { describe, expect, it } from "vitest";
import { creativeDilemmaSchema, enrichCreativeDilemma, validateCreativeDilemma } from "@/lib/creativeDilemma";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { planRound } from "@/lib/roundPlan";
import { zeroValueImpacts } from "@/lib/valueScoring";

const plan = planRound([], () => 0);
const input: DilemmaGenerationRequest = {
  role: "Barn",
  previousDilemmas: [],
  preferredSeverity: "low",
  language: "da",
  generationPlan: plan,
};

function creative(overrides: Partial<CreativeDilemma> = {}): CreativeDilemma {
  return {
    title: "Da hjemmet begyndte at lytte",
    landingScene: "Du kommer hjem til din ven. Husets computer spørger, om jeres samtale må bruges til at holde hans mor rask.",
    scenePrompt: "Huset opdager sygdom tidligt ved at lytte. Det hjælper familien, men din private samtale bliver også en del af hjælpen.",
    stake: "Din ven kan få hjælp tidligere, men det I siger til hinanden, er ikke længere kun jeres.",
    question: "Lader du huset lytte?",
    coreTension: {
      want: "at vennens mor får hjælp tidligt",
      butAlsoWant: "at samtalen med vennen er privat",
      whyCannotHaveBoth: "den tidlige advarsel bygger på det, huset hører",
    },
    choices: ["a", "b", "c", "d"].map((id) => ({
      id: id as "a" | "b" | "c" | "d",
      label: `Svar ${id}`,
      description: `Du beskytter noget med svar ${id}, men mister noget andet.`,
      consequence: `Familien får én gevinst og betaler én pris ved svar ${id}.`,
    })),
    locationType: plan.problemAreas[0] === "Klima, energi og resiliens" ? "boligområde" : "hjemmet",
    placeHint: "et almindeligt hjem",
    ...overrides,
  };
}

describe("creative dilemma boundary", () => {
  it("keeps metadata and value impacts out of the author schema", () => {
    const properties = creativeDilemmaSchema.properties as Record<string, unknown>;
    for (const field of ["id", "futurePressureId", "severity", "problemArea", "region", "marker", "valueImpacts"]) {
      expect(properties).not.toHaveProperty(field);
    }
  });

  it("checks only technical choice invariants, not semantic regex rules", () => {
    const value = creative();
    value.choices[0].description = "Du venter med at fortælle det og accepterer stadig, at samtalen bliver lyttet til.";
    expect(validateCreativeDilemma(value, input)).toHaveProperty("creative");
  });

  it("rejects duplicate ids and locations outside the planned taxonomy", () => {
    const duplicate = creative();
    duplicate.choices[3].id = "a";
    expect(validateCreativeDilemma(duplicate, input)).toEqual({ reason: "bad_choice_ids" });
    expect(validateCreativeDilemma(creative({ locationType: "grænsekontrol" }), input)).toEqual({ reason: "bad_location_fit" });
  });

  it("adds server-owned metadata and scores after authoring", () => {
    const value = creative();
    const result = enrichCreativeDilemma(value, input, plan, zeroValueImpacts());
    expect(result.futurePressureId).toBe(plan.pressure.id);
    expect(result.country).toBe(plan.location.country);
    expect(result.role).toBe("Barn");
    expect(result.choices.every((choice) => choice.valueImpacts)).toBe(true);
  });
});
