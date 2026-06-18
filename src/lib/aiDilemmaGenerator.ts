import type { CompletedDilemma, GeneratedDilemma, ProblemArea, UserRole } from "@/types/world2046";
import { generateDilemma } from "./randomizer";

export type GenerateDilemmaInput = {
  role: UserRole;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
  allowedProblemAreas?: ProblemArea[];
  targetAgeBand?: "teen" | "adult" | "mixed";
};

export type GenerateDilemmaOutput = GeneratedDilemma;

export const aiDilemmaGuardrails = [
  "Dilemmaet skal være egnet til målgruppen.",
  "Dilemmaet må ikke være voldeligt, traumatiserende eller katastrofisk.",
  "Dilemmaet skal være realistisk muligt i 2046.",
  "Dilemmaet skal høre til ét af de 7 faste problemområder.",
  "Det skal indeholde 3-4 balancerede svarmuligheder.",
  "Det skal måle værdier indirekte og må ikke presse mod ét rigtigt svar.",
];

export async function generateDilemmaWithAI(input: GenerateDilemmaInput): Promise<GenerateDilemmaOutput> {
  // TODO: Integrer OpenAI API her, når prototypen får backend/API-route.
  // Guardrails ovenfor skal sendes med prompten, og output skal valideres mod GenerateDilemmaOutput.
  // Før en AI-genereret version accepteres, skal problemområde, severity, lokationstype og svarantal valideres.
  return generateDilemma(input);
}
