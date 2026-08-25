/**
 * Resolve a generated place to real coordinates.
 *
 * The model invents both the place name and its lat/lng, and the coordinates are
 * a guess at the city — which is how a made-up "Borgerservice Aarhus" ended up
 * rendering as an aerial photo of a residential block. Looking the place up puts
 * the camera on the actual building.
 *
 * This uses the Search Box API, not the Geocoding API. Geocoding v6 matches
 * addresses and place names but not points of interest: asked for "Dokk1" — one
 * of the most recognisable buildings in Aarhus — it returned a motorway 8 km
 * away. Search Box resolves it to Hack Kampmanns Plads, and returns nothing at
 * all for institutions that do not exist, which is the useful half of the answer.
 *
 * Never fatal: any failure keeps the model's own marker and the journey continues.
 */

export type GeocodeQuery = {
  name: string;
  city: string;
  country: string;
};

export type Coordinates = { lat: number; lng: number };
export type GeocodeResult = {
  coordinates: Coordinates;
  address?: string;
  source: "searchbox" | "model";
};

const ENDPOINT = "https://api.mapbox.com/search/searchbox/v1/forward";
const TIMEOUT_MS = 5000;
/** A hit further out than this is a similarly named place in another town —
 *  Denmark has a Sct. Josef Skole in Horsens and the model will happily place it
 *  in Vejle. Tight enough to catch that; loose enough for a large city. */
const MAX_DRIFT_KM = 25;

/** Search Box returns [lng, lat] — the opposite order to everything else here. */
export function readSearchResult(payload: unknown): { coordinates: Coordinates; address?: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const features = (payload as { features?: unknown }).features;
  if (!Array.isArray(features) || features.length === 0) return null;

  for (const feature of features) {
    const entry = feature as { geometry?: { coordinates?: unknown }; properties?: { full_address?: unknown } };
    const pair = entry.geometry?.coordinates;
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const lng = Number(pair[0]);
    const lat = Number(pair[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
    const address = typeof entry.properties?.full_address === "string" ? entry.properties.full_address : undefined;
    return { coordinates: { lat, lng }, address };
  }
  return null;
}

export async function locatePlace(
  place: GeocodeQuery,
  fallback: Coordinates,
  token: string | undefined,
  distanceKm: (aLat: number, aLng: number, bLat: number, bLng: number) => number,
): Promise<GeocodeResult> {
  if (!token || !place.name.trim()) return { coordinates: fallback, source: "model" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Proximity alone is not enough — it is a ranking hint, not a filter, and the
    // search matches phonetically across the whole planet: "Ringstedvejens Skole"
    // came back as Сколе in Ukraine, "Gjesing Skole" as Skölevägen in Sweden. A
    // bounding box around the intended town turns the hint into a constraint.
    const box = 0.45;
    const bbox = [fallback.lng - box, fallback.lat - box / 2, fallback.lng + box, fallback.lat + box / 2].join(",");
    const query = encodeURIComponent(`${place.name}, ${place.city}`);
    const url =
      `${ENDPOINT}?q=${query}&proximity=${fallback.lng},${fallback.lat}` +
      `&bbox=${bbox}&limit=1&access_token=${encodeURIComponent(token)}`;
    const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) return { coordinates: fallback, source: "model" };

    const found = readSearchResult(await response.json());
    if (!found) return { coordinates: fallback, source: "model" };
    if (distanceKm(fallback.lat, fallback.lng, found.coordinates.lat, found.coordinates.lng) > MAX_DRIFT_KM) {
      return { coordinates: fallback, source: "model" };
    }
    return { coordinates: found.coordinates, address: found.address, source: "searchbox" };
  } catch {
    return { coordinates: fallback, source: "model" };
  } finally {
    clearTimeout(timeout);
  }
}
