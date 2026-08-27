import { describe, expect, it } from "vitest";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import { planRound } from "@/lib/roundPlan";

function request(role: DilemmaGenerationRequest["role"]): DilemmaGenerationRequest {
  return {
    role,
    previousDilemmas: [],
    preferredSeverity: "low",
    language: "da",
    generationPlan: planRound([], () => 0),
  };
}

describe("buildDilemmaPrompt", () => {
  it("focuses the author on future development, human conflict, role and choices", () => {
    const prompt = buildDilemmaPrompt(request("Fagperson"));
    expect(prompt).toContain("FREMTIDSUDVIKLING");
    expect(prompt).toContain("samme løsning skaber en menneskelig pris");
    expect(prompt).toContain("Rolle: Fagperson");
    expect(prompt).toContain("fire reelt forskellige måder");
  });

  it("offers every response instead of requiring one preselected response", () => {
    const input = request("For alle");
    const prompt = buildDilemmaPrompt(input);
    for (const response of input.generationPlan!.pressure.responses) expect(prompt).toContain(response);
    expect(prompt).toContain("Vælg selv den response eller en nærliggende udvikling");
  });

  it("keeps child language simple without filtering the future pressure", () => {
    const adult = request("Medarbejder");
    const child = { ...adult, role: "Barn" as const };
    const childPrompt = buildDilemmaPrompt(child);
    expect(childPrompt).toContain(adult.generationPlan!.pressure.pressure);
    expect(childPrompt).toContain("korte, kendte ord");
    expect(childPrompt).toContain("sige ja eller nej");
  });

  it("does not ask the author for metadata, coordinates or value scoring", () => {
    const prompt = buildDilemmaPrompt(request("Borger"));
    expect(prompt).not.toContain("valueImpacts");
    expect(prompt).not.toContain("futurePressureId er præcis");
    expect(prompt).not.toContain("GPS");
    expect(prompt).not.toContain("INTERN KVALITETSKONTROL");
  });
});
