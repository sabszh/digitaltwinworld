import { describe, expect, it } from "vitest";
import {
  cleanDescription,
  findMatchingLocations,
  findNearbyLocations,
  findNearestLocation,
  haversineKm,
  parseLocationIndex,
  pickRecording,
  recordingYear,
  scoreRecordingLocationMatch,
} from "@/lib/aporee";

// Real rows from https://aporee.org/api/maps/getAllLocations — coordinates are strings.
const index = [
  { locid: "19366", lat: "56.199291801756", lng: "10.202726125717", title: "Risskov" },
  { locid: "46969", lat: "55.684142", lng: "12.593103", title: "Amalienborg" },
  { locid: "73151", lat: "50.85417886", lng: "4.35203433", title: "Rue de Laeken" },
];

// A real getPlaylist?locids[]= response, trimmed to the fields we read.
const playlist = [
  { sndid: "12", ltitle: "Amalienborg, København", ctitle: "Short clip", mp3: "https://aporee.org/maps/files/short.mp3", artist: "someone", duration: 24, recdate: "20.04.2011 14:52", licence: "CC-BY-SA" },
  { sndid: "34", ltitle: "Amalienborg Royal marches, København Denmark", ctitle: "Changing of the Amalienborg Royal guards", mp3: "https://aporee.org/maps/files/guards.mp3", artist: "john grzinich", duration: 227, recdate: "26.09.2013 12:00", licence: "PUBLIC-DOMAIN" },
];

const info = [
  { id: "12", descr: "a short one" },
  { id: "34", descr: "A marching band accompanies the changing of the Royal guard.<br />\r\nTascam DR-100 with built in uni mics." },
];

describe("haversineKm", () => {
  it("measures a known distance", () => {
    // Aarhus → Copenhagen is roughly 150 km
    expect(haversineKm(56.1629, 10.2039, 55.6761, 12.5683)).toBeGreaterThan(140);
    expect(haversineKm(56.1629, 10.2039, 55.6761, 12.5683)).toBeLessThan(160);
  });

  it("is zero for the same point", () => {
    expect(haversineKm(56.1629, 10.2039, 56.1629, 10.2039)).toBeCloseTo(0);
  });
});

describe("parseLocationIndex", () => {
  it("keeps rows with usable coordinates and drops the rest", () => {
    const parsed = parseLocationIndex([
      ...index,
      { locid: "1", lat: "abc", lng: "def" },
      { locid: "", lat: "56", lng: "10" },
      { locid: "2", lat: "999", lng: "10" },
      null,
      "nonsense",
    ]);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual({ locid: "19366", lat: 56.199291801756, lng: 10.202726125717, title: "Risskov" });
  });

  it("returns an empty index for a non-array payload", () => {
    // The API answers `false` when it has nothing, and a bare banner string when
    // the Referer header is missing.
    expect(parseLocationIndex(false)).toEqual([]);
    expect(parseLocationIndex("radio aporee ::: maps API v1.0")).toEqual([]);
    expect(parseLocationIndex(null)).toEqual([]);
  });
});

describe("findMatchingLocations", () => {
  const seoulIndex = parseLocationIndex([
    { locid: "hero", lat: "37.56650", lng: "126.97800", title: "Great Hero Hall, Seoul" },
    { locid: "city-hall", lat: "37.56672", lng: "126.97798", title: "Seoul City Hall plaza" },
    { locid: "market", lat: "37.56710", lng: "126.97810", title: "Namdaemun Market, Seoul" },
  ]);

  it("prefers a place/type match over the nearest unrelated landmark", () => {
    const matches = findMatchingLocations(
      seoulIndex,
      37.5665,
      126.978,
      { placeName: "Seoul Metropolitan Government", city: "Seoul", locationType: "kommune" },
    );
    expect(matches.map((item) => item.locid)).toEqual(["city-hall"]);
  });

  it("accepts an exact place-name match even without a known type keyword", () => {
    const matches = findMatchingLocations(
      parseLocationIndex(index),
      55.6844,
      12.5934,
      { placeName: "Amalienborg", city: "København", locationType: "boligområde" },
    );
    expect(matches[0]?.locid).toBe("46969");
  });

  it("returns no sound rather than attaching an unrelated nearby recording", () => {
    expect(
      findMatchingLocations(
        seoulIndex,
        37.5665,
        126.978,
        { placeName: "Seoul Metropolitan Government", city: "Seoul", locationType: "hospital" },
      ),
    ).toEqual([]);
  });

  it("checks recording metadata when an index point only names the city", () => {
    const nearby = findNearbyLocations(seoulIndex, 37.5665, 126.978);
    expect(nearby[0]?.locid).toBe("hero");

    const baseRecording = {
      url: "https://aporee.org/test.mp3",
      place: "Seoul",
      artist: "Test",
      license: "CC-BY",
      description: "Outside the landmark",
      recordedAt: "01.01.2020 12:00",
      durationSeconds: 60,
      distanceKm: 0.01,
    };
    const context = { placeName: "Seoul Metropolitan Government", city: "Seoul", locationType: "kommune" };

    expect(scoreRecordingLocationMatch({ ...baseRecording, title: "Great Hero Hall, Seoul" }, "Seoul", context)).toBeNull();
    expect(scoreRecordingLocationMatch({ ...baseRecording, title: "Morning at Seoul City Hall" }, "Seoul", context)).toBeGreaterThan(0);
  });
});

