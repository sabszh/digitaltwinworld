import { emptyValueProfile } from "@/data/taxonomies";
import type { Choice, CompletedDilemma, ValueProfile } from "@/types/world2046";
import type { Language } from "@/lib/i18n";

export function normalizeImpacts(impacts: Partial<ValueProfile>): ValueProfile {
  return { ...emptyValueProfile, ...impacts };
}

/** A written alternative is only scored when it can be matched to one of the
 * four already-authored actions. This preserves the same scoring instrument
 * without forcing every dilemma onto an invented axis. */
export function impactsForMatchedChoice(choiceId: string | "unscored", choices?: Choice[]): Partial<ValueProfile> {
  if (choiceId === "unscored" || !choices) return {};
  return choices.find((choice) => choice.id === choiceId)?.valueImpacts ?? {};
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
  const stopCount = completed.length;
  const values = getDominantValues(profile, 3).map(([key]) => key);
  const areas = [...new Set(completed.map((item) => item.problemArea))].slice(0, 3).join(", ").toLowerCase();
  const human = values.includes("humanContact") || values.includes("equality") ? "menneskecentreret" : "systemisk";
  const governance = profile.localControl + profile.transparency >= profile.efficiency ? "klare rammer og åbenhed" : "hurtig koordinering og effektiv drift";

  if (language === "en") {
    return `Across ${stopCount} places, you prioritised ${values.join(", ")}. Your approach was ${attitude}, with responsibility kept close to the people affected in ${areas || "everyday life"}.`;
  }
  return `På tværs af ${stopCount} steder prioriterede du ${human} ansvar og ${governance}. Din tilgang til teknologi var ${attitude}.`;
}
