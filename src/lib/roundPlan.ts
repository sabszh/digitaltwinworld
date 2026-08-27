import { futurePressures, pressureFamilies, pressuresById } from "@/data/futurePressures";
import { locations } from "@/data/locations";
import type { FuturePressure, PressureFamily } from "@/data/futurePressures";
import type { CompletedDilemma, LocationNode, ProblemArea } from "@/types/world2046";

/**
 * What one stop on the journey is for.
 *
 * The five stops are choreographed rather than drawn at random. Five
 * independently sampled dilemmas came out as five variations of the same stop —
 * an institution runs a system, something is scarce, and the player decides who
 * gets it. The stages force the journey to move: from the player's own kitchen,
 * out through their working life, up to something society-sized, across to a
 * place where daily life is genuinely different, and back to their own values.
 */
export type JourneyStage = {
  id: string;
  /** Shown to the model as the brief for this stop. */
  brief: string;
  /** How big the decision is allowed to be. */
  scope: string;
  /** Where the player stands. One is picked per round. */
  relations: string[];
  /** The tone of what is at stake. Not every stop may be a crisis. */
  stakeMode: "hverdag" | "vigtigt" | "akut";
  severity: "low" | "medium";
  /** Geography nudge layered on top of the region rotation. */
  place?: string;
};

export const journeyStages: JourneyStage[] = [
  {
    id: "recognisable-everyday",
    brief:
      "Første stop. En helt genkendelig hverdagssituation, hvor 2046 kun kan mærkes på små ting: hvad der står i køkkenet, hvad man plejer at gøre, hvad ingen længere tænker over. Ingen krise. Noget der skal afgøres inden aftensmaden.",
    scope: "Beslutningen rører én husstand, én klasse eller et par kolleger. Ikke en by, ikke en institution.",
    relations: ["sig selv som nabo", "forælder", "voksent barn", "ven", "kunde", "beboer i opgangen"],
    stakeMode: "hverdag",
    severity: "low",
  },
  {
    id: "personal-technology",
    brief:
      "Andet stop. Brugeren står selv midt i noget, hvor 2046's teknologi har taget en beslutning på deres vegne eller på vegne af nogen tæt på dem. Brugeren er den, det sker for — ikke den, der har indført ordningen.",
    scope: "Beslutningen rører brugeren selv og et par mennesker omkring dem.",
    relations: ["patient", "passager", "medarbejder", "elev", "lejer", "pårørende"],
    stakeMode: "vigtigt",
    severity: "low",
  },
  {
    id: "society-scale",
    brief:
      "Tredje stop. Nu er det en ordning, der gælder mange mennesker, og brugeren er en af dem, der er med til at bære den — som kollega, frivillig, underviser eller nabo i kvarteret. Her må beslutningen godt være tung.",
    scope: "Beslutningen rører en arbejdsplads, en skole, et kvarter eller en vagtplan for mange.",
    relations: ["kollega", "underviser", "frivillig", "leder for et lille hold", "nabo i kvarteret", "pårørende til en kollega"],
    stakeMode: "akut",
    severity: "medium",
  },
  {
    id: "elsewhere",
    brief:
      "Fjerde stop. En del af verden, hvor hverdagen er markant anderledes end i Nordeuropa — andet klima, andre familiemønstre, andre institutioner, andre knapheder. Brugeren er gæst i den hverdag og oplever den indefra, ikke som turist og ikke som ekspert.",
    scope: "Beslutningen hører til stedet og ville se anderledes ud hjemme.",
    relations: ["besøgende", "gæst hos en familie", "kollega på et andet hold", "ven af en lokal familie", "medrejsende"],
    stakeMode: "vigtigt",
    severity: "medium",
    place:
      "Vælg et sted, hvor det, der er knapt, og det, man kan regne med, er noget andet end i Danmark. Undgå stereotyper: stedet skal have en almindelig, velfungerende hverdag med sine egne løsninger.",
  },
  {
    id: "close-to-the-bone",
    brief:
      "Femte og sidste stop. Et stille dilemma, der ligger tæt på det, brugeren selv har sagt, de håber på eller frygter — men uden at nævne det og uden at gøre deres eget svar til det rigtige. Ingen alarm. Bare et valg, der bliver ved at ligge og rumstere. Stille betyder tonen, ikke indholdet: ordningen fra A5 er stadig fuldstændig central, og de fire svar handler stadig om den. Pas især på her: de fire svar må IKKE være det samme menneske, der gør det samme over for fire forskellige personer (\'hun spørger sin mor / sin ven / sin nabo / sin kollega\'). Hvert svar skal være en anden slags ordning.",
    scope: "Beslutningen rører brugerens eget liv og en enkelt anden person.",
    relations: ["sig selv", "ven", "forælder", "voksent barn", "kollega man holder af", "nabo man kender godt"],
    stakeMode: "hverdag",
    severity: "medium",
  },
];

