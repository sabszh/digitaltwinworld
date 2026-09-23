import { describe, expect, it } from "vitest";
import { formatJourneyTime } from "./JourneyTimer";

describe("formatJourneyTime", () => {
  it("formats the five-minute countdown and clamps at zero", () => {
    expect(formatJourneyTime(300)).toBe("05:00");
    expect(formatJourneyTime(61)).toBe("01:01");
    expect(formatJourneyTime(0)).toBe("00:00");
    expect(formatJourneyTime(-1)).toBe("00:00");
  });
});
