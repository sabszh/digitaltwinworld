import type { GeneratedDilemma } from "@/types/world2046";

export function frameQuestion(dilemma: GeneratedDilemma): { lead?: string; question: string } {
  return {
    question: dilemma.question,
  };
}