export type RoundPlan = {
  round: number;
  pressure: FuturePressure;
  /** The normalised societal response this dilemma takes place inside. */
  response: string;
  /** All plausible societal responses. The creative model chooses the one (or
   * a close sibling) that produces the strongest human conflict. */
  responses: string[];
  severity: "low" | "medium";
  /** Areas that both fit this pressure and have not already been visited. */
  problemAreas: ProblemArea[];
  /** Geography is planned in code; the author only writes what happens there. */
  location: LocationNode;
};

/** Which pressure families a journey has already spent a stop on. */
export function usedPressureFamilies(previous: CompletedDilemma[]): Set<PressureFamily> {
  const families = new Set<PressureFamily>();
  for (const item of previous) {
    const pressure = item.futurePressureId ? pressuresById.get(item.futurePressureId) : undefined;
    if (pressure) families.add(pressure.family);
  }
  return families;
}

type Picker = (max: number) => number;
const randomPick: Picker = (max) => Math.floor(Math.random() * max);

/**
 * Words that point a traveller's own hope or fear at one pressure family.
 *
 * These decide the *first* stop only — see planRound. Both languages are listed
 * because the check-in is answered in whichever language the journey runs in.
 *
 * Each cue is matched with a leading word boundary and an open ending, so a stem
 * catches its inflections ("klima" → klimaet, klimaforandringer) without matching
 * mid-word ("vand" finds vandmangel but not indvandring). Stems that are a prefix
 * of an unrelated common word are therefore still unsafe and are spelled out
 * instead: "havniveau" rather than "hav", which would match English "have".
 */
const familyCues: Record<PressureFamily, string[]> = {
  "klima og natur": [
    "klima", "natur", "vejr", "hedebølg", "tørke", "oversvømm", "havniveau", "drikkevand", "vandmangel",
    "biodiversit", "skov", "fødevare", "landbrug", "miljø", "forurening",
    "climate", "nature", "weather", "heatwave", "drought", "flood", "sea level", "biodiversity",
    "forest", "farming", "environment", "pollution",
  ],
  "mennesker og bevægelse": [
    "migration", "flygtning", "indvandr", "udvandr", "befolkning", "ældre", "aldring", "generation",
    "familie", "bolig", "husleje", "nabolag", "opvækst",
    "migrant", "refugee", "ageing", "aging", "elderly", "population", "family", "housing", "rent",
    "neighbourhood", "neighborhood",
  ],
  "sundhed og omsorg": [
    "sundhed", "sygdom", "sygehus", "hospital", "omsorg", "pleje", "læge", "behandling", "medicin",
    "antibiotika", "pandemi", "smitte", "epidemi", "psykisk",
    "health", "illness", "disease", "care", "nursing", "doctor", "treatment", "medicine",
    "antibiotic", "pandemic", "infection", "mental",
  ],
  "arbejde og økonomi": [
    "arbejde", "arbejdsløs", "beskæftig", "løn", "økonomi", "ulighed", "fattig", "automatis", "robot",
    "karriere", "fagforening", "ejerskab", "monopol",
    "job", "work", "unemploy", "wage", "salary", "economy", "inequality", "poverty", "automation",
    "career", "union", "monopoly",
  ],
  "tillid og information": [
    "tillid", "mistillid", "demokrati", "misinformation", "desinformation", "deepfake", "falske nyheder",
    "medier", "nyhed", "overvågning", "privatliv", "sandhed", "manipulat", "identitet", "propaganda",
    "trust", "democracy", "disinformation", "fake news", "surveillance", "privacy", "truth",
    "media", "news", "identity",
  ],
  "systemer og forsyning": [
    "infrastruktur", "strøm", "elnet", "energi", "forsyning", "cyberangreb", "hacker", "hacking",
    "nedbrud", "datacenter", "kunstig intelligens", "teknologi", "chips", "mineral", "råstof",
    "forsyningskæde", "geopolitik", "krig",
    "ai\\b", "infrastructure", "power grid", "electricity", "energy", "supply", "cyber", "outage",
    "data cent", "artificial intelligence", "technology", "supply chain", "geopolitic", "war",
  ],
};

