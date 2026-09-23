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

  it("adds child-specific logic, agency and language guidance only for Barn", () => {
    const childPrompt = buildDilemmaPrompt(request("Barn"));
    const youthPrompt = buildDilemmaPrompt(request("Ung"));

    expect(childPrompt).toContain("Barnet er ca. 7-11 år");
    expect(childPrompt).toContain("Noget sker. Det giver barnet ét problem.");
    expect(childPrompt).toContain("muligt for barnet at gøre lige nu");
    expect(childPrompt).toContain("en sandsynlig, direkte følge af netop den handling");
    expect(childPrompt).toContain("må ikke fordele strøm, penge eller offentlige goder");
    expect(childPrompt).toContain("Skriv enkelt, ærligt og direkte, så en 10-årig kan forstå");
    expect(childPrompt).toContain("Skriv ikke voksensprog med kortere sætninger");
    expect(childPrompt).toContain("hvad problemet er, og hvad det kan gøre");
    expect(childPrompt).toContain("Label siger handlingen; consequence siger kun den vigtigste pris");
    expect(youthPrompt).not.toContain("SÆRLIGE KRAV TIL BØRN");
  });

  it("uses stricter, non-conflicting display limits for children", () => {
    const childPrompt = buildDilemmaPrompt(request("Barn"));
    const adultPrompt = buildDilemmaPrompt(request("Borger"));

    expect(childPrompt).toContain("scene: 2-3 sætninger, højst 30 ord i alt");
    expect(childPrompt).toContain("hver choice consequence: højst 10 ord");
    expect(childPrompt).not.toContain("scene: højst 3 korte sætninger og 460 tegn");
    expect(adultPrompt).toContain("scene: højst 3 korte sætninger og 460 tegn");
    expect(adultPrompt).not.toContain("SÆRLIGE TEKSTGRÆNSER TIL BØRN");
  });

  it("contains the concise same-decision guidance without legacy rule blocks", () => {
    const prompt = buildDilemmaPrompt(request("Borger"));
    expect(prompt).toContain("SPROG FOR ALLE MÅLGRUPPER");
    expect(prompt).toContain("Skriv enkelt, ærligt og forståeligt");
    expect(prompt).toContain("hvad der sker, hvem det rammer, og hvad hvert valg koster");
    expect(prompt).toContain("kryptiske eller højtidelige formuleringer");
    expect(prompt).toContain("Alle fire choices skal besvare den samme beslutning");
    expect(prompt).toContain("Kopiér ikke deres personer, relationer, steder");
    expect(prompt).not.toContain("INTERN KVALITETSKONTROL");
    expect(prompt).not.toContain("wantA");
    expect(prompt).not.toContain("Rolleperspektiv:");
    expect(prompt).not.toContain("Mulige samfundssvar");
    expect(prompt).not.toContain("pressure");
  });
});
