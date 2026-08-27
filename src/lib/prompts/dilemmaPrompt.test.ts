import { describe, expect, it } from "vitest";
import { buildDilemmaPrompt } from "@/lib/prompts/dilemmaPrompt";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";

const options = {
  technologies: ["AI-tutor" as const],
  locationTypes: ["folkeskole" as const],
};

function request(role: DilemmaGenerationRequest["role"]): DilemmaGenerationRequest {
  return {
    role,
    language: "da",
    preferredSeverity: "medium",
    previousDilemmas: [],
  };
}

describe("buildDilemmaPrompt", () => {
  it("finds the societal question and irreducible conflict before the scene", () => {
    const prompt = buildDilemmaPrompt(request("Fagperson"), options);

    expect(prompt).toContain("STOR FREMTIDSUDVIKLING → NY NORMAL I 2046 → PERSONLIG KONSEKVENS");
    expect(prompt).toContain("FIND DET STORE SPØRGSMÅL");
    expect(prompt).toContain("wantA");
    expect(prompt).toContain("costOfB");
    expect(prompt).toContain("whyCannotHaveBoth");
    expect(prompt).toContain("Hvis navnene, byen og dagens hændelse fjernes");
    expect(prompt.indexOf("FIND KONFLIKTENS KERNE")).toBeLessThan(prompt.indexOf("BYG DEN PERSONLIGE SCENE"));
  });

  it("rejects escape routes and requires a scored quality rewrite", () => {
    const prompt = buildDilemmaPrompt(request("Fagperson"), options);

    expect(prompt).toContain("vente, hente mere information, spørge en voksen eller ekspert");
    expect(prompt).toContain("Hvis No workaround er under 5");
    expect(prompt).toContain("Bigger question");
    expect(prompt).toContain("Memorability");
    expect(prompt).toContain("Role fit");
    expect(prompt).toContain("Natural conflict");
    expect(prompt).toContain("opfundet plads, deadline, knaphedsregel");
    expect(prompt).toContain("decisionAxis");
    expect(prompt).not.toContain("Begynd med dette enkle øjeblik");
    expect(prompt).not.toContain("DU FÅR KUN FIRE BYGGESTEN");
  });

  it("keeps child language simple without shrinking the underlying question", () => {
    const prompt = buildDilemmaPrompt(request("Barn"), options);

    expect(prompt).toContain("SÆRLIGE REGLER FOR BØRN 7-11 ÅR");
    expect(prompt).toContain("Enkel er ikke det samme som ligegyldig");
    expect(prompt).toContain("skole, venner, spil, sport, transport, mad eller hjem");
  });

  it("selects the future conflict before applying the role perspective", () => {
    const childPrompt = buildDilemmaPrompt(request("Barn"), options);
    const employeePrompt = buildDilemmaPrompt(request("Medarbejder"), options);

    expect(childPrompt.indexOf("FIND DET STORE SPØRGSMÅL")).toBeLessThan(childPrompt.indexOf("TRANSFORMÉR FØRST NU KERNEN GENNEM ROLLEN"));
    expect(childPrompt).toContain("sige ja eller nej");
    expect(childPrompt).toContain("ven; søskende; forælder");
    expect(employeePrompt).toContain("job og indkomst");
    expect(employeePrompt).toContain("kollega; leder; kunde");
    expect(employeePrompt).not.toContain("SÆRLIGE REGLER FOR BØRN");
  });
});
