import { describe, expect, it } from "vitest";
import { futureDevelopments } from "@/data/futureDevelopments";
import { selectDilemmaSeed } from "@/lib/roundPlan";
import type { CompletedDilemma, ProblemArea, ValueProfile } from "@/types/world2046";

const zeroes: ValueProfile = {
  trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0,
  safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0,
};

function completed(developmentId: string, city = "Aarhus", problemArea: ProblemArea = "Sundhed og omsorg"): CompletedDilemma {
  return {
    dilemmaId: developmentId,
    problemArea,
    region: "Norden",
    country: "Danmark",
    city,
    locationType: "hjemmet",
    technology: "sundhedsdata",
    question: "Hvad vælger du?",
    presented: { title: "Et valg", scene: "En scene.", choices: [] },
    futurePressureId: developmentId,
    selectedChoiceId: "a",
    selectedChoiceLabel: "Noget",
    valueImpacts: zeroes,
  };
}

describe("dilemma seed selection", () => {
  it("avoids an already used development while alternatives exist", () => {
    const first = selectDilemmaSeed([], "Borger", () => 0);
    const next = selectDilemmaSeed([completed(first.development.id)], "Borger", () => 0);
    expect(next.development.id).not.toBe(first.development.id);
  });

  it("avoids an already used city while alternatives exist", () => {
    const next = selectDilemmaSeed([completed("disease-before-symptoms", "Aarhus")], "Borger", () => 0);
    expect(next.location.city).not.toBe("Aarhus");
  });

  it("prefers a theme that has not dominated the journey", () => {
    const previous = [
      completed("disease-before-symptoms"),
      completed("continuous-body-sensors", "Odense"),
      completed("personalised-medicine", "København"),
    ];
    const seed = selectDilemmaSeed(previous, "Borger", () => 0);
    expect(seed.development.themes).not.toEqual(["Sundhed og bioteknologi"]);
  });

  it("respects explicitly unsuitable roles", () => {
    for (let index = 0; index < futureDevelopments.length; index += 1) {
      const seed = selectDilemmaSeed([], "Barn", () => index);
      expect(seed.development.unsuitableRoles ?? []).not.toContain("Barn");
    }
  });

  it("selects two distinct examples and keeps the first role-matched", () => {
    const seed = selectDilemmaSeed([], "Medarbejder", () => 0);
    expect(seed.examples.sameRole.role).toBe("Medarbejder");
    expect(seed.examples.relatedQuestion.role).not.toBe("Medarbejder");
    expect(seed.examples.relatedQuestion.id).not.toBe(seed.examples.sameRole.id);
  });
});
