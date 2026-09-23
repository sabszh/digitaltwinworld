import { describe, expect, it } from "vitest";
import { developmentIsSuitableForRole, futureDevelopments } from "@/data/futureDevelopments";
import type { FutureTheme } from "@/types/world2046";

const validThemes = new Set<FutureTheme>([
  "AI og beslutninger", "Robotter og autonome systemer", "Sundhed og bioteknologi",
  "Data, identitet og privatliv", "Sandhed og autenticitet", "Uddannelse", "Arbejde",
  "Klima, energi og ressourcer", "Offentlige systemer og demokrati",
  "Relationer, familie og hverdagsliv",
]);

describe("future developments", () => {
  it("contains 80-120 concrete entries with unique ids", () => {
    expect(futureDevelopments.length).toBeGreaterThanOrEqual(80);
    expect(futureDevelopments.length).toBeLessThanOrEqual(120);
    expect(new Set(futureDevelopments.map((item) => item.id)).size).toBe(futureDevelopments.length);
  });

  it("has text and only valid themes for every entry", () => {
    for (const item of futureDevelopments) {
      expect(item.id.trim()).not.toBe("");
      expect(item.development.trim()).not.toBe("");
      expect(item.themes.length).toBeGreaterThan(0);
      expect(item.themes.every((theme) => validThemes.has(theme))).toBe(true);
    }
  });

  it("keeps every major future theme available to children", () => {
    const childSuitable = futureDevelopments.filter((item) => developmentIsSuitableForRole(item, "Barn"));
    expect(childSuitable.length).toBeGreaterThanOrEqual(60);
    for (const theme of validThemes) {
      expect(childSuitable.some((item) => item.themes.includes(theme))).toBe(true);
    }
  });

  it("keeps adult authority, employment and inferred-distress developments away from child seeds", () => {
    for (const id of [
      "ai-detects-distress",
      "ai-detects-burnout",
      "ai-simulates-life-choices",
      "agents-find-work",
      "continuous-local-participation",
      "dynamic-energy-budgets",
      "humans-liable-for-ai",
      "humans-supervise-ai",
      "many-career-switches",
      "needs-before-application",
      "remote-physical-work",
      "robots-dangerous-work",
      "school-detects-isolation",
      "tiny-agent-organisations",
      "work-measured-continuously",
      "robots-personal-care",
    ]) {
      const item = futureDevelopments.find((candidate) => candidate.id === id);
      expect(item).toBeDefined();
      expect(developmentIsSuitableForRole(item!, "Barn")).toBe(false);
    }
  });
});
