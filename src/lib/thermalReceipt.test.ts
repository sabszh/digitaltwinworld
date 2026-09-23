import { describe, expect, it } from "vitest";
import { emptyValueProfile } from "@/data/taxonomies";
import { valueBarRatio, valueProfileScale } from "@/lib/thermalReceipt";

describe("thermal receipt value scale", () => {
  it("lets the strongest value reach the end of the printed axis", () => {
    const profile = { ...emptyValueProfile, trust: 6, freedom: -3, equality: 2 };
    const scale = valueProfileScale(profile);

    expect(scale).toBe(6);
    expect(valueBarRatio(profile.trust, scale)).toBe(1);
    expect(valueBarRatio(profile.freedom, scale)).toBe(0.5);
  });

  it("keeps an empty profile at the neutral centre", () => {
    const scale = valueProfileScale(emptyValueProfile);

    expect(scale).toBe(1);
    expect(valueBarRatio(0, scale)).toBe(0);
  });
});
