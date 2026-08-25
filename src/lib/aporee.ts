/**
 * Radio Aporee field recordings, keyed to a destination's coordinates.
 *
 * We use the same API the aporee map itself uses, not the public
 * `/api/ext/` endpoint. Three reasons:
 *   - `/api/ext/` returns five *neighbouring* recordings and, in practice,
 *     usually not the one standing on the location itself
 *   - it carries no description, which is the part worth showing the player
 *   - it caps at five results with no way to widen or narrow the pick
 *
 * The map API is undocumented and answers every request with a bare version
 * banner unless a `Referer` of https://aporee.org/maps/ is sent. Endpoints used:
 *   getAllLocations                 → every location: locid + lat/lng (~8 MB)
 *   getPlaylist?locids[]=<locid>    → the sounds there, incl. the mp3 URL
 *   getLocationInfo?locid=<locid>   → the same sounds, incl. `descr`
 */

export type FieldRecording = {
  url: string;
  title: string;
  place: string;
  artist: string;
  license: string;
  description: string;
  /** As aporee stores it: "26.09.2013 12:00". Not normalised — see formatRecordedAt. */
  recordedAt: string;
  durationSeconds: number;
  distanceKm: number;
};

export type LocationIndexEntry = { locid: string; lat: number; lng: number; title: string };
export type LocationMatchContext = { placeName: string; city: string; locationType: string };
export type MatchingLocation = LocationIndexEntry & { distanceKm: number; score: number };

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function isUsableCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" && Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    typeof lng === "number" && Number.isFinite(lng) && Math.abs(lng) <= 180
  );
}

const asText = (value: unknown, fallback = "") => (typeof value === "string" && value.trim() ? value.trim() : fallback);

/** Coordinates arrive as strings throughout this API. */
const asCoordinate = (value: unknown) => Number.parseFloat(String(value));

export function parseLocationIndex(payload: unknown): LocationIndexEntry[] {
  if (!Array.isArray(payload)) return [];

  const index: LocationIndexEntry[] = [];
  for (const entry of payload) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const lat = asCoordinate(row.lat);
    const lng = asCoordinate(row.lng);
    const locid = asText(row.locid);
    const title = asText(row.title);
    if (!locid || !isUsableCoordinate(lat, lng)) continue;
    index.push({ locid, lat, lng, title });
  }
  return index;
}

const GENERIC_PLACE_WORDS = new Set([
  "the", "and", "for", "ved", "hos", "center", "centre", "building", "bygning",
  "seoul", "aarhus", "københavn", "copenhagen", "odense", "aalborg", "esbjerg",
]);

function placeWords(value: string): Set<string> {
  return new Set(
    value.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word.length >= 4 && !GENERIC_PLACE_WORDS.has(word)),
  );
}

const TYPE_PATTERNS: Array<{ types: string[]; pattern: RegExp }> = [
  { types: ["kommune", "rådhus", "digital borgerservice"], pattern: /\b(city hall|town hall|municipal|municipality|government|council|rådhus|kommune|mairie|ayuntamiento|prefeitura)\b/iu },
  { types: ["folkeskole", "gymnasium", "universitet", "fritidsklub"], pattern: /\b(school|college|university|campus|academy|skole|gymnasium|universitet|lycée|école)\b/iu },
  { types: ["hospital", "sundhedsklinik", "plejehjem", "apotek", "mental health center"], pattern: /\b(hospital|clinic|medical|health|care home|pharmacy|hospitalet|klinik|plejehjem|apotek)\b/iu },
  { types: ["togstation", "lufthavn", "havn", "vej", "cykelkryds"], pattern: /\b(station|airport|terminal|harbour|harbor|port|railway|metro|road|street|stationen|lufthavn|havn)\b/iu },
  { types: ["bibliotek"], pattern: /\b(library|bibliotek|bibliothèque|biblioteca)\b/iu },
  { types: ["boligområde", "hjemmet"], pattern: /\b(housing|residential|estate|neighbou?rhood|homes?|apartments?|bolig|kvarter)\b/iu },
  { types: ["supermarked"], pattern: /\b(market|supermarket|food hall|marked|butik)\b/iu },
  { types: ["fabrik", "lager", "distributionscenter", "datacenter"], pattern: /\b(factory|plant|warehouse|industrial|distribution|data cent(er|re)|fabrik|lager)\b/iu },
  { types: ["gård", "landbrug"], pattern: /\b(farm|agriculture|fields?|gård|landbrug)\b/iu },
  { types: ["vandværk", "energinet"], pattern: /\b(waterworks|water plant|power station|substation|utility|vandværk|elværk)\b/iu },
  { types: ["kystby", "bymidte"], pattern: /\b(city cent(er|re)|downtown|square|plaza|waterfront|seafront|bymidte|torv)\b/iu },
];

