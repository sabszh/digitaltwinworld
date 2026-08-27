import { describe, expect, it } from "vitest";
import {
  creativeDilemmaSchema,
  dilemmaDisplayLimits,
  enrichCreativeDilemma,
  trimCreativeText,
  validateCreativeDilemma,
} from "@/lib/creativeDilemma";
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

  it("rejects duplicate ids but allows a natural adjacent location taxonomy", () => {
    const duplicate = creative();
    duplicate.choices[3].id = "a";
    expect(validateCreativeDilemma(duplicate, input)).toEqual({ reason: "bad_choice_ids" });
    expect(validateCreativeDilemma(creative({ locationType: "folkeskole" }), input)).toHaveProperty("creative");
  });

  it("adds server-owned metadata and scores after authoring", () => {
    const value = creative();
    const result = enrichCreativeDilemma(value, input, plan, zeroValueImpacts());
    expect(result.futurePressureId).toBe(plan.pressure.id);
    expect(result.country).toBe(plan.location.country);
    expect(result.role).toBe("Barn");
    expect(result.technology).toBe(plan.pressure.technology);
    expect(result.technologies).toEqual([plan.pressure.technology]);
    expect(result.choices.every((choice) => choice.valueImpacts)).toBe(true);
  });

  it("derives problem area from the authored scene location when it is adjacent to the pressure", () => {
    const result = enrichCreativeDilemma(creative({ locationType: "folkeskole" }), input, plan, zeroValueImpacts());
    expect(result.problemArea).toBe("Uddannelse og læring");
    expect(result.technology).toBe(plan.pressure.technology);
    expect(result.validLocationTypes).toContain("folkeskole");
  });

  it("gives the schema headroom and trims final copy only at whole words", () => {
    expect(creativeDilemmaSchema.properties.title.maxLength).toBeGreaterThan(dilemmaDisplayLimits.title);
    expect(creativeDilemmaSchema.properties.scenePrompt.maxLength).toBeGreaterThan(dilemmaDisplayLimits.scenePrompt);
    expect(creativeDilemmaSchema.properties.stake.maxLength).toBeGreaterThan(dilemmaDisplayLimits.stake);
    expect(creativeDilemmaSchema.properties.question.maxLength).toBeGreaterThan(dilemmaDisplayLimits.question);
    expect(trimCreativeText("alpha beta gamma", 11)).toBe("alpha beta…");
    expect(trimCreativeText("averylongsingleword", 8)).toBe("…");

    const result = enrichCreativeDilemma(creative({
      title: "Et meget langt dilemma om fremtiden og de mennesker som skal leve med konsekvensen hver eneste dag",
      stake: "Mennesker mister noget vigtigt ".repeat(12),
    }), input, plan, zeroValueImpacts());
    expect(result.title.length).toBeLessThanOrEqual(dilemmaDisplayLimits.title);
    expect(result.title).toMatch(/\s\S+…$/u);
    expect(result.stake?.length).toBeLessThanOrEqual(dilemmaDisplayLimits.stake);
  });
});
