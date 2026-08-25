"use client";

import { create } from "zustand";
import { SESSION_DILEMMA_COUNT, emptyValueProfile } from "@/data/taxonomies";
import type {
  AppPhase,
  Choice,
  CompletedDilemma,
  FutureProfileReport,
  GeneratedDilemma,
  PersonaAnswers,
  SessionResult,
  UserRole,
  ValueProfile,
} from "@/types/world2046";
import { generateDilemma } from "./randomizer";
import { addProfiles, buildFallbackReport, generateSummary, normalizeImpacts } from "./profileScoring";
import { UX_TIMING } from "./uxTiming";
import type { Language } from "./i18n";

type SessionStore = {
  phase: AppPhase;
  language: Language;
  role?: UserRole;
  personaAnswers?: PersonaAnswers;
  activeDilemma?: GeneratedDilemma;
  lastChoice?: Choice;
  lastCustomAnswer?: string;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  futureReport?: FutureProfileReport;
  reportLoading: boolean;
  consentStatus: "idle" | "saving" | "saved" | "error" | "declined";
  sessionId: string;
  createdAt: string;
  start: () => void;
  setLanguage: (language: Language) => void;
  checkIn: (answers: PersonaAnswers) => Promise<void>;
  generateNext: () => Promise<void>;
  enterLanding: () => void;
  enterDilemma: () => void;
  answer: (choice: Choice, customAnswer?: string, viaVoice?: boolean) => void;
  saveReflection: (text: string, viaVoice: boolean) => void;
  backToDilemma: () => void;
  continueJourney: () => void;
  finishJourney: () => Promise<void>;
  reviewConsent: () => void;
  saveConsentedSession: () => Promise<void>;
  declineConsent: () => void;
  restart: () => void;
  getResult: () => SessionResult;
};

const createSessionId = () => `world2046-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useSessionStore = create<SessionStore>((set, get) => ({
  phase: "intro",
  language: "da",
  completedDilemmas: [],
  valueProfile: emptyValueProfile,
  reportLoading: false,
  consentStatus: "idle",
  sessionId: createSessionId(),
  createdAt: new Date().toISOString(),
  start: () => set({ phase: "persona" }),
  setLanguage: (language) => set({ language }),
  // The traveller's own answers go straight to the generator. There is no
  // character in between: nothing summarises them, so nothing can get them wrong.
  checkIn: async (answers) => {
    set({ personaAnswers: answers, role: answers.role });
    await get().generateNext();
  },
  generateNext: async () => {
    const { role, personaAnswers, completedDilemmas, sessionId, language } = get();
    if (!role) return;
    if (completedDilemmas.length >= SESSION_DILEMMA_COUNT) {
      set({ phase: "report", activeDilemma: undefined });
      void get().finishJourney();
      return;
    }
    const preferredSeverity = completedDilemmas.length === 0 ? "low" : "medium";
    const fallbackDilemma = () => generateDilemma({ role, previousDilemmas: completedDilemmas, preferredSeverity, language });
    const travelStartedAt = Date.now();

    set({ activeDilemma: undefined, phase: "traveling" });

    let nextDilemma: GeneratedDilemma;
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), UX_TIMING.dilemmaFetchTimeoutMs);
      const response = await fetch("/api/dilemma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, answers: personaAnswers, previousDilemmas: completedDilemmas, preferredSeverity, language }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timeout));
      if (!response.ok) throw new Error("Failed to generate dilemma");
      const data = (await response.json()) as { dilemma?: GeneratedDilemma };
      nextDilemma = data.dilemma ?? fallbackDilemma();
    } catch {
      nextDilemma = fallbackDilemma();
    }

    const elapsed = Date.now() - travelStartedAt;
    if (elapsed < UX_TIMING.minimumTravelLoadingMs) {
      await new Promise((resolve) => window.setTimeout(resolve, UX_TIMING.minimumTravelLoadingMs - elapsed));
    }

    if (get().sessionId !== sessionId || get().phase !== "traveling") return;
    set({ activeDilemma: nextDilemma });
  },
  enterLanding: () => {
    if (get().phase === "traveling" && get().activeDilemma) set({ phase: "landing" });
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
      coreTension: activeDilemma.coreTension,
      futurePressureId: activeDilemma.futurePressureId,
      selectedChoiceId: choice.id,
      selectedChoiceLabel: customAnswer ? (get().language === "da" ? "Egen løsning" : "Own response") : choice.label,
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
    const { personaAnswers, completedDilemmas, valueProfile, sessionId, language } = get();
    set({ reportLoading: true });
    const fallback = () => buildFallbackReport(completedDilemmas, valueProfile, language);
    let report: FutureProfileReport;
    let scoredProfile = valueProfile;
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: personaAnswers, completedDilemmas, valueProfile, language }),
      });
      if (!response.ok) throw new Error("Failed to build report");
      const data = (await response.json()) as { report?: FutureProfileReport; valueProfile?: ValueProfile };
      report = data.report ?? fallback();
      // The written answers are scored server-side and folded in there, so the
      // returned profile supersedes the one accumulated during the journey.
      // Nothing renders the profile before this point.
      if (data.valueProfile) scoredProfile = data.valueProfile;
    } catch {
      report = fallback();
    }
    if (get().sessionId !== sessionId) return;
    set({ futureReport: report, reportLoading: false, valueProfile: scoredProfile });
  },
  reviewConsent: () => set({ phase: "consent", consentStatus: "idle" }),
  saveConsentedSession: async () => {
    if (get().consentStatus === "saving" || get().consentStatus === "saved") return;
    set({ consentStatus: "saving" });
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: get().getResult() }),
      });
      if (!response.ok) throw new Error("Failed to save session");
      set({ consentStatus: "saved", phase: "goodbye" });
    } catch {
      set({ consentStatus: "error" });
    }
  },
  declineConsent: () => set({ consentStatus: "declined", phase: "goodbye" }),
  restart: () =>
    set({
      phase: "intro",
      language: get().language,
      role: undefined,
      personaAnswers: undefined,
      activeDilemma: undefined,
      lastChoice: undefined,
      lastCustomAnswer: undefined,
      completedDilemmas: [],
      valueProfile: emptyValueProfile,
      futureReport: undefined,
      reportLoading: false,
      consentStatus: "idle",
      sessionId: createSessionId(),
      createdAt: new Date().toISOString(),
    }),
  getResult: () => {
    const { sessionId, createdAt, role, personaAnswers, completedDilemmas, valueProfile, futureReport, language } = get();
    return {
      sessionId,
      createdAt,
      year: 2046,
      role: role ?? "Borger",
      personaAnswers,
      completedDilemmas,
      valueProfile,
      generatedSummary: generateSummary(completedDilemmas, valueProfile, language),
      futureReport,
      language,
    };
  },
}));
