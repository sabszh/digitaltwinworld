import { getAudienceProfile } from "@/lib/audience";
import type { UserRole } from "@/types/world2046";

const sharedRules = [
  "Skriv på dansk og brug ikke engelske labels i synlig tekst.",
  "Skriv med konkrete personer, steder og handlinger før abstrakte begreber.",
  "Hold sætninger korte nok til at kunne læses på en skærm i bevægelse.",
  "Lad alle fire valg være reelle kompromiser, ikke rigtige/forkerte svar.",
] as const;

const schoolRules = [
  "Målgruppen er 10-13 år: brug ord et barn i 4.-6. klasse kan forstå.",
  "Brug eksempler fra klasse, frikvarter, venner, familie, lærere, tablets, spil, skolevej og hverdag.",
  "Undgå myndighedssprog og fagord. Skriv hellere 'computerregel' end 'algoritme'.",
  "Undgå tunge ord som kvalitetssikret, ledsager, infrastruktur, triage, resiliens og implementering.",
  "Undgå engelske termer som mental health companion, companion og digital twin.",
  "Forklar risikoen nænsomt. Ingen skræmmende eller klinisk sprog.",
] as const;

const professionalRules = [
  "Målgruppen arbejder med offentlig digitalisering, drift, velfærd, sundhed eller beslutninger.",
  "Gør ansvar, medarbejderpres, borgerrettigheder og implementering konkrete.",
  "Fagord må bruges, men kun når de hjælper dilemmaet og stadig står i klart dansk.",
] as const;

const publicRules = [
  "Målgruppen er bred: børn, unge og voksne skal kunne forstå situationen hurtigt.",
  "Brug sanselige hverdagsdetaljer og lidt fascination, men uden at blive teknisk tung.",
  "Gør teknologien nærværende gennem det, man ser, vælger eller mærker.",
] as const;

const schoolRewriteExamples = [
  ["mental health companion", "computer man kan tale med"],
  ["AI-triage", "smart kø-hjælp"],
  ["digital tvilling", "digital kopi"],
  ["kvalitetssikrede ledsagere", "hjælpere, som voksne har tjekket"],
  ["datadeling", "dele oplysninger"],
  ["dynamisk infrastruktur", "veje og signaler, der ændrer sig automatisk"],
] as const;

export function buildAudiencePromptSection(role: UserRole) {
  const audience = getAudienceProfile(role);
  const audienceRules =
    audience.id === "school" ? schoolRules : audience.id === "professional" ? professionalRules : publicRules;

  const rewriteExamples =
    audience.id === "school"
      ? `\nOmskriv især sådan her:\n${schoolRewriteExamples.map(([bad, good]) => `- Ikke "${bad}" → skriv "${good}"`).join("\n")}`
      : "";

  return `Målgruppeprofil:
- Dag: ${audience.day}
- Publikum: ${audience.label}
- Skrivestil og fokus: ${audience.promptContext}
- Prioritér især disse problemområder når det passer: ${audience.preferredProblemAreas.join(", ")}
- Prioritér især disse lokationstyper når det passer: ${audience.preferredLocationTypes.join(", ")}

Sprogregler:
${[...sharedRules, ...audienceRules].map((rule) => `- ${rule}`).join("\n")}${rewriteExamples}`;
}
