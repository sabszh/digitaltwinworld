import { describe, expect, it } from "vitest";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";

function request(role: DilemmaGenerationRequest["role"]): DilemmaGenerationRequest {
  return {
    role,
    previousDilemmas: [],
    preferredSeverity: "low",
    language: "da",
    generationPlan: selectDilemmaSeed([], role, () => 0),
  };
}

describe("buildDilemmaPrompt", () => {
  it("includes the seed role, city, development and both selected examples", () => {
    const input = request("Fagperson");
    const prompt = buildDilemmaPrompt(input);
    const seed = input.generationPlan!;
    expect(prompt).toContain("Rolle:\nFagperson");
    expect(prompt).toContain(`${seed.location.city}, ${seed.location.country}`);
    expect(prompt).toContain(seed.development.development);
    expect(prompt).toContain(seed.examples.sameRole.dilemma.title);
    expect(prompt).toContain(seed.examples.relatedQuestion.dilemma.title);
  });

  it("adds the short child guidance only for Barn", () => {
    expect(buildDilemmaPrompt(request("Barn"))).toContain("Barnet er ca. 7-11 år");
    expect(buildDilemmaPrompt(request("Ung"))).not.toContain("Barnet er ca. 7-11 år");
  });

  it("contains the concise same-decision guidance without legacy rule blocks", () => {
    const prompt = buildDilemmaPrompt(request("Borger"));
    expect(prompt).toContain("Alle fire choices skal besvare den samme beslutning");
    expect(prompt).toContain("Kopiér ikke deres personer, relationer, steder");
    expect(prompt).not.toContain("INTERN KVALITETSKONTROL");
    expect(prompt).not.toContain("wantA");
    expect(prompt).not.toContain("Rolleperspektiv:");
    expect(prompt).not.toContain("Mulige samfundssvar");
    expect(prompt).not.toContain("pressure");
  });
});
