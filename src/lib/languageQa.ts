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

function normalize(text: string) {
  return text.toLocaleLowerCase("da-DK");
}

function collectChoiceText(choice: Choice) {
  return [choice.label, choice.description, choice.consequence].filter(Boolean).join(" ");
}

export function collectVisibleDilemmaText(dilemma: GeneratedDilemma) {
  return [
    dilemma.title,
    dilemma.scenePrompt,
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
  if (audience.id !== "school") return [];

  const normalized = normalize(text);
  return schoolBlockedTerms.filter((term) => normalized.includes(normalize(term)));
}

export function hasAudienceLanguageIssues(dilemma: GeneratedDilemma) {
  return findAudienceLanguageIssues(dilemma.role, collectVisibleDilemmaText(dilemma)).length > 0;
}
