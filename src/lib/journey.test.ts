import { describe, expect, it } from "vitest";
import { emptyValueProfile } from "@/data/taxonomies";
import { addProfiles, buildFallbackReport } from "@/lib/profileScoring";
import { generateDilemma } from "@/lib/randomizer";

describe("bilingual journey fallbacks", () => {
  it("creates a concrete English first stop in Denmark", () => {
    const dilemma = generateDilemma({ role: "For alle", previousDilemmas: [], preferredSeverity: "low", language: "en" });
    expect(dilemma.country).toBe("Danmark");
    expect(dilemma.choices).toHaveLength(4);
    expect(dilemma.landingScene).toMatch(/^You arrive/);
    expect(dilemma.question).toMatch(/^How/);
  });

  it("builds an English report without diagnostic labels", () => {
    const report = buildFallbackReport([], { ...emptyValueProfile, humanContact: 2, transparency: 1 }, "en");
    expect(report.headline).toBe("What you held on to");
    expect(report.narrative).toContain("Across five places");
  });

  it("reverses value impacts without leaving residue", () => {
    const applied = addProfiles(emptyValueProfile, { trust: 2, freedom: -1 });
    expect(addProfiles(applied, { trust: -2, freedom: 1 })).toEqual(emptyValueProfile);
  });
});
