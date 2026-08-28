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
import { addProfiles, generateSummary, normalizeImpacts } from "./profileScoring";
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
  customAnswerDraft?: { dilemmaId: string; text: string; viaVoice: boolean };
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  futureReport?: FutureProfileReport;
  reportLoading: boolean;
  reportError?: string;
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
let dilemmaGenerationRun = 0;
let activeDilemmaController: AbortController | undefined;
let prefetchedDilemmaController: AbortController | undefined;

type DilemmaPrefetch = {
  sessionId: string;
  language: Language;
  currentDilemmaId: string;
  completedCount: number;
  promise: Promise<GeneratedDilemma | undefined>;
};

let dilemmaPrefetch: DilemmaPrefetch | undefined;

function projectedCompletion(dilemma: GeneratedDilemma): CompletedDilemma {
  return {
    dilemmaId: dilemma.id,
    problemArea: dilemma.problemArea,
    region: dilemma.region,
    country: dilemma.country,
    city: dilemma.city,
    exactPlaceName: dilemma.exactPlace?.name,
    locationType: dilemma.locationType,
    technology: dilemma.technology,
    question: dilemma.question,
    presented: {
      title: dilemma.title,
      scene: dilemma.scenePrompt,
      stake: dilemma.stake,
      landingScene: dilemma.landingScene,
      landingDetail: dilemma.landingDetail,
      choices: dilemma.choices.map(({ id, label, description }) => ({ id, label, description })),
    },
    coreTension: dilemma.coreTension,
    futurePressureId: dilemma.futurePressureId,
    selectedChoiceId: "__prefetch__",
    selectedChoiceLabel: "__prefetch__",
    valueImpacts: { ...emptyValueProfile },
  };
}