/**
 * The family the traveller's own words point at, if any.
 *
 * Highest cue count wins; a tie is left to `pick` so the opening stop is not
 * always the same family for the same phrasing.
 */
function familyFromCue(text: string, open: PressureFamily[], pick: Picker): PressureFamily | undefined {
  const haystack = text.toLowerCase();
  const scored = open
    .map((family) => ({
      family,
      score: familyCues[family].filter((cue) => new RegExp(`\\b${cue}`, "i").test(haystack)).length,
    }))
    .filter((entry) => entry.score > 0);
  if (scored.length === 0) return undefined;

  const best = Math.max(...scored.map((entry) => entry.score));
  const leaders = scored.filter((entry) => entry.score === best);
  return leaders[pick(leaders.length)].family;
}

/**
 * Assign this round's stage, pressure and user relation.
 *
 * The family is drawn from those the journey has not used yet, so five stops
 * cover five different corners of the future space. `pick` is injectable so the
 * planner can be tested without stubbing Math.random.
 *
 * `openingCue` is the traveller's own hope and fear from the check-in, and it is
 * honoured on the first stop only. It exists so the journey opens somewhere the
 * traveller already cares about — after that the rotation takes over and moves
 * them out of it. It never reaches the model: letting a stated fear shape the
 * dilemmas would tune the options toward the answer the traveller already gave,
 * and the closing report would then hand back what was typed at check-in rather
 * than what the five choices revealed.
 */
export function planRound(
  previous: CompletedDilemma[],
  pick: Picker = randomPick,
  openingCue?: string,
  _preferredProblemAreas?: ProblemArea[],
): RoundPlan {
  const round = previous.length;

  const usedFamilies = usedPressureFamilies(previous);
  const usedIds = new Set(previous.map((item) => item.futurePressureId).filter(Boolean));
  const usedAreas = new Set(previous.map((item) => item.problemArea));
  const fitsUnusedArea = (pressure: FuturePressure) => pressure.problemAreas.some(
    (area) => !usedAreas.has(area),
  );
  const openFamilies = pressureFamilies.filter(
    (family) => !usedFamilies.has(family) && futurePressures.some((pressure) => pressure.family === family && fitsUnusedArea(pressure)),
  );
  const families = openFamilies.length ? openFamilies : pressureFamilies;
  const cued = round === 0 && openingCue?.trim() ? familyFromCue(openingCue, families, pick) : undefined;
  const family = cued ?? families[pick(families.length)];

  const candidates = futurePressures.filter(
    (item) => item.family === family && !usedIds.has(item.id) && fitsUnusedArea(item),
  );
  const compatible = futurePressures.filter((item) => item.family === family && fitsUnusedArea(item));
  const pool = candidates.length
    ? candidates
    : compatible.length
      ? compatible
      : futurePressures.filter((item) => item.family === family);
  const pressure = pool[pick(pool.length)];
  const response = pressure.responses[pick(pressure.responses.length)];
  const unusedProblemAreas = pressure.problemAreas.filter((area) => !usedAreas.has(area));
  const problemAreas = unusedProblemAreas.length
    ? unusedProblemAreas
    : pressure.problemAreas;

  const previousCountries = new Set(previous.map((item) => item.country));
  const geographyPool = round === 0
    ? locations.filter((item) => item.country === "Danmark")
    : locations.filter((item) => item.country !== "Danmark" && !previousCountries.has(item.country));
  const location = geographyPool[pick(geographyPool.length)] ?? locations[0];

  return {
    round,
    pressure,
    response,
    responses: pressure.responses,
    severity: round === 0 ? "low" : "medium",
    problemAreas,
    location,
  };
}
