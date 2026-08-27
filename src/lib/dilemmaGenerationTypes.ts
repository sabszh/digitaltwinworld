import type { CompletedDilemma, GeneratedDilemma, LocationType, PersonaAnswers, UserRole } from "@/types/world2046";
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

/** Only the parts of a dilemma that require creative judgement. Everything
 * else is supplied by the round plan or derived after authoring. */
export type CreativeDilemma = {
  title: string;
  landingScene: string;
  scenePrompt: string;
  stake: string;
  question: string;
  coreTension: {
    want: string;
    butAlsoWant: string;
    whyCannotHaveBoth: string;
  };
  choices: Array<{
    id: "a" | "b" | "c" | "d";
    label: string;
    description: string;
    consequence: string;
  }>;
  locationType: LocationType;
  placeHint?: string;
};
