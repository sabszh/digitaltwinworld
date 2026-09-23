import { afterEach, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "@/lib/session";
import type { GeneratedDilemma } from "@/types/world2046";

function dilemma(id: string): GeneratedDilemma {
  return {
    id,
    problemArea: "Digital tillid, rettigheder og styring",
    validLocationTypes: ["digital borgerservice"],
    targetGroups: ["borgere"],
    technologies: ["personlig data-agent"],
    severity: "low",
    title: `Dilemma ${id}`,
    scenePrompt: "En konkret scene i 2046.",
    question: "Hvad gør du?",
    choices: ["a", "b", "c", "d"].map((choiceId) => ({
      id: choiceId,
      label: `Valg ${choiceId}`,
      valueImpacts: {},
    })),
    tags: [],
    country: "Danmark",
    city: "Aarhus",
    region: "Norden",
    locationType: "digital borgerservice",
    technology: "personlig data-agent",
    role: "Borger",
    marker: { lat: 56.16, lng: 10.2 },
    futurePressureId: "digital-identity",
  };
}

function completeThreeDilemmas() {
  for (const id of ["first", "second", "third"]) {
    const activeDilemma = dilemma(id);
    useSessionStore.setState({ activeDilemma, phase: "dilemma" });
    useSessionStore.getState().answer(activeDilemma.choices[0]);
  }
}

const report = {
  headline: "Din fremtid",
  narrative: "En kort rapport.",
  quotes: [],
  patterns: ["Du vælger tydeligt"],
  reflectionNote: "Hvad vil du beskytte?",
  source: "openai" as const,
};

describe("destination generation", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    useSessionStore.getState().restart();
  });

  it("keeps traveling and retries invisibly until a destination succeeds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const dilemma = { id: "retry-success" };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "rejected_quality" }), { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ dilemma }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const generation = useSessionStore.getState().checkIn({
      role: "Borger",
      hope: "en god fremtid",
      fear: "at miste tillid",
    });

    expect(useSessionStore.getState().phase).toBe("traveling");
    await vi.advanceTimersByTimeAsync(7000);
    await generation;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(useSessionStore.getState().activeDilemma).toEqual(dilemma);
    expect(useSessionStore.getState().phase).toBe("traveling");
  });

  it("prefetches the next plan before the choice and reuses it afterward", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);

    const first = dilemma("first");
    const second = { ...dilemma("second"), country: "Sverige", city: "Stockholm" };
    const never = new Promise<Response>(() => undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ dilemma: first }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ dilemma: second }), { status: 200 }))
      .mockReturnValueOnce(never);
    vi.stubGlobal("fetch", fetchMock);

    const generation = useSessionStore.getState().checkIn({
      role: "Borger",
      hope: "fælles løsninger",
      fear: "at miste indflydelse",
    });
    await vi.advanceTimersByTimeAsync(UX_WAIT_MS);
    await generation;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const prefetchBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body)) as {
      previousDilemmas: Array<{ dilemmaId: string; selectedChoiceId: string }>;
    };
    expect(prefetchBody.previousDilemmas.at(-1)).toMatchObject({
      dilemmaId: "first",
      selectedChoiceId: "__prefetch__",
    });

    useSessionStore.getState().answer(first.choices[0]);
    useSessionStore.getState().continueJourney();
    await vi.advanceTimersByTimeAsync(UX_WAIT_MS);

    expect(useSessionStore.getState().activeDilemma?.id).toBe("second");
    // Call three is the prefetch for the following stop. If call two had not
    // been reused, the second dilemma would still be waiting on this promise.
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("restores a written answer when returning from its consequence", () => {
    const activeDilemma = dilemma("written-answer");
    useSessionStore.setState({ activeDilemma, phase: "dilemma" });

    useSessionStore.getState().answer(
      { id: "custom", label: "Egen løsning", valueImpacts: {} },
      "Jeg vil tale med oldefar først.",
      false,
    );
    useSessionStore.getState().backToDilemma();

    expect(useSessionStore.getState()).toMatchObject({
      phase: "dilemma",
      completedDilemmas: [],
      customAnswerDraft: {
        dilemmaId: "written-answer",
        text: "Jeg vil tale med oldefar først.",
        viaVoice: false,
      },
    });
  });

  it("asks for storage consent before generating or showing the report", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    completeThreeDilemmas();

    useSessionStore.getState().continueJourney();

    expect(useSessionStore.getState()).toMatchObject({
      phase: "consent",
      consentStatus: "idle",
      reportLoading: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves the completed report after consent, then returns to the landing page", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/report") return new Response(JSON.stringify({ report }), { status: 200 });
      if (url === "/api/sessions") return new Response(JSON.stringify({ saved: true }), { status: 200 });
      return new Response(null, { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    completeThreeDilemmas();
    useSessionStore.getState().continueJourney();

    const saving = useSessionStore.getState().saveConsentedSession();

    expect(useSessionStore.getState()).toMatchObject({
      phase: "report",
      consentStatus: "saving",
      reportLoading: true,
    });

    await saving;

    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual(["/api/report", "/api/sessions"]);
    expect(useSessionStore.getState()).toMatchObject({
      phase: "report",
      consentStatus: "saved",
      futureReport: report,
    });

    useSessionStore.getState().completeJourney();
    expect(useSessionStore.getState()).toMatchObject({
      phase: "intro",
      completedDilemmas: [],
      consentStatus: "idle",
    });
  });

  it("shows the report without saving when consent is declined", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ report }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    completeThreeDilemmas();
    useSessionStore.getState().continueJourney();

    useSessionStore.getState().declineConsent();

    expect(useSessionStore.getState()).toMatchObject({ phase: "report", consentStatus: "declined" });
    await vi.waitFor(() => expect(useSessionStore.getState().futureReport).toEqual(report));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/report");
  });

  it("does not reopen a finished journey when background saving completes late", async () => {
    let finishSaving: ((response: Response) => void) | undefined;
    const delayedSave = new Promise<Response>((resolve) => {
      finishSaving = resolve;
    });
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/report") return Promise.resolve(new Response(JSON.stringify({ report }), { status: 200 }));
      if (url === "/api/sessions") return delayedSave;
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal("fetch", fetchMock);
    completeThreeDilemmas();
    useSessionStore.getState().continueJourney();

    const saving = useSessionStore.getState().saveConsentedSession();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    useSessionStore.getState().completeJourney();
    finishSaving?.(new Response(JSON.stringify({ saved: true }), { status: 200 }));
    await saving;

    expect(useSessionStore.getState()).toMatchObject({ phase: "intro", consentStatus: "idle" });
  });
});

const UX_WAIT_MS = 7000;
