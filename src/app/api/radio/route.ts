import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RadioStation = {
  stationuuid?: string;
  name?: string;
  url_resolved?: string;
  url?: string;
  countrycode?: string;
  codec?: string;
  bitrate?: number;
  lastcheckok?: number | boolean;
  geo_lat?: number;
  geo_long?: number;
};

const MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];
const SEARCH_RADIUS_METERS = 1_500_000;
const SUPPORTED_CODECS = new Set(["MP3", "AAC", "AAC+"]);

function validCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function distanceKm(latA: number, lngA: number, latB?: number, lngB?: number) {
  if (!Number.isFinite(latB) || !Number.isFinite(lngB)) return undefined;
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians((latB as number) - latA);
  const dLng = radians((lngB as number) - lngA);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(latA)) * Math.cos(radians(latB as number)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function sanitize(station: RadioStation, lat: number, lng: number) {
  const candidate = station.url_resolved ?? station.url;
  if (!candidate || !station.stationuuid) return undefined;
  try {
    const url = new URL(candidate);
    const codec = station.codec?.toUpperCase() ?? "";
    if (url.protocol !== "https:" || !SUPPORTED_CODECS.has(codec) || station.lastcheckok === 0 || station.lastcheckok === false) return undefined;
    return {
      id: station.stationuuid,
      name: station.name?.trim() || "World radio",
      streamUrl: url.toString(),
      countryCode: station.countrycode,
      codec,
      bitrate: Number(station.bitrate) || 0,
      distanceKm: distanceKm(lat, lng, station.geo_lat, station.geo_long),
    };
  } catch {
    return undefined;
  }
}

async function requestMirror(mirror: string, params: URLSearchParams) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(`${mirror}/json/stations/search?${params.toString()}`, {
      headers: { Accept: "application/json", "User-Agent": "World2046/1.0 (exhibition ambience)" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return [];
    const value = await response.json() as unknown;
    return Array.isArray(value) ? value as RadioStation[] : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithFailover(params: URLSearchParams) {
  const start = Math.floor(Math.random() * MIRRORS.length);
  for (let offset = 0; offset < MIRRORS.length; offset += 1) {
    const stations = await requestMirror(MIRRORS[(start + offset) % MIRRORS.length], params);
    if (stations.length > 0) return stations;
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!validCoordinate(lat, -90, 90) || !validCoordinate(lng, -180, 180)) {
    return NextResponse.json({ error: "Invalid landing coordinates" }, { status: 400 });
  }

  const nearby = new URLSearchParams({ geo_lat: String(lat), geo_long: String(lng), geo_distance: String(SEARCH_RADIUS_METERS), has_geo_info: "true", hidebroken: "true", order: "clickcount", reverse: "true", limit: "40" });
  let raw = await fetchWithFailover(nearby);
  if (raw.length === 0) raw = await fetchWithFailover(new URLSearchParams({ hidebroken: "true", order: "clickcount", reverse: "true", limit: "60" }));

  const stations = raw.map((station) => sanitize(station, lat, lng)).filter((station): station is NonNullable<typeof station> => Boolean(station)).sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999) || b.bitrate - a.bitrate).slice(0, 8);
  return NextResponse.json({ stations }, { headers: { "Cache-Control": "no-store" } });
}
