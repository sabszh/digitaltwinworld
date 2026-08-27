import { describe, expect, it } from "vitest";
import { dilemmaExamples, selectDilemmaExamples } from "@/data/dilemmaExamples";
import { futureDevelopments } from "@/data/futureDevelopments";
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
      expect(item.developmentIds?.length).toBeGreaterThan(0);
      expect(item.developmentIds?.every((id) => futureDevelopments.some((development) => development.id === id))).toBe(true);
    }
  });

  it("does not select an example built from the target development", () => {
    const target = futureDevelopments.find((item) => item.id === "digital-deceased")!;
    const selected = selectDilemmaExamples("Barn", target, () => 0);
    expect(selected.sameRole.developmentIds).not.toContain(target.id);
    expect(selected.relatedQuestion.developmentIds).not.toContain(target.id);
  });

  it("always returns two different examples in the requested slots", () => {
    const selected = selectDilemmaExamples("Barn", {
      id: "nyt-development",
      development: "Et nyt development",
      themes: ["Klima, energi og ressourcer"],
    }, () => 0);
    expect(selected.sameRole.role).toBe("Barn");
    expect(selected.relatedQuestion.role).not.toBe("Barn");
    expect(selected.sameRole.id).not.toBe(selected.relatedQuestion.id);
  });

  it("does not teach the known scarcity and deadline mechanics", () => {
    const visible = dilemmaExamples.map((item) => [
      item.dilemma.futureNormal,
      item.dilemma.humanCost,
      item.dilemma.decision,
      item.dilemma.scene,
      ...item.dilemma.choices.flatMap((choice) => [choice.label, choice.consequence]),
    ].join(" ")).join("\n");
    for (const mechanic of [
      "de sidste armbånd",
      "den sidste plads",
      "kun én undtagelse",
      "om ti minutter",
      "inden dagens udgang",
      "budgettet rækker kun til én",
    ]) {
      expect(visible.toLowerCase()).not.toContain(mechanic);
    }
  });
});