function matchesLocationType(title: string, locationType: string): boolean {
  return TYPE_PATTERNS.some(({ types, pattern }) => types.includes(locationType) && pattern.test(title));
}

/**
 * Find Aporee map points that match the destination itself, not merely its city.
 * City-only overlap is deliberately ignored: "Great Hero Hall, Seoul" must not
 * become the sound of Seoul Metropolitan Government just because both say Seoul.
 */
export function findMatchingLocations(
  index: LocationIndexEntry[],
  lat: number,
  lng: number,
  context: LocationMatchContext,
  maxDistanceKm = 8,
  limit = 5,
): MatchingLocation[] {
  if (!isUsableCoordinate(lat, lng) || !context.placeName.trim() || !context.locationType.trim()) return [];

  const cityWords = placeWords(context.city);
  const exactWords = [...placeWords(context.placeName)].filter((word) => !cityWords.has(word));

  return index
    .map((entry) => {
      const distanceKm = haversineKm(lat, lng, entry.lat, entry.lng);
      const candidateWords = placeWords(entry.title);
      const exactOverlap = exactWords.filter((word) => candidateWords.has(word)).length;
      const typeMatch = matchesLocationType(entry.title, context.locationType);
      if (distanceKm > maxDistanceKm || (exactOverlap === 0 && !typeMatch)) return null;
      return {
        ...entry,
        distanceKm,
        score: exactOverlap * 120 + (typeMatch ? 45 : 0) - distanceKm * 4,
      };
    })
    .filter((entry): entry is MatchingLocation => entry !== null)
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/** Nearest candidates to inspect when the index title itself is generic. */
export function findNearbyLocations(
  index: LocationIndexEntry[],
  lat: number,
  lng: number,
  maxDistanceKm = 8,
  limit = 8,
): MatchingLocation[] {
  if (!isUsableCoordinate(lat, lng)) return [];
  return index
    .map((entry) => ({ ...entry, distanceKm: haversineKm(lat, lng, entry.lat, entry.lng), score: 0 }))
    .filter((entry) => entry.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Score the actual recording metadata against the destination. This second pass
 * matters because many Aporee index points are just called "Seoul" or "Paris",
 * while their only audio file names a completely different landmark.
 */
export function scoreRecordingLocationMatch(
  recording: FieldRecording,
  indexTitle: string,
  context: LocationMatchContext,
): number | null {
  const cityWords = placeWords(context.city);
  const exactWords = [...placeWords(context.placeName)].filter((word) => !cityWords.has(word));
  const searchable = [indexTitle, recording.title, recording.place, recording.description].filter(Boolean).join(" ");
  const candidateWords = placeWords(searchable);
  const exactOverlap = exactWords.filter((word) => candidateWords.has(word)).length;
  const typeMatch = matchesLocationType(searchable, context.locationType);
  if (exactOverlap === 0 && !typeMatch) return null;
  return exactOverlap * 120 + (typeMatch ? 45 : 0) - recording.distanceKm * 4;
}

export function findNearestLocation(
  index: LocationIndexEntry[],
  lat: number,
  lng: number,
): { locid: string; distanceKm: number } | null {
  if (!isUsableCoordinate(lat, lng)) return null;

  let bestLocid = "";
  let bestDistance = Infinity;
  for (const entry of index) {
    const distanceKm = haversineKm(lat, lng, entry.lat, entry.lng);
    if (distanceKm < bestDistance) {
      bestDistance = distanceKm;
      bestLocid = entry.locid;
    }
  }

  return bestLocid ? { locid: bestLocid, distanceKm: bestDistance } : null;
}

/** Contributors routinely sign off with their gear; the player does not need it. */
// [\s\S] rather than the `s` flag, and no lookbehind below: tsconfig targets ES2017.
const TECH_NOTE = /\b(tech(nical)?\s*note)\b\s*:?[\s\S]*$/i;
const GEAR_BRANDS = /zoom|tascam|sony\s*pcm|dpa|rode|røde|roland|sennheiser|audio-?technica|zoom\s*h\d|mixpre|olympus|marantz|shure|sound\s*devices|minidisc|\bmd\s*recorder/i;

/**
 * Descriptions arrive as user-entered HTML in whatever language the contributor
 * writes, often with a gear list bolted onto the end.
 */
export function cleanDescription(raw: unknown, maxLength = 240): string {
  if (typeof raw !== "string") return "";

  let text = raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  text = text.replace(TECH_NOTE, "").trim();
  // Trailing parentheticals are almost always the gear: "(roland r-07)".
  text = text.replace(/\(([^()]{0,60})\)\s*$/, (match, inner: string) => (GEAR_BRANDS.test(inner) ? "" : match)).trim();

  // Gear also shows up as a bare closing sentence — "Tascam DR-100 with built in
  // uni mics." The word count keeps this from eating sentences that name a
  // recorder in passing but still say something, such as "Recorded on a Zoom H4n
  // while walking through the flea market."
  const sentences = (text.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [text]).map((part) => part.trim()).filter(Boolean);
  while (sentences.length > 1) {
    const last = sentences[sentences.length - 1];
    if (!GEAR_BRANDS.test(last) || last.split(/\s+/).length > 8) break;
    sentences.pop();
  }
  text = sentences.join(" ").trim();

  text = text.replace(/[.,;:\s]+$/, "").trim();

  if (text.length <= maxLength) return text;
  // Cut on a word boundary rather than mid-word.
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, "")}…`;
}

type PlaylistRow = Record<string, unknown>;

const playableRows = (payload: unknown): PlaylistRow[] => {
  if (!Array.isArray(payload)) return [];
  return payload.filter((entry): entry is PlaylistRow => {
    if (!entry || typeof entry !== "object") return false;
    return /^https?:\/\//i.test(asText((entry as PlaylistRow).mp3 ?? (entry as PlaylistRow).file));
  });
};

/**
 * Picks the recording to play from a location's playlist, and folds in the
 * matching description from getLocationInfo when one is available.
 *
 * The longest recording wins: this plays as a background loop, so a five-minute
 * ambience seams far less often than a twenty-second clip.
 */
export function pickRecording(
  playlistPayload: unknown,
  infoPayload: unknown,
  distanceKm: number,
): FieldRecording | null {
  const rows = playableRows(playlistPayload);
  if (rows.length === 0) return null;

  const best = rows.reduce((winner, row) => {
    const a = Number(row.duration);
    const b = Number(winner.duration);
    return (Number.isFinite(a) ? a : 0) > (Number.isFinite(b) ? b : 0) ? row : winner;
  });

  const sndid = asText(best.sndid);
  const infoRows = Array.isArray(infoPayload) ? (infoPayload as PlaylistRow[]) : [];
  const info =
    infoRows.find((row) => row && typeof row === "object" && asText(row.id) === sndid && sndid !== "") ??
    (infoRows.length === 1 ? infoRows[0] : undefined);

  const duration = Number(best.duration);

  return {
    url: asText(best.mp3 ?? best.file),
    title: asText(best.ctitle, "Feltoptagelse"),
    place: asText(best.ltitle),
    artist: asText(best.artist),
    // getPlaylist spells it `licence`; the older endpoint used `license`.
    license: asText(best.licence ?? best.license),
    description: cleanDescription(info?.descr),
    recordedAt: asText(best.recdate),
    durationSeconds: Number.isFinite(duration) ? duration : 0,
    distanceKm,
  };
}

/** "26.09.2013 12:00" → "2013". Returns "" for anything unexpected. */
export function recordingYear(recordedAt: string): string {
  const match = /^\d{2}\.\d{2}\.(\d{4})/.exec(recordedAt.trim());
  return match ? match[1] : "";
}
