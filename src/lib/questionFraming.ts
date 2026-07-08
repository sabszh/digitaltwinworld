import type { GeneratedDilemma, Persona } from "@/types/world2046";

const HOW_PREFIX = /^hvordan\b/i;

export function frameQuestion(dilemma: GeneratedDilemma, persona?: Persona): { lead?: string; question: string } {
  if (HOW_PREFIX.test(dilemma.question.trim())) {
    return { question: dilemma.question };
  }

  const actor = persona?.title
    ? persona.title.charAt(0).toLowerCase() + persona.title.slice(1)
    : dilemma.role === "For alle"
      ? "vi"
      : `jeg som ${dilemma.role.toLowerCase()}`;
  return {
    lead: dilemma.question,
    question: `Hvordan vil ${actor} handle i den fremtid, der tager form her?`,
  };
}
