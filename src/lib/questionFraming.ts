import type { GeneratedDilemma, Persona } from "@/types/world2046";

export function frameQuestion(dilemma: GeneratedDilemma, persona?: Persona): { lead?: string; question: string } {
  void persona;
  return {
    question: dilemma.question,
  };
}
