import { NextResponse } from "next/server";
import {
  findNearbyLocations,
  isUsableCoordinate,
  parseLocationIndex,
  pickRecording,
  scoreRecordingLocationMatch,
  type FieldRecording,
  type LocationIndexEntry,
} from "@/lib/aporee";

export const runtime = "nodejs";

// Aporee sends no CORS headers, so the browser cannot call it directly. This
// route proxies it, holds the location index in memory and resolves the nearest
// location server-side.
const MAPS_API = "https://aporee.org/api/maps/";
// The map API answers with a bare version banner unless it recognises the caller.
const HEADERS = { Referer: "https://aporee.org/maps/", Accept: "application/json" };

const INDEX_TIMEOUT_MS = 20000;
const LOOKUP_TIMEOUT_MS = 8000;
const INDEX_TTL_MS = 24 * 60 * 60 * 1000;
// Search broadly enough to find an exact venue/type match, but only accept an
// unrelated recording as "nearby" when it is within walking distance.
const MAX_DISTANCE_KM = 8;
const MAX_CANDIDATES = 5;
const NEARBY_FALLBACK_KM = 1.5;

/** Every failure path returns 200 with a null recording. The client then uses
 *  its local drone fallback instead of surfacing an error or leaving silence. */
const silent = (reason: string) => NextResponse.json({ recording: null, reason });

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: HEADERS, cache: "no-store" });
    if (!response.ok) return null;
    // A location with nothing to return answers with the literal `false`, and
    // bad input answers 200 with an empty body — both break JSON.parse.
    const body = (await response.text()).trim();
    if (!body || body === "false") return null;
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

type IndexCache = { entries: LocationIndexEntry[]; loadedAt: number };

let cache: IndexCache | null = null;
// Arrivals can overlap; without this the 8 MB download would run several times.
let inFlight: Promise<IndexCache | null> | null = null;

async function loadLocationIndex(): Promise<LocationIndexEntry[] | null> {
  if (cache && Date.now() - cache.loadedAt < INDEX_TTL_MS) return cache.entries;

  inFlight ??= (async () => {
    const payload = await fetchJson(`${MAPS_API}getAllLocations`, INDEX_TIMEOUT_MS);
    const entries = parseLocationIndex(payload);
    if (entries.length === 0) return null;
    return { entries, loadedAt: Date.now() };
  })().finally(() => {
    inFlight = null;
  });

  const loaded = await inFlight;
  // Keep serving the stale index if a refresh fails — silence is worse than old data.
  if (loaded) cache = loaded;
  return cache?.entries ?? null;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number.parseFloat(params.get("lat") ?? "");
  const lng = Number.parseFloat(params.get("lng") ?? "");
  const placeName = (params.get("place") ?? "").trim().slice(0, 160);
  const city = (params.get("city") ?? "").trim().slice(0, 100);
  const locationType = (params.get("type") ?? "").trim().slice(0, 80);

  if (!isUsableCoordinate(lat, lng)) return silent("invalid_coordinates");
  if (!placeName || !locationType) return silent("missing_location_context");

  const index = await loadLocationIndex();
  if (!index) return silent("location_index_unavailable");

  const context = { placeName, city, locationType };
  const candidates = findNearbyLocations(index, lat, lng, MAX_DISTANCE_KM, MAX_CANDIDATES);
  if (candidates.length === 0) return silent("no_nearby_recording_points");

  // A relevant Aporee point can have no playable files, so inspect a small
  // ranked set together and keep the highest-ranked one that actually plays.
  const recordings = await Promise.all(
    candidates.map(async (candidate) => {
      const [playlist, info] = await Promise.all([
        fetchJson(`${MAPS_API}getPlaylist?locids[]=${encodeURIComponent(candidate.locid)}`, LOOKUP_TIMEOUT_MS),
        fetchJson(`${MAPS_API}getLocationInfo?locid=${encodeURIComponent(candidate.locid)}`, LOOKUP_TIMEOUT_MS),
      ]);
      const recording = pickRecording(playlist, info, candidate.distanceKm);
      if (!recording) return null;
      const score = scoreRecordingLocationMatch(recording, candidate.title, context);
      return { recording, score };
    }),
  );

  const matched = recordings
    .filter((item): item is { recording: FieldRecording; score: number } => item !== null && item.score !== null)
    .sort((a, b) => b.score - a.score)[0];
  if (matched) return NextResponse.json({ recording: matched.recording, match: "location" });

  const nearby = recordings
    .filter((item): item is { recording: FieldRecording; score: null } => item !== null)
    .map((item) => item.recording)
    .filter((recording) => recording.distanceKm <= NEARBY_FALLBACK_KM)
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  if (!nearby) return silent("no_location_relevant_or_nearby_recording");

  return NextResponse.json({ recording: nearby, match: "nearby" });
}
