import { describe, expect, it } from "vitest";
import {
  creativeDilemmaSchema,
  dilemmaDisplayLimits,
  enrichCreativeDilemma,
  trimCreativeText,
  validateCreativeDilemma,
} from "@/lib/creativeDilemma";
import type { CreativeDilemma, DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import { zeroValueImpacts } from "@/lib/valueScoring";

const seed = selectDilemmaSeed([], "Barn", () => 0);
const input: DilemmaGenerationRequest = {
  role: "Barn",
  previousDilemmas: [],
  preferredSeverity: "low",
  language: "da",
  generationPlan: seed,
};

function creative(overrides: Partial<CreativeDilemma> = {}): CreativeDilemma {
  return {
    futureNormal: "Hjemmets computer kan opdage sygdom tidligt ved at lytte til hverdagen.",
    humanCost: "Hjælpen kræver, at private samtaler bliver en del af hjemmets billede.",
    decision: "Barnet vælger, om en konkret privat samtale må bruges af hjemmet.",
    title: "Da hjemmet begyndte at lytte",
    scene: "Du kommer hjem til din ven. Husets computer spørger, om jeres samtale må bruges til at holde hans mor rask.",
    stake: "Din ven kan få hjælp tidligere, men det I siger til hinanden, er ikke længere kun jeres.",
    question: "Lader du huset lytte?",
    choices: ["a", "b", "c", "d"].map((id) => ({
      id: id as "a" | "b" | "c" | "d",
      label: `Svar ${id}`,
      consequence: `Du beskytter noget med svar ${id}, men mister noget andet.`,
    })),
    locationType: "hjemmet",
    placeHint: "et almindeligt hjem",
    ...overrides,
  };
}

describe("creative dilemma boundary", () => {
  it("keeps only creative fields in the author schema", () => {
    const properties = creativeDilemmaSchema.properties as Record<string, unknown>;
    for (const field of ["id", "futurePressureId", "severity", "problemArea", "region", "marker", "valueImpacts", "coreTension"]) {
      expect(properties).not.toHaveProperty(field);
    }
    for (const field of ["futureNormal", "humanCost", "decision", "title", "scene", "stake", "question"]) {
      expect(properties).toHaveProperty(field);
    }
  });

  it("checks technical choice invariants and permits optional geography hints", () => {
    expect(validateCreativeDilemma(creative(), input)).toHaveProperty("creative");
    expect(validateCreativeDilemma(creative({ locationType: null, placeHint: null }), input)).toHaveProperty("creative");
    const duplicate = creative();
    duplicate.choices[3].id = "a";
    expect(validateCreativeDilemma(duplicate, input)).toEqual({ reason: "bad_choice_ids" });
  });

  it("adds server-owned metadata and derives classification from the development", () => {
    const result = enrichCreativeDilemma(creative(), input, seed, zeroValueImpacts());
    expect(result.futurePressureId).toBe(seed.development.id);
    expect(result.country).toBe(seed.location.country);
    expect(result.role).toBe("Barn");
    expect(result.tags).toContain(seed.development.id);
    expect(result.normalized2046).toBe(creative().futureNormal);
    expect(result.choices.every((choice) => choice.valueImpacts && choice.description)).toBe(true);
  });

  it("gives the schema headroom and trims final copy only at whole words", () => {
    expect(creativeDilemmaSchema.properties.title.maxLength).toBeGreaterThan(dilemmaDisplayLimits.title);
    expect(creativeDilemmaSchema.properties.scene.maxLength).toBeGreaterThan(dilemmaDisplayLimits.scenePrompt);
    expect(creativeDilemmaSchema.properties.stake.maxLength).toBeGreaterThan(dilemmaDisplayLimits.stake);
    expect(trimCreativeText("alpha beta gamma", 11)).toBe("alpha beta…");
    expect(trimCreativeText("averylongsingleword", 8)).toBe("…");

    const result = enrichCreativeDilemma(creative({
      title: "Et meget langt dilemma om fremtiden og de mennesker som skal leve med konsekvensen hver eneste dag",
      stake: "Mennesker mister noget vigtigt ".repeat(12),
    }), input, seed, zeroValueImpacts());
    expect(result.title.length).toBeLessThanOrEqual(dilemmaDisplayLimits.title);
    expect(result.title).toMatch(/\s\S+…$/u);
    expect(result.stake?.length).toBeLessThanOrEqual(dilemmaDisplayLimits.stake);
  });
});
