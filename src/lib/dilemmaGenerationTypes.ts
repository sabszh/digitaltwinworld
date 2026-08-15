import type { CompletedDilemma, GeneratedDilemma, Persona, UserRole } from "@/types/world2046";
import type { Language } from "@/lib/i18n";

export type DilemmaGenerationRequest = {
  role: UserRole;
  persona?: Persona;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
  language: Language;
};

export type AiDilemma = Omit<GeneratedDilemma, "role">;
