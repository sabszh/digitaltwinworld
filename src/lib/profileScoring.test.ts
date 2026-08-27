import { describe, expect, it } from "vitest";
import { addProfiles, getDominantValues, impactsForMatchedChoice, inferAiAttitude } from "@/lib/profileScoring";
import { emptyValueProfile } from "@/data/taxonomies";
import type { Choice } from "@/types/world2046";

const choices: Choice[] = [
  { id: "a", label: "Vent på den sikre rute", valueImpacts: { safety: 2, freedom: -1, trust: 1 } },
  { id: "b", label: "Tag den åbne rute", valueImpacts: { freedom: 2, safety: -1, localControl: 1 } },
  { id: "c", label: "Del ansvaret", valueImpacts: { equality: 1, trust: 1, efficiency: -1 } },
  { id: "d", label: "Vælg en anden dag", valueImpacts: { sustainability: 1, freedom: -1, safety: 1 } },
];

describe("impactsForMatchedChoice", () => {
  it("uses the authored action's impacts rather than an invented value axis", () => {
    expect(impactsForMatchedChoice("a", choices)).toEqual(choices[0].valueImpacts);
    expect(impactsForMatchedChoice("c", choices)).toEqual(choices[2].valueImpacts);
  });

  it("scores nothing when a written answer cannot honestly match an action", () => {
    expect(impactsForMatchedChoice("unscored", choices)).toEqual({});
    expect(impactsForMatchedChoice("a", undefined)).toEqual({});
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

    // Scored from matching actions, two travellers who choose different
    // concrete responses land in different places without an invisible scale.
    const cautious = ["a", "a", "d", "a", "d"].reduce<typeof emptyValueProfile>(
      (profile, choiceId) => addProfiles(profile, impactsForMatchedChoice(choiceId, choices)),
      emptyValueProfile,
    );
    const liberal = ["b", "b", "c", "b", "c"].reduce<typeof emptyValueProfile>(
      (profile, choiceId) => addProfiles(profile, impactsForMatchedChoice(choiceId, choices)),
      emptyValueProfile,
    );
    expect(cautious.safety).toBeGreaterThan(liberal.safety);
    expect(liberal.freedom).toBeGreaterThan(cautious.freedom);
    expect(cautious).not.toEqual(liberal);
  });

  it("leaves an all-unscored journey empty rather than inventing a profile", () => {
    const profile = [1, 2, 3, 4, 5].reduce(
      (acc) => addProfiles(acc, impactsForMatchedChoice("unscored", choices)),
      emptyValueProfile,
    );
    expect(profile).toEqual(emptyValueProfile);
  });
});
