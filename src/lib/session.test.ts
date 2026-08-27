import { afterEach, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "@/lib/session";

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
});
