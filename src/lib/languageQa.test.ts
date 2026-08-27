import { describe, expect, it } from "vitest";
import { findAudienceLanguageIssues } from "@/lib/languageQa";

describe("findAudienceLanguageIssues", () => {
  it("still catches the terms it is meant to catch", () => {
    expect(findAudienceLanguageIssues("Ung", "En AI hjælper i klassen")).toContain("AI");
    expect(findAudienceLanguageIssues("Ung", "AI-styret skema")).toContain("AI");
    expect(findAudienceLanguageIssues("Ung", "Skolens algoritmer sorterer")).toContain("algoritme");
    expect(findAudienceLanguageIssues("Ung", "byens infrastruktur")).toContain("infrastruktur");
  });

  it("does not fire on place names that merely contain the letters", () => {
    // These all used to be rejected outright by a bare substring match on "ai".
    for (const place of ["Taipei, Taiwan", "Nairobi, Kenya", "Dubai", "Thailand", "Ukraine"]) {
      expect(findAudienceLanguageIssues("Ung", `Du står i ${place} en tirsdag morgen`)).toEqual([]);
    }
  });

  it("does not fire on ordinary words containing a blocked term's letters", () => {
    expect(findAudienceLanguageIssues("Ung", "Hun har aids-medicin med")).toEqual([]);
  });

  it("leaves non-school audiences alone", () => {
    expect(findAudienceLanguageIssues("Beslutningstager", "AI og infrastruktur")).toEqual([]);
  });

  it("rejects system language for children but not ordinary words around it", () => {
    expect(findAudienceLanguageIssues("Barn", "Reservedelen kan kun bruges ét sted")).toContain("reservedel");
    expect(findAudienceLanguageIssues("Barn", "Strømmen fordeles ved spidsbelastning")).toContain("spidsbelastning");
    expect(findAudienceLanguageIssues("Barn", "Min data-agent åbner min wallet")).toEqual(expect.arrayContaining(["data-agent", "wallet"]));
    expect(findAudienceLanguageIssues("Ung", "Jeg køber en reservedel til min cykel")).toEqual([]);
  });
});
