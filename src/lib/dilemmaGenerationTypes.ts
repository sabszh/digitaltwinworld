import type { CompletedDilemma, GeneratedDilemma, Persona, UserRole } from "@/types/world2046";

export type DilemmaGenerationRequest = {
  role: UserRole;
  persona?: Persona;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
};

export type AiDilemma = Omit<GeneratedDilemma, "role">;
