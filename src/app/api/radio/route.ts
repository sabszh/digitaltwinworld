import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RadioStation = {
  stationuuid?: string;
  name?: string;
  url_resolved?: string;
  url?: string;
  homepage?: string;
  country?: string;
  countrycode?: string;
  tags?: string;
  geo_lat?: number;
  geo_long?: number;
};

const RADIO_API = "https://radios.axiomaudio.com/json/stations/search";
const SEARCH_RADIUS_METERS = 1_500_000;

function isValidCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function playableUrl(station: RadioStation) {
  const candidate = station.url_resolved ?? station.url;
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeStation(station: RadioStation) {
  const streamUrl = playableUrl(station);
  if (!streamUrl) return undefined;

  return {
    id: station.stationuuid ?? streamUrl,
    name: station.name?.trim() || "World radio",
    streamUrl,
    homepage: station.homepage,
    country: station.country,
    countrycode: station.countrycode,
    tags: station.tags,
  };
}

async function fetchStations(params: URLSearchParams) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5500);

  try {
    const response = await fetch(`${RADIO_API}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "World2046/1.0 (ambient journey audio)",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? (data as RadioStation[]) : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!isValidCoordinate(lat, -90, 90) || !isValidCoordinate(lng, -180, 180)) {
    return NextResponse.json({ error: "Invalid landing coordinates" }, { status: 400 });
  }

  const localParams = new URLSearchParams({
    geo_lat: String(lat),
    geo_long: String(lng),
    geo_distance: String(SEARCH_RADIUS_METERS),
    has_geo_info: "true",
    hidebroken: "true",
    order: "random",
    limit: "24",
  });

  let stations = await fetchStations(localParams);

  // Remote station coverage is uneven, so keep the experience working when
  // the landing area has no nearby geo-tagged stations.
  if (stations.length === 0) {
    stations = await fetchStations(new URLSearchParams({
      hidebroken: "true",
      order: "random",
      limit: "40",
    }));
  }

  const playableStations = stations.map(sanitizeStation).filter(Boolean);
  if (playableStations.length === 0) {
    return NextResponse.json({ station: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const station = playableStations[Math.floor(Math.random() * playableStations.length)];
  return NextResponse.json(
    { station },
    { headers: { "Cache-Control": "no-store" } },
  );
}
