import type { Language } from "@/lib/i18n";
import type { CompletedDilemma, LocationNode } from "@/types/world2046";

const RANDOM_CITY_ENDPOINT = "https://randomcities.com/api/random-city";
const MINIMUM_POPULATION = 50_000;
const REQUEST_TIMEOUT_MS = 3_000;
const MAX_ATTEMPTS = 3;

type RandomCityResponse = {
  name?: unknown;
  region?: unknown;
  population?: unknown;
  lat?: unknown;
  lon?: unknown;
};

function cityKey(city: string, country: string) {
  return `${city.trim().toLocaleLowerCase()}|${country.trim().toLocaleLowerCase()}`;
}

function countryName(countryCode: string, language: Language) {
  try {
    return new Intl.DisplayNames([language], { type: "region" }).of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function locationId(city: string, countryCode: string) {
  const slug = city
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `random-${countryCode.toLocaleLowerCase()}-${slug || "city"}`;
}

function parseRandomCity(payload: RandomCityResponse, language: Language): LocationNode | undefined {
  if (typeof payload.name !== "string" || typeof payload.region !== "string") return undefined;

  const city = payload.name.trim();
  const countryCode = payload.region.trim().toLocaleUpperCase();
  const population = Number(payload.population);
  const lat = Number(payload.lat);
  const lng = Number(payload.lon);
  if (
    !city ||
    !/^[A-Z]{2}$/.test(countryCode) ||
    !Number.isFinite(population) ||
    population < MINIMUM_POPULATION ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) return undefined;

  const country = countryName(countryCode, language);
  return {
    id: locationId(city, countryCode),
    region: countryCode,
    country,
    city,
    lat,
    lng,
    validLocationTypes: [],
    validProblemAreas: [],
  };
}

export async function fetchRandomJourneyLocation(
  previous: CompletedDilemma[],
  language: Language,
  fetcher: typeof fetch = fetch,
): Promise<LocationNode | undefined> {
  const used = new Set(previous.map((item) => cityKey(item.city, item.country)));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetcher(RANDOM_CITY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minPopulation: MINIMUM_POPULATION, region: "" }),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) continue;
      const location = parseRandomCity(await response.json() as RandomCityResponse, language);
      if (location && !used.has(cityKey(location.city, location.country))) return location;
    } catch {
      // A local, uniformly random location is selected by roundPlan on failure.
    } finally {
      clearTimeout(timeout);
    }
  }

  return undefined;
}

