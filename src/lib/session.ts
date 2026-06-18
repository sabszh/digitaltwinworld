"use client";

import { create } from "zustand";
import { SESSION_DILEMMA_COUNT, emptyValueProfile } from "@/data/taxonomies";
import type { AppPhase, Choice, CompletedDilemma, GeneratedDilemma, SessionResult, UserRole, ValueProfile } from "@/types/world2046";
import { generateDilemma } from "./randomizer";
import { addProfiles, generateSummary, normalizeImpacts } from "./profileScoring";

type SessionStore = {
  phase: AppPhase;
  role?: UserRole;
  activeDilemma?: GeneratedDilemma;
  lastChoice?: Choice;
  lastCustomAnswer?: string;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  sessionId: string;
  createdAt: string;
  start: () => void;
  chooseRole: (role: UserRole) => void;
  generateNext: () => void;
  answer: (choice: Choice, customAnswer?: string) => void;
  continueJourney: () => void;
  restart: () => void;
  getResult: () => SessionResult;
};

const createSessionId = () => `world2046-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useSessionStore = create<SessionStore>((set, get) => ({
  phase: "intro",
  completedDilemmas: [],
  valueProfile: emptyValueProfile,
  sessionId: createSessionId(),
  createdAt: new Date().toISOString(),
  start: () => set({ phase: "role-selection" }),
  chooseRole: (role) => {
    set({ role });
    get().generateNext();
  },
  generateNext: () => {
    const { role, completedDilemmas } = get();
    if (!role) return;
    if (completedDilemmas.length >= SESSION_DILEMMA_COUNT) {
      set({ phase: "report", activeDilemma: undefined });
      return;
    }
    set({
      activeDilemma: generateDilemma({ role, previousDilemmas: completedDilemmas, preferredSeverity: completedDilemmas.length === 0 ? "low" : "medium" }),
      phase: "traveling",
    });
    window.setTimeout(() => {
      if (get().phase === "traveling") set({ phase: "dilemma" });
    }, 4300);
  },
  answer: (choice, customAnswer) => {
    const { activeDilemma, completedDilemmas, valueProfile } = get();
    if (!activeDilemma) return;
    const impacts = normalizeImpacts(choice.valueImpacts);
    const completed: CompletedDilemma = {
      dilemmaId: activeDilemma.id,
      problemArea: activeDilemma.problemArea,
      region: activeDilemma.region,
      country: activeDilemma.country,
      city: activeDilemma.city,
      exactPlaceName: activeDilemma.exactPlace?.name,
      locationType: activeDilemma.locationType,
      technology: activeDilemma.technology,
      question: activeDilemma.question,
      selectedChoiceId: choice.id,
      selectedChoiceLabel: customAnswer ? "Egen løsning" : choice.label,
      customAnswer,
      valueImpacts: impacts,
    };
    set({
      completedDilemmas: [...completedDilemmas, completed],
      valueProfile: addProfiles(valueProfile, impacts),
      lastChoice: choice,
      lastCustomAnswer: customAnswer,
      phase: "consequence",
    });
  },
  continueJourney: () => {
    const { completedDilemmas } = get();
    if (completedDilemmas.length >= SESSION_DILEMMA_COUNT) set({ phase: "report" });
    else get().generateNext();
  },
  restart: () =>
    set({
      phase: "intro",
      role: undefined,
      activeDilemma: undefined,
      lastChoice: undefined,
      lastCustomAnswer: undefined,
      completedDilemmas: [],
      valueProfile: emptyValueProfile,
      sessionId: createSessionId(),
      createdAt: new Date().toISOString(),
    }),
  getResult: () => {
    const { sessionId, createdAt, role, completedDilemmas, valueProfile } = get();
    return {
      sessionId,
      createdAt,
      year: 2046,
      role: role ?? "Borger",
      completedDilemmas,
      valueProfile,
      generatedSummary: generateSummary(completedDilemmas, valueProfile),
    };
  },
}));