function startNextDilemmaPrefetch(input: {
  role: UserRole;
  personaAnswers?: PersonaAnswers;
  completedDilemmas: CompletedDilemma[];
  activeDilemma: GeneratedDilemma;
  sessionId: string;
  language: Language;
}) {
  if (input.completedDilemmas.length + 1 >= SESSION_DILEMMA_COUNT) return;
  // Production dilemmas always have these fields. The guard keeps incomplete
  // fixtures and legacy stored data from starting an invalid background call.
  if (!input.activeDilemma.problemArea || !input.activeDilemma.country || !input.activeDilemma.futurePressureId) return;

  prefetchedDilemmaController?.abort();
  const controller = new AbortController();
  prefetchedDilemmaController = controller;
  const previousDilemmas = [...input.completedDilemmas, projectedCompletion(input.activeDilemma)];
  const promise = (async () => {
    const timeout = window.setTimeout(() => controller.abort(), UX_TIMING.dilemmaFetchTimeoutMs);
    try {
      const response = await fetch("/api/dilemma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: input.role,
          answers: input.personaAnswers,
          previousDilemmas,
          preferredSeverity: "medium",
          language: input.language,
        }),
        signal: controller.signal,
      });
      if (!response.ok) return undefined;
      const data = (await response.json()) as { dilemma?: GeneratedDilemma };
      return data.dilemma;
    } catch {
      return undefined;
    } finally {
      window.clearTimeout(timeout);
      if (prefetchedDilemmaController === controller) prefetchedDilemmaController = undefined;
    }
  })();

  dilemmaPrefetch = {
    sessionId: input.sessionId,
    language: input.language,
    currentDilemmaId: input.activeDilemma.id,
    completedCount: input.completedDilemmas.length,
    promise,
  };
}

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
  setLanguage: (language) => {
    prefetchedDilemmaController?.abort();
    prefetchedDilemmaController = undefined;
    dilemmaPrefetch = undefined;
    set({ language });
  },
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
    const travelStartedAt = Date.now();
    const runId = ++dilemmaGenerationRun;
    activeDilemmaController?.abort();

    const lastCompleted = completedDilemmas.at(-1);
    const matchingPrefetch = dilemmaPrefetch &&
      dilemmaPrefetch.sessionId === sessionId &&
      dilemmaPrefetch.language === language &&
      dilemmaPrefetch.completedCount + 1 === completedDilemmas.length &&
      dilemmaPrefetch.currentDilemmaId === lastCompleted?.dilemmaId
      ? dilemmaPrefetch
      : undefined;
    if (dilemmaPrefetch && !matchingPrefetch) prefetchedDilemmaController?.abort();
    dilemmaPrefetch = undefined;

    set({ activeDilemma: undefined, customAnswerDraft: undefined, phase: "traveling" });

    let nextDilemma = await matchingPrefetch?.promise;
    let attempt = 0;
    const isCurrentRun = () =>
      dilemmaGenerationRun === runId &&
      get().sessionId === sessionId &&
      get().phase === "traveling";

    while (!nextDilemma && isCurrentRun()) {
      const controller = new AbortController();
      activeDilemmaController = controller;
      const timeout = window.setTimeout(() => controller.abort(), UX_TIMING.dilemmaFetchTimeoutMs);
      let retryDelay = 0;

      try {
        const response = await fetch("/api/dilemma", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, answers: personaAnswers, previousDilemmas: completedDilemmas, preferredSeverity, language }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? "Failed to generate dilemma");
        const data = (await response.json()) as { dilemma?: GeneratedDilemma };
        if (!data.dilemma) throw new Error("Missing generated dilemma");
        nextDilemma = data.dilemma;
      } catch (error) {
        if (!isCurrentRun()) return;
        attempt += 1;
        const message = error instanceof Error ? error.message : "Failed to generate dilemma";
        retryDelay = Math.min(
          UX_TIMING.dilemmaRetryMaxMs,
          UX_TIMING.dilemmaRetryBaseMs * 2 ** Math.min(attempt - 1, 3),
        );
        console.warn(`[journey] destination attempt ${attempt} failed; retrying in background`, message);
      } finally {
        window.clearTimeout(timeout);
        if (activeDilemmaController === controller) activeDilemmaController = undefined;
      }

      if (retryDelay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, retryDelay));
      }
    }

    if (!nextDilemma || !isCurrentRun()) return;

    const elapsed = Date.now() - travelStartedAt;
    if (elapsed < UX_TIMING.minimumTravelLoadingMs) {
      await new Promise((resolve) => window.setTimeout(resolve, UX_TIMING.minimumTravelLoadingMs - elapsed));
    }

    if (!isCurrentRun()) return;
    set({ activeDilemma: nextDilemma });
    startNextDilemmaPrefetch({
      role,
      personaAnswers,
      completedDilemmas,
      activeDilemma: nextDilemma,
      sessionId,
      language,
    });
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
      presented: {
        title: activeDilemma.title,
        scene: activeDilemma.scenePrompt,
        stake: activeDilemma.stake,
        landingScene: activeDilemma.landingScene,
        landingDetail: activeDilemma.landingDetail,
        place: activeDilemma.exactPlace
          ? {
              name: activeDilemma.exactPlace.name,
              latitude: activeDilemma.marker.lat,
              longitude: activeDilemma.marker.lng,
            }
          : undefined,
        // Do not include hidden value impacts in the participant-facing record.
        // The row preserves exactly what was available to choose from instead.
        choices: activeDilemma.choices.map(({ id, label, description }) => ({ id, label, description })),
      },
      coreTension: activeDilemma.coreTension,
      scoringChoices: customAnswer ? activeDilemma.choices : undefined,
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
      customAnswerDraft: undefined,
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
      customAnswerDraft: previous.customAnswer
        ? {
            dilemmaId: previous.dilemmaId,
            text: previous.customAnswer,
            viaVoice: previous.answeredByVoice ?? false,
          }
        : undefined,
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
    set({ reportLoading: true, reportError: undefined });
    let report: FutureProfileReport | undefined;
    let scoredProfile = valueProfile;
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: personaAnswers, completedDilemmas, valueProfile, language }),
      });
      if (!response.ok) throw new Error((await response.json() as { error?: string }).error ?? "Failed to build report");
      const data = (await response.json()) as { report?: FutureProfileReport; valueProfile?: ValueProfile };
      if (!data.report) throw new Error("Missing generated report");
      report = data.report;
      // The written answers are scored server-side and folded in there, so the
      // returned profile supersedes the one accumulated during the journey.
      // Nothing renders the profile before this point.
      if (data.valueProfile) scoredProfile = data.valueProfile;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to build report";
      if (get().sessionId === sessionId) set({ reportError: message, reportLoading: false });
      return;
    }
    if (get().sessionId !== sessionId) return;
    set({ futureReport: report, reportError: undefined, reportLoading: false, valueProfile: scoredProfile });
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
  restart: () => {
    dilemmaGenerationRun += 1;
    activeDilemmaController?.abort();
    activeDilemmaController = undefined;
    prefetchedDilemmaController?.abort();
    prefetchedDilemmaController = undefined;
    dilemmaPrefetch = undefined;
    set({
      phase: "intro",
      language: get().language,
      role: undefined,
      personaAnswers: undefined,
      activeDilemma: undefined,
      lastChoice: undefined,
      lastCustomAnswer: undefined,
      customAnswerDraft: undefined,
      completedDilemmas: [],
      valueProfile: emptyValueProfile,
      futureReport: undefined,
      reportLoading: false,
      reportError: undefined,
      consentStatus: "idle",
      sessionId: createSessionId(),
      createdAt: new Date().toISOString(),
    });
  },
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
