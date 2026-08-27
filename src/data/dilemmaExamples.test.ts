import { describe, expect, it } from "vitest";
import { dilemmaExamples, selectDilemmaExamples } from "@/data/dilemmaExamples";
import { userRoles } from "@/data/taxonomies";

describe("golden dilemma examples", () => {
  it("has three complete, uniquely identified examples for every role", () => {
    expect(new Set(dilemmaExamples.map((item) => item.id)).size).toBe(dilemmaExamples.length);
    for (const role of userRoles) {
      expect(dilemmaExamples.filter((item) => item.role === role)).toHaveLength(3);
    }
    for (const item of dilemmaExamples) {
      expect(userRoles).toContain(item.role);
      expect(item.dilemma.futureNormal.trim()).not.toBe("");
      expect(item.dilemma.humanCost.trim()).not.toBe("");
      expect(item.dilemma.decision.trim()).not.toBe("");
      expect(item.dilemma.choices.map((choice) => choice.id)).toEqual(["a", "b", "c", "d"]);
    }
  });

  it("always returns two different examples in the requested slots", () => {
    const selected = selectDilemmaExamples("Barn", ["Klima, energi og ressourcer"], "nyt development", () => 0);
    expect(selected.sameRole.role).toBe("Barn");
    expect(selected.relatedQuestion.role).not.toBe("Barn");
    expect(selected.sameRole.id).not.toBe(selected.relatedQuestion.id);
  });
});
