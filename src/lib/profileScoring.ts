import { emptyValueProfile, valueLabels } from "@/data/taxonomies";
import type { CompletedDilemma, CoreTension, FutureProfileReport, ValueProfile } from "@/types/world2046";
import type { Language } from "@/lib/i18n";

export function normalizeImpacts(impacts: Partial<ValueProfile>): ValueProfile {
  return { ...emptyValueProfile, ...impacts };
}

/**
 * Where a written-in answer sits on the dilemma's own decision axis, or nowhere.
 *
 * "off-axis" is for answers that reject the premise rather than take a position
 * inside it — "neither, this system shouldn't exist". Forcing those to 1 or 4
 * would invent an opinion, which is the whole problem this scoring exists to fix.
 */
export type AxisPlacement = { dilemmaId: string; position: 1 | 2 | 3 | 4 | "off-axis" };

/**
 * Turn an axis placement into value impacts.
 *
 * The generator is made to lay every dilemma's four options along one axis with
 * valueA falling and valueB rising across positions 1-4 (see dilemmaPrompt), and
 * `coreTension` is carried on the completed dilemma. So a written answer is
 * measured with the same instrument as the four options rather than a second one
 * invented here. The ramp stays inside the -2..2 the generated impacts use.
 *
 * Off-axis, an unknown position, or a dilemma with no recorded tension all score
 * nothing. Contributing zero is honest; the alternative is the fabricated stamp
 * this replaced.
 */
export function impactsForPlacement(
  placement: AxisPlacement["position"],
  tension?: CoreTension,
): Partial<ValueProfile> {
  if (!tension || placement === "off-axis") return {};
  const ramp: Record<number, [number, number]> = { 1: [2, -1], 2: [1, 0], 3: [0, 1], 4: [-1, 2] };
  const step = ramp[placement];
  if (!step) return {};
  const [a, b] = step;
  // A dilemma whose two poles collapsed to one value would otherwise have the
  // second write clobber the first instead of summing.
  if (tension.valueA === tension.valueB) return { [tension.valueA]: a + b };
  return { [tension.valueA]: a, [tension.valueB]: b };
}

export function addProfiles(a: ValueProfile, b: Partial<ValueProfile>): ValueProfile {
  const next = { ...a };
  (Object.keys(next) as Array<keyof ValueProfile>).forEach((key) => {
    next[key] += b[key] ?? 0;
  });
  return next;
}

export function getDominantValues(profile: ValueProfile, count = 3) {
  return (Object.entries(profile) as Array<[keyof ValueProfile, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
}

export function inferAiAttitude(profile: ValueProfile, language: Language = "da") {
  if (profile.innovation + profile.efficiency > profile.safety + profile.localControl + 2) return language === "da" ? "åben for afprøvning" : "open to experimentation";
  if (profile.transparency + profile.trust + profile.localControl > profile.innovation + 1) return language === "da" ? "pragmatisk og undersøgende" : "pragmatic and questioning";
  return language === "da" ? "forsigtig og beskyttende" : "cautious and protective";
}

export function generateSummary(completed: CompletedDilemma[], profile: ValueProfile, language: Language = "da") {
  const attitude = inferAiAttitude(profile, language);
  const values = getDominantValues(profile, 3).map(([key]) => key);
  const areas = [...new Set(completed.map((item) => item.problemArea))].slice(0, 3).join(", ").toLowerCase();
  const human = values.includes("humanContact") || values.includes("equality") ? "menneskecentreret" : "systemisk";
  const governance = profile.localControl + profile.transparency >= profile.efficiency ? "klare rammer og åbenhed" : "hurtig koordinering og effektiv drift";

  if (language === "en") {
    return `Across five places, you kept returning to ${values.join(", ")}. Your choices were ${attitude}: willing to use new tools when the people living with the consequences can question and adjust them. In ${areas || "everyday life"}, you placed responsibility close to the people affected.`;
  }
  return `På fem forskellige steder vendte du tilbage til ${human} ansvar og ${governance}. Din tilgang til teknologi var ${attitude}: ikke et ja eller nej, men et krav om, at mennesker tæt på hverdagen kan forstå og ændre det, der påvirker dem.`;
}

export function buildFallbackReport(completed: CompletedDilemma[], profile: ValueProfile, language: Language = "da"): FutureProfileReport {
  const narrative = generateSummary(completed, profile, language);
  const englishLabels: Record<keyof ValueProfile, string> = { trust: "Trust", freedom: "Freedom", equality: "Equality", efficiency: "Efficiency", humanContact: "Human contact", safety: "Safety", innovation: "Innovation", sustainability: "Sustainability", localControl: "Local control", transparency: "Transparency" };
  const dominant = getDominantValues(profile, 3).map(([key]) => language === "da" ? valueLabels[key] : englishLabels[key]);
  const quotes = completed
    .flatMap((item) => {
      const entries: { quote: string; context: string }[] = [];
      if (item.customAnswer) entries.push({ quote: item.customAnswer, context: `${item.city}, ${item.problemArea}` });
      if (item.reflection) entries.push({ quote: item.reflection, context: `${item.city}, ${item.problemArea}` });
      return entries;
    })
    .slice(0, 3);

  return {
    headline: language === "da" ? "Det, du holdt fast i" : "What you held on to",
    narrative,
    quotes,
    patterns: dominant,
    reflectionNote: "",
    source: "fallback",
  };
}
