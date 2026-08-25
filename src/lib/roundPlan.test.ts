import { describe, expect, it } from "vitest";
import { pressuresById } from "@/data/futurePressures";
import { journeyStages, planRound } from "@/lib/roundPlan";
import type { CompletedDilemma, ValueProfile } from "@/types/world2046";

const zeroes: ValueProfile = {
  trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0,
  safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0,
};

function completed(futurePressureId: string): CompletedDilemma {
  return {
    dilemmaId: futurePressureId,
    problemArea: "Sundhed og omsorg",
    region: "Norden",
    country: "Danmark",
    city: "Herning",
    locationType: "hjemmet",
    technology: "sundhedsdata",
    question: "Hvordan afgør vi, hvem der ...",
    futurePressureId,
    selectedChoiceId: "a",
    selectedChoiceLabel: "Noget",
    valueImpacts: zeroes,
  };
}

describe("planRound", () => {
  it("walks the five stages in order", () => {
    for (let round = 0; round < 5; round += 1) {
      const previous = Array.from({ length: round }, () => completed("drought"));
      expect(planRound(previous, () => 0).stage.id).toBe(journeyStages[round].id);
    }
  });

  it("never spends two stops on the same pressure family", () => {
    // `pick: () => 0` always takes the first open family, so a repeat would show
    // up immediately if used families were not being excluded.
    const previous: CompletedDilemma[] = [];
    const families = new Set<string>();
    for (let round = 0; round < 5; round += 1) {
      const plan = planRound(previous, () => 0);
      expect(families.has(plan.pressure.family)).toBe(false);
      families.add(plan.pressure.family);
      previous.push(completed(plan.pressure.id));
    }
  });

  it("picks a response that belongs to the assigned pressure", () => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const plan = planRound([]);
      expect(pressuresById.has(plan.pressure.id)).toBe(true);
      expect(plan.pressure.responses).toContain(plan.response);
      expect(journeyStages[0].relations).toContain(plan.relation);
      expect(plan.problemAreas.every((area) => plan.pressure.problemAreas.includes(area))).toBe(true);
    }
  });

  it("only offers problem areas that have not already been visited", () => {
    const plan = planRound([completed("care-workforce")], () => 0);
    expect(plan.problemAreas).not.toContain("Sundhed og omsorg");
    expect(plan.problemAreas.length).toBeGreaterThan(0);
  });

  it("opens on the family the traveller's own words point at", () => {
    expect(planRound([], () => 0, "Jeg frygter overvågning og falske nyheder").pressure.family).toBe("tillid og information");
    expect(planRound([], () => 0, "I worry about drought and flooding").pressure.family).toBe("klima og natur");
  });

  it("ignores the traveller's words after the first stop", () => {
    const cue = "Jeg frygter overvågning";
    const opening = planRound([], () => 0, cue);
    expect(opening.pressure.family).toBe("tillid og information");
    // Round two takes the first open family, which excludes the one just used.
    const second = planRound([completed(opening.pressure.id)], () => 0, cue);
    expect(second.pressure.family).not.toBe("tillid og information");
  });

  it("falls back to the rotation when the words match nothing", () => {
    const plan = planRound([], () => 0, "Jeg ved det ikke rigtig");
    expect(plan.pressure.family).toBe(planRound([], () => 0).pressure.family);
  });

  it("matches cue stems on word boundaries only", () => {
    // "vand" must find vandmangel without also firing on indvandring.
    expect(planRound([], () => 0, "Jeg tænker på indvandring").pressure.family).toBe("mennesker og bevægelse");
  });

  it("varies severity across the journey rather than sitting on medium", () => {
    const severities = journeyStages.map((stage) => stage.severity);
    expect(new Set(severities).size).toBeGreaterThan(1);
    expect(new Set(journeyStages.map((stage) => stage.stakeMode)).size).toBeGreaterThan(1);
  });
});
