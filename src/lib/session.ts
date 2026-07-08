"use client";

import { create } from "zustand";
import { SESSION_DILEMMA_COUNT, emptyValueProfile } from "@/data/taxonomies";
import type {
  AppPhase,
  Choice,
  CompletedDilemma,
  FutureProfileReport,
  GeneratedDilemma,
  Persona,
  PersonaAnswers,
  SessionResult,
  UserRole,
  ValueProfile,
} from "@/types/world2046";
import { generateDilemma } from "./randomizer";
import { buildLocalPersona } from "./persona";
import { addProfiles, buildFallbackReport, generateSummary, normalizeImpacts } from "./profileScoring";

type SessionStore = {
  phase: AppPhase;
  role?: UserRole;
  persona?: Persona;
  activeDilemma?: GeneratedDilemma;
  lastChoice?: Choice;
  lastCustomAnswer?: string;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  futureReport?: FutureProfileReport;
  reportLoading: boolean;
  sessionId: string;
  createdAt: string;
  start: () => void;
  buildPersona: (answers: PersonaAnswers) => Promise<void>;
  generateNext: () => Promise<void>;
  enterDilemma: () => void;
  answer: (choice: Choice, customAnswer?: string, viaVoice?: boolean) => void;
  saveReflection: (text: string, viaVoice: boolean) => void;
  backToDilemma: () => void;
  continueJourney: () => void;
  finishJourney: () => Promise<void>;
  restart: () => void;
  getResult: () => SessionResult;
};

const createSessionId = () => `world2046-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useSessionStore = create<SessionStore>((set, get) => ({
  phase: "intro",
  completedDilemmas: [],
  valueProfile: emptyValueProfile,
  reportLoading: false,
  sessionId: createSessionId(),
  createdAt: new Date().toISOString(),
  start: () => set({ phase: "persona" }),
  buildPersona: async (answers) => {
    const fallback = () => buildLocalPersona(answers);
    let persona: Persona;
    try {
      const response = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (!response.ok) throw new Error("Failed to build persona");
      const data = (await response.json()) as { persona?: Persona };
      persona = data.persona ?? fallback();
    } catch {
      persona = fallback();
    }
    set({ persona, role: answers.role });
  },
  generateNext: async () => {
    const { role, persona, completedDilemmas, sessionId } = get();
    if (!role) return;
    if (completedDilemmas.length >= SESSION_DILEMMA_COUNT) {
      set({ phase: "report", activeDilemma: undefined });
      void get().finishJourney();
      return;
    }
    const preferredSeverity = completedDilemmas.length === 0 ? "low" : "medium";
    const fallbackDilemma = () => generateDilemma({ role, previousDilemmas: completedDilemmas, preferredSeverity });

    set({ activeDilemma: undefined, phase: "traveling" });

    let nextDilemma: GeneratedDilemma;
    try {
      const response = await fetch("/api/dilemma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, persona, previousDilemmas: completedDilemmas, preferredSeverity }),
      });
      if (!response.ok) throw new Error("Failed to generate dilemma");
      const data = (await response.json()) as { dilemma?: GeneratedDilemma };
      nextDilemma = data.dilemma ?? fallbackDilemma();
    } catch {
      nextDilemma = fallbackDilemma();
    }

    if (get().sessionId !== sessionId || get().phase !== "traveling") return;
    set({ activeDilemma: nextDilemma });
    window.setTimeout(() => {
      if (get().phase === "traveling") set({ phase: "landing" });
    }, 3200);
  },
  enterDilemma: () => {
    if (get().phase === "landing") set({ phase: "dilemma" });
  },
  answer: (choice, customAnswer, viaVoice) => {
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
      answeredByVoice: viaVoice,
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
  saveReflection: (text, viaVoice) => {
    const { completedDilemmas } = get();
    const trimmed = text.trim();
    if (!trimmed || completedDilemmas.length === 0) return;
    const next = [...completedDilemmas];
    const last = next[next.length - 1];
    next[next.length - 1] = { ...last, reflection: trimmed, reflectionViaVoice: viaVoice };
    set({ completedDilemmas: next });
  },
  backToDilemma: () => {
    const { completedDilemmas, valueProfile } = get();
    const previous = completedDilemmas.at(-1);
    if (!previous) {
      set({ phase: "dilemma", lastChoice: undefined, lastCustomAnswer: undefined });
      return;
    }
    const revertedImpacts = normalizeImpacts(
      Object.fromEntries(
        Object.entries(previous.valueImpacts).map(([key, value]) => [key, -value]),
      ) as Partial<ValueProfile>,
    );
    set({
      completedDilemmas: completedDilemmas.slice(0, -1),
      valueProfile: addProfiles(valueProfile, revertedImpacts),
      lastChoice: undefined,
      lastCustomAnswer: undefined,
      phase: "dilemma",
    });
  },
  continueJourney: () => {
    const { completedDilemmas } = get();
    if (completedDilemmas.length >= SESSION_DILEMMA_COUNT) {
      set({ phase: "report" });
      void get().finishJourney();
    } else {
      void get().generateNext();
    }
  },
  finishJourney: async () => {
    const { persona, completedDilemmas, valueProfile, sessionId } = get();
    set({ reportLoading: true });
    const fallback = () => buildFallbackReport(completedDilemmas, valueProfile);
    let report: FutureProfileReport;
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, completedDilemmas, valueProfile }),
      });
      if (!response.ok) throw new Error("Failed to build report");
      const data = (await response.json()) as { report?: FutureProfileReport };
      report = data.report ?? fallback();
    } catch {
      report = fallback();
    }
    if (get().sessionId !== sessionId) return;
    set({ futureReport: report, reportLoading: false });
  },
  restart: () =>
    set({
      phase: "intro",
      role: undefined,
      persona: undefined,
      activeDilemma: undefined,
      lastChoice: undefined,
      lastCustomAnswer: undefined,
      completedDilemmas: [],
      valueProfile: emptyValueProfile,
      futureReport: undefined,
      reportLoading: false,
      sessionId: createSessionId(),
      createdAt: new Date().toISOString(),
    }),
  getResult: () => {
    const { sessionId, createdAt, role, persona, completedDilemmas, valueProfile, futureReport } = get();
    return {
      sessionId,
      createdAt,
      year: 2046,
      role: role ?? "Borger",
      persona,
      completedDilemmas,
      valueProfile,
      generatedSummary: generateSummary(completedDilemmas, valueProfile),
      futureReport,
    };
  },
}));
