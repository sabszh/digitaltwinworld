import { describe, expect, it } from "vitest";
import { futureDevelopments } from "@/data/futureDevelopments";
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
});
