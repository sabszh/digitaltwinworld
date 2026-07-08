import { emptyValueProfile, valueLabels } from "@/data/taxonomies";
import type { CompletedDilemma, FutureProfileReport, ValueProfile } from "@/types/world2046";

export function normalizeImpacts(impacts: Partial<ValueProfile>): ValueProfile {
  return { ...emptyValueProfile, ...impacts };
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

export function inferAiAttitude(profile: ValueProfile) {
  if (profile.innovation + profile.efficiency > profile.safety + profile.localControl + 2) return "progressiv";
  if (profile.transparency + profile.trust + profile.localControl > profile.innovation + 1) return "pragmatisk";
  return "restriktiv";
}

export function generateSummary(completed: CompletedDilemma[], profile: ValueProfile) {
  const attitude = inferAiAttitude(profile);
  const values = getDominantValues(profile, 3).map(([key]) => key);
  const areas = [...new Set(completed.map((item) => item.problemArea))].slice(0, 3).join(", ").toLowerCase();
  const human = values.includes("humanContact") || values.includes("equality") ? "menneskecentreret" : "systemisk";
  const governance = profile.localControl + profile.transparency >= profile.efficiency ? "klare rammer og åbenhed" : "hurtig koordinering og effektiv drift";

  return `Din 2046-verden er ${human} og teknologisk ${attitude}. Du afviser ikke fremtidens AI-lag, men du ønsker ${governance}. Særligt i ${areas} prioriterer du løsninger, hvor teknologi skal kunne forklares, deles og justeres af mennesker tæt på hverdagen.`;
}

export function buildFallbackReport(completed: CompletedDilemma[], profile: ValueProfile): FutureProfileReport {
  const narrative = generateSummary(completed, profile);
  const dominant = getDominantValues(profile, 3).map(([key]) => valueLabels[key]);
  const quotes = completed
    .flatMap((item) => {
      const entries: { quote: string; context: string }[] = [];
      if (item.customAnswer) entries.push({ quote: item.customAnswer, context: `${item.city}, ${item.problemArea}` });
      if (item.reflection) entries.push({ quote: item.reflection, context: `${item.city}, ${item.problemArea}` });
      return entries;
    })
    .slice(0, 3);

  return {
    headline: "Din verden i 2046",
    narrative,
    quotes,
    patterns: dominant,
    reflectionNote: "",
    source: "fallback",
  };
}
