import { getAudienceProfile } from "@/lib/audience";
import type { Choice, GeneratedDilemma, UserRole } from "@/types/world2046";

const schoolBlockedTerms = [
  "mental health companion",
  "companion",
  "triage",
  "digital tvilling",
  "digital twin",
  "algoritme",
  "infrastruktur",
  "resiliens",
  "datadeling",
  "implementering",
  "optimering",
  "kvalitetssikret",
  "kvalitetssikrede",
  "ledsager",
  "ledsagere",
  "dynamisk infrastruktur",
  "granular styring",
  "eskalere",
  "realtid",
  "dataspor",
  "databrug",
  "AI",
  "computerhjælp'en",
  "computerhjælp-hjælp",
] as const;

// A seven-year-old should not have to decode the machinery behind a service
// before they can feel the choice. These words are not forbidden Danish; they
// are a signal that the generator has made the system, rather than the child,
// the protagonist of the scene.
const childBlockedTerms = [
  "reservedel",
  "adgangsordning",
  "boligpas",
  "budget",
  "diagnose",
  "fordeling",
  "forsikring",
  "godkendt test",
  "infektionstest",
  "institution",
  "legitimation",
  "prioritering",
  "ressource",
  "rettighed",
  "samtykke",
  "sygdomsbehandling",
  "vandbudget",
  "vandpoint",
  "spidsbelastning",
  "kvartersniveau",
  "driftsspørgsmål",
  "driftsplan",
  "modelkørsel",
  "forsyningskæde",
  "ressourcefordeling",
  "allokere",
  "kapacitet",
  "konstant beregning",
  "data-agent",
  "id-tegnebog",
  "wallet",
  "ungebyråd",
] as const;

function normalize(text: string) {
  return text.toLocaleLowerCase("da-DK");
}

/**
 * Blocked terms are matched on word boundaries, not as bare substrings.
 *
 * A plain `includes("ai")` fired on every place name containing those two
 * letters — Taiwan, Thailand, Nairobi, Dubai, Ukraine — and silently threw the
 * whole dilemma away. That hit exactly the non-European destinations the journey
 * is supposed to visit.
 *
 * Short terms need a boundary at both ends ("ai" must not match "aids"); longer
 * ones only at the start, so "algoritme" still catches "algoritmer".
 */
const termPattern = new Map<string, RegExp>();

function matchesTerm(normalizedText: string, term: string) {
  let pattern = termPattern.get(term);
  if (!pattern) {
    const escaped = normalize(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pattern = new RegExp(term.length <= 3 ? `\\b${escaped}\\b` : `\\b${escaped}`, "u");
    termPattern.set(term, pattern);
  }
  return pattern.test(normalizedText);
}

function collectChoiceText(choice: Choice) {
  return [choice.label, choice.description, choice.consequence].filter(Boolean).join(" ");
}

export function collectVisibleDilemmaText(dilemma: GeneratedDilemma) {
  return [
    dilemma.title,
    dilemma.scenePrompt,
    dilemma.stake,
    dilemma.question,
    dilemma.landingScene,
    dilemma.landingDetail,
    ...dilemma.choices.map(collectChoiceText),
  ]
    .filter(Boolean)
    .join(" ");
}

export function findAudienceLanguageIssues(role: UserRole, text: string) {
  const audience = getAudienceProfile(role);
  if (audience.id !== "child" && audience.id !== "youth") return [];

  const normalized = normalize(text);
  const terms = audience.id === "child"
    ? [...schoolBlockedTerms, ...childBlockedTerms]
    : schoolBlockedTerms;
  return terms.filter((term) => matchesTerm(normalized, term));
}

export function hasAudienceLanguageIssues(dilemma: GeneratedDilemma) {
  return findAudienceLanguageIssues(dilemma.role, collectVisibleDilemmaText(dilemma)).length > 0;
}
