import { describe, expect, it, vi } from "vitest";
import { fetchRandomJourneyLocation } from "@/lib/randomLocation";
import type { CompletedDilemma } from "@/types/world2046";

function response(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

describe("global random journey locations", () => {
  it("returns a city with its localized country and coordinates", async () => {
    const fetcher = vi.fn(async () => response({
      name: "Tsukuba",
      region: "JP",
      population: 241656,
      lat: 36.08333,
      lon: 140.11667,
    }));

    const location = await fetchRandomJourneyLocation([], "da", fetcher as typeof fetch);

    expect(location).toMatchObject({ city: "Tsukuba", country: "Japan", region: "JP", lat: 36.08333, lng: 140.11667 });
    expect(fetcher).toHaveBeenCalledWith(
      "https://randomcities.com/api/random-city",
      expect.objectContaining({ body: JSON.stringify({ minPopulation: 50000, region: "" }) }),
    );
  });

  it("rejects a repeated city and retries", async () => {
    const previous = [{ city: "Tsukuba", country: "Japan" }] as CompletedDilemma[];
    const fetcher = vi.fn()
      .mockResolvedValueOnce(response({ name: "Tsukuba", region: "JP", population: 241656, lat: 36, lon: 140 }))
      .mockResolvedValueOnce(response({ name: "Mendoza", region: "AR", population: 120000, lat: -32.89, lon: -68.84 }));

    const location = await fetchRandomJourneyLocation(previous, "da", fetcher as typeof fetch);

    expect(location?.city).toBe("Mendoza");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("falls back when the service returns unusable data", async () => {
    const fetcher = vi.fn(async () => response({ city: "Missing coordinates" }));

    await expect(fetchRandomJourneyLocation([], "da", fetcher as typeof fetch)).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
