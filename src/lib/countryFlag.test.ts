import { describe, expect, it } from "vitest";
import { countryFlag } from "@/lib/countryFlag";

describe("countryFlag", () => {
  it("uses the ISO country code supplied by global random locations", () => {
    expect(countryFlag("Japan", "JP")).toBe("🇯🇵");
  });

  it("recognizes countries from the local location pool", () => {
    expect(countryFlag("Danmark", "Norden")).toBe("🇩🇰");
    expect(countryFlag("Forenede Arabiske Emirater", "Mellemøsten")).toBe("🇦🇪");
  });

  it("uses a globe only when no country code can be determined", () => {
    expect(countryFlag("Ukendt", "Verden")).toBe("🌍");
  });
});

