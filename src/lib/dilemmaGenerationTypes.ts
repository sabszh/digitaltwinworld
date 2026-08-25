import type { CompletedDilemma, GeneratedDilemma, PersonaAnswers, UserRole } from "@/types/world2046";
import type { Language } from "@/lib/i18n";
import type { RoundPlan } from "@/lib/roundPlan";

export type DilemmaGenerationRequest = {
  role: UserRole;
  answers?: PersonaAnswers;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
  language: Language;
  /** Created once on the server and shared by prompt, validator and retry. */
  generationPlan?: RoundPlan;
};

export type AiDilemma = Omit<GeneratedDilemma, "role">;
