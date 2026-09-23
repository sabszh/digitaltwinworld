import type { CompletedDilemma, GeneratedDilemma, LocationType, PersonaAnswers, UserRole } from "@/types/world2046";
import type { Language } from "@/lib/i18n";
import type { DilemmaSeed } from "@/lib/roundPlan";

export type DilemmaGenerationRequest = {
  role: UserRole;
  answers?: PersonaAnswers;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
  language: Language;
  /** Created once on the server and shared by prompt and enrichment. */
  generationPlan?: DilemmaSeed;
};

export type AiDilemma = Omit<GeneratedDilemma, "role">;

/** Only the parts of a dilemma that require creative judgement. Everything
 * else is supplied by the round plan or derived after authoring. */
export type CreativeDilemma = {
  futureNormal: string;
  humanCost: string;
  decision: string;
  title: string;
  scene: string;
  stake: string;
  question: string;
  choices: Array<{
    id: "a" | "b" | "c" | "d";
    label: string;
    consequence: string;
  }>;
  locationType?: LocationType | null;
  placeHint?: string | null;
};