describe("findNearestLocation", () => {
  it("finds the closest location and reports the distance", () => {
    const nearest = findNearestLocation(parseLocationIndex(index), 55.6844, 12.5934);
    expect(nearest?.locid).toBe("46969");
    expect(nearest?.distanceKm).toBeLessThan(0.5);
  });

  it("returns null for an empty index or unusable coordinates", () => {
    expect(findNearestLocation([], 55.68, 12.59)).toBeNull();
    expect(findNearestLocation(parseLocationIndex(index), Number.NaN, 12.59)).toBeNull();
    expect(findNearestLocation(parseLocationIndex(index), 999, 12.59)).toBeNull();
  });
});

describe("cleanDescription", () => {
  it("strips markup and the contributor's gear sign-off", () => {
    expect(cleanDescription(info[1].descr)).toBe(
      "A marching band accompanies the changing of the Royal guard",
    );
  });

  it("removes a trailing gear parenthetical but keeps a meaningful one", () => {
    expect(cleanDescription("bird communication on a back road. (roland r-07)")).toBe(
      "bird communication on a back road",
    );
    expect(cleanDescription("Plaza de Armas (main square)")).toBe("Plaza de Armas (main square)");
  });

  it("decodes entities and collapses whitespace", () => {
    expect(cleanDescription("rain &amp;   wind<br />from inside the truck")).toBe(
      "rain & wind from inside the truck",
    );
  });

  it("truncates on a word boundary", () => {
    const long = cleanDescription("alpha bravo charlie delta echo foxtrot golf hotel", 20);
    expect(long.endsWith("…")).toBe(true);
    expect(long.length).toBeLessThanOrEqual(21);
    expect(long).not.toContain("fox…");
  });

  it("returns an empty string for anything that is not text", () => {
    expect(cleanDescription(undefined)).toBe("");
    expect(cleanDescription(null)).toBe("");
    expect(cleanDescription(42)).toBe("");
  });
});

describe("pickRecording", () => {
  it("prefers the longest recording and attaches its description", () => {
    const recording = pickRecording(playlist, info, 0.08);
    expect(recording?.url).toBe("https://aporee.org/maps/files/guards.mp3");
    expect(recording?.title).toBe("Changing of the Amalienborg Royal guards");
    expect(recording?.artist).toBe("john grzinich");
    expect(recording?.license).toBe("PUBLIC-DOMAIN");
    expect(recording?.durationSeconds).toBe(227);
    expect(recording?.distanceKm).toBeCloseTo(0.08);
    expect(recording?.description).toBe(
      "A marching band accompanies the changing of the Royal guard",
    );
  });

  it("still returns a recording when the description lookup failed", () => {
    expect(pickRecording(playlist, false, 1)?.description).toBe("");
    expect(pickRecording(playlist, null, 1)?.title).toBe("Changing of the Amalienborg Royal guards");
  });

  it("skips rows without a usable audio URL", () => {
    const rows = [
      { sndid: "1", ctitle: "no url", duration: 900 },
      { sndid: "2", ctitle: "relative", mp3: "/maps/files/x.mp3", duration: 800 },
      { sndid: "3", ctitle: "good", mp3: "https://aporee.org/good.mp3", duration: 10 },
    ];
    expect(pickRecording(rows, [], 1)?.title).toBe("good");
  });

  it("returns null when there is nothing playable", () => {
    expect(pickRecording([], [], 1)).toBeNull();
    expect(pickRecording(false, [], 1)).toBeNull();
    expect(pickRecording([{ sndid: "1", ctitle: "no url" }], [], 1)).toBeNull();
  });
});

describe("recordingYear", () => {
  it("reads the year out of aporee's date format", () => {
    expect(recordingYear("26.09.2013 12:00")).toBe("2013");
  });

  it("returns an empty string for anything else", () => {
    expect(recordingYear("")).toBe("");
    expect(recordingYear("2013-09-26")).toBe("");
  });
});
