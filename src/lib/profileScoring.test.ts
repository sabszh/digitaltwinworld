import { describe, expect, it } from "vitest";
import { addProfiles, getDominantValues, impactsForPlacement, inferAiAttitude } from "@/lib/profileScoring";
import { emptyValueProfile } from "@/data/taxonomies";
import type { CoreTension } from "@/types/world2046";

const tension: CoreTension = { valueA: "safety", valueB: "freedom", summary: "Tryghed mod frihed" };

describe("impactsForPlacement", () => {
  it("moves from valueA to valueB across the axis", () => {
    expect(impactsForPlacement(1, tension)).toEqual({ safety: 2, freedom: -1 });
    expect(impactsForPlacement(4, tension)).toEqual({ safety: -1, freedom: 2 });
    // Monotonic: valueA only falls, valueB only rises.
    const safety = [1, 2, 3, 4].map((p) => impactsForPlacement(p as 1, tension).safety ?? 0);
    const freedom = [1, 2, 3, 4].map((p) => impactsForPlacement(p as 1, tension).freedom ?? 0);
    expect(safety).toEqual([...safety].sort((a, b) => b - a));
    expect(freedom).toEqual([...freedom].sort((a, b) => a - b));
  });

  it("stays inside the range the generated impacts use", () => {
    for (const position of [1, 2, 3, 4] as const) {
      for (const value of Object.values(impactsForPlacement(position, tension))) {
        expect(Math.abs(value as number)).toBeLessThanOrEqual(2);
      }
    }
  });

  it("scores nothing for an answer that rejects the premise", () => {
    expect(impactsForPlacement("off-axis", tension)).toEqual({});
  });

  it("scores nothing when the dilemma recorded no tension", () => {
    expect(impactsForPlacement(2, undefined)).toEqual({});
  });

  it("sums rather than clobbers when both poles are the same value", () => {
    const collapsed: CoreTension = { valueA: "trust", valueB: "trust", summary: "" };
    expect(impactsForPlacement(1, collapsed)).toEqual({ trust: 1 });
  });
});

describe("a journey answered entirely in the traveller's own words", () => {
  // The old behaviour: every written answer stamped +1 trust/localControl/
  // transparency, so five of them produced one fixed profile for everybody.
  const oldStamp = { trust: 1, localControl: 1, transparency: 1 };

  it("no longer collapses five different journeys onto one profile", () => {
    const stamped = [1, 2, 3, 4, 5].reduce((profile) => addProfiles(profile, oldStamp), emptyValueProfile);
    expect(getDominantValues(stamped, 3).map(([key]) => key)).toEqual(["trust", "localControl", "transparency"]);
    expect(inferAiAttitude(stamped)).toBe("pragmatisk og undersøgende");

    // Scored from the text, two travellers who argued opposite positions on the
    // same five dilemmas now land in different places.
    const cautious = [1, 1, 2, 1, 2].reduce<typeof emptyValueProfile>(
      (profile, position) => addProfiles(profile, impactsForPlacement(position as 1, tension)),
      emptyValueProfile,
    );
    const liberal = [4, 4, 3, 4, 3].reduce<typeof emptyValueProfile>(
      (profile, position) => addProfiles(profile, impactsForPlacement(position as 1, tension)),
      emptyValueProfile,
    );
    expect(cautious.safety).toBeGreaterThan(liberal.safety);
    expect(liberal.freedom).toBeGreaterThan(cautious.freedom);
    expect(cautious).not.toEqual(liberal);
  });

  it("leaves an all-off-axis journey empty rather than inventing a profile", () => {
    const profile = [1, 2, 3, 4, 5].reduce(
      (acc) => addProfiles(acc, impactsForPlacement("off-axis", tension)),
      emptyValueProfile,
    );
    expect(profile).toEqual(emptyValueProfile);
  });
});
