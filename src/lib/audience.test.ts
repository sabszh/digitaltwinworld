import { describe, expect, it } from "vitest";
import { getAudienceProfile } from "@/lib/audience";

describe("getAudienceProfile role perspective", () => {
  it("gives roles distinct agency, relationships and stakes", () => {
    const child = getAudienceProfile("Barn");
    const parent = getAudienceProfile("Forælder");
    const employee = getAudienceProfile("Medarbejder");
    const decisionMaker = getAudienceProfile("Beslutningstager");

    expect(child.agencyExamples).toContain("sige ja eller nej");
    expect(parent.relationshipTypes).toContain("barn");
    expect(employee.relevantStakes).toContain("job og indkomst");
    expect(decisionMaker.agencyExamples).toContain("tage ansvar for en konkret bindende prioritering");
    expect(new Set([
      child.complexityGuidance,
      parent.complexityGuidance,
      employee.complexityGuidance,
      decisionMaker.complexityGuidance,
    ]).size).toBe(4);
  });

  it("allows a child to meet health and autonomy questions without adult authority", () => {
    const child = getAudienceProfile("Barn");

    expect(child.preferredProblemAreas).toContain("Sundhed og omsorg");
    expect(child.naturalContexts).toContain("egen sundhed");
    expect(child.forbiddenResponsibilities).toContain("vælge andres behandling");
  });
});
