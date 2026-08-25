"use client";

import { useEffect, useRef } from "react";
import { useAmbienceStore } from "@/lib/ambienceStore";
import type { FieldRecording } from "@/lib/aporee";
import type { AppPhase, GeneratedDilemma } from "@/types/world2046";

const TARGET_VOLUME = 0.16;
const FADE_IN_MS = 2800;
const FADE_OUT_MS = 1200;
const CROSSFADE_MS = 2500;

/** Only the phases where the player is actually standing in the place. */
const AUDIBLE_PHASES: AppPhase[] = ["landing", "dilemma", "consequence"];

type Ramp = { from: number; to: number; startedAt: number; ms: number };
type Player = { stop: (fadeMs?: number) => void };

/**
 * Plays a field recording as a soft loop.
 *
 * Volume is ramped on the media elements themselves rather than through Web
 * Audio gain nodes: the aporee.org files serve no CORS headers, so routing them
 * through an AudioContext would yield silence. For the same reason crossOrigin
 * is deliberately left unset — a media element needs no CORS for playback.
 *
 * Looping crossfades between two elements so the seam is not a hard cut. Very
 * short or unmeasurable recordings fall back to native looping.
 */
function createAmbiencePlayer(src: string): Player {
  const ramps = new Map<HTMLAudioElement, Ramp>();
  let stopped = false;
  let frame = 0;
  let crossfading = false;
  let nativeLoop = false;
  let waitingForGesture = false;

  const build = () => {
    const element = new Audio();
    element.src = src;
    element.preload = "auto";
    element.volume = 0;
    return element;
  };

  let current = build();
  let standby = build();

  const gestures = ["pointerdown", "keydown", "touchstart"] as const;
  const removeGestureRetry = () => {
    gestures.forEach((gesture) => window.removeEventListener(gesture, retryPlayback));
    waitingForGesture = false;
  };

  const retryPlayback = () => {
    if (stopped) return;
    void current.play().then(
      () => {
        removeGestureRetry();
        rampTo(current, TARGET_VOLUME, FADE_IN_MS);
      },
      () => {
        // `once` removed the listener that just fired. Arm a fresh one rather
        // than treating the failed attempt as permanent.
        waitingForGesture = false;
        armGestureRetry();
      },
    );
  };

  const armGestureRetry = () => {
    if (waitingForGesture) return;
    waitingForGesture = true;
    gestures.forEach((gesture) => window.addEventListener(gesture, retryPlayback, { once: true, passive: true }));
  };

  const rampTo = (element: HTMLAudioElement, to: number, ms: number) => {
    ramps.set(element, { from: element.volume, to, startedAt: performance.now(), ms: Math.max(1, ms) });
  };

  const tick = () => {
    if (stopped) return;
    const now = performance.now();

    for (const [element, ramp] of ramps) {
      const progress = Math.min(1, (now - ramp.startedAt) / ramp.ms);
      element.volume = Math.max(0, Math.min(1, ramp.from + (ramp.to - ramp.from) * progress));
      if (progress >= 1) ramps.delete(element);
    }

    const duration = current.duration;
    const crossfadeSeconds = CROSSFADE_MS / 1000;
    if (!nativeLoop && Number.isFinite(duration)) {
      // Too short to crossfade meaningfully — let the element loop itself.
      if (duration < crossfadeSeconds * 2.5) {
        nativeLoop = true;
        current.loop = true;
      } else if (!crossfading && duration - current.currentTime <= crossfadeSeconds) {
        crossfading = true;
        const outgoing = current;
        const incoming = standby;
        try {
          incoming.currentTime = 0;
        } catch {
          /* seeking before metadata is ready is harmless here */
        }
        void incoming.play().catch(() => {});
        rampTo(outgoing, 0, CROSSFADE_MS);
        rampTo(incoming, TARGET_VOLUME, CROSSFADE_MS);
        current = incoming;
        standby = outgoing;
        window.setTimeout(() => {
          if (stopped) return;
          try {
            outgoing.pause();
          } catch {
            /* ignore */
          }
          crossfading = false;
        }, CROSSFADE_MS);
      }
    }

    frame = requestAnimationFrame(tick);
  };

  void current.play().then(
    () => {
      if (stopped) return;
      rampTo(current, TARGET_VOLUME, FADE_IN_MS);
    },
    () => {
      // The lookup finishes asynchronously, often after browser user activation
      // has expired. Retry on the next click/key instead of remaining silent for
      // the whole destination.
      armGestureRetry();
    },
  );
  frame = requestAnimationFrame(tick);

  const release = (element: HTMLAudioElement) => {
    try {
      element.pause();
      element.removeAttribute("src");
      element.load();
    } catch {
      /* ignore */
    }
  };

  return {
    stop: (fadeMs = FADE_OUT_MS) => {
      if (stopped) return;
      rampTo(current, 0, fadeMs);
      rampTo(standby, 0, fadeMs);
      window.setTimeout(() => {
        stopped = true;
        removeGestureRetry();
        cancelAnimationFrame(frame);
        ramps.clear();
        release(current);
        release(standby);
      }, fadeMs);
    },
  };
}

export function FieldRecordingAmbience({ activeDilemma, phase }: { activeDilemma?: GeneratedDilemma; phase: AppPhase }) {
  const playerRef = useRef<Player | null>(null);
  const playingForRef = useRef<string | undefined>(undefined);
  const resolvedRef = useRef<{ dilemmaId: string; recording: FieldRecording } | null>(null);
  const phaseRef = useRef(phase);
  const setRecording = useAmbienceStore((state) => state.setRecording);
  const dilemmaId = activeDilemma?.id;
  const lat = activeDilemma?.marker?.lat;
  const lng = activeDilemma?.marker?.lng;
  const placeName = activeDilemma?.exactPlace?.name ?? activeDilemma?.city ?? "";
  const city = activeDilemma?.city ?? "";
  const locationType = activeDilemma?.locationType ?? "";

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Fetch as soon as generation reveals the destination, while the year counter
  // is still finishing. Crucially this request depends on destination, not phase:
  // landing → dilemma must not cancel an in-flight field-recording lookup.
  useEffect(() => {
    if (!dilemmaId || typeof lat !== "number" || typeof lng !== "number") {
      playerRef.current?.stop();
      playerRef.current = null;
      playingForRef.current = undefined;
      resolvedRef.current = null;
      setRecording(null);
      return;
    }

    playerRef.current?.stop();
    playerRef.current = null;
    playingForRef.current = undefined;
    resolvedRef.current = null;
    setRecording(null);

    let cancelled = false;
    (async () => {
      try {
        const query = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          place: placeName,
          city,
          type: locationType,
        });
        const response = await fetch(`/api/ambience?${query}`);
        if (!response.ok) return;
        const data = (await response.json()) as { recording?: FieldRecording | null };
        const recording = data.recording;
        if (cancelled || !recording?.url) return;
        resolvedRef.current = { dilemmaId, recording };
        setRecording(recording);
        if (AUDIBLE_PHASES.includes(phaseRef.current) && playingForRef.current !== dilemmaId) {
          playerRef.current = createAmbiencePlayer(recording.url);
          playingForRef.current = dilemmaId;
        }
      } catch {
        /* ambience is optional — a failure here leaves the journey silent */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [city, dilemmaId, lat, lng, locationType, placeName, setRecording]);

  // Playback follows the physical-presence phases, but the resolved recording
  // and player survive transitions between them.
  useEffect(() => {
    const shouldPlay = Boolean(dilemmaId) && AUDIBLE_PHASES.includes(phase);
    if (!shouldPlay) {
      playerRef.current?.stop();
      playerRef.current = null;
      playingForRef.current = undefined;
      return;
    }
    const resolved = resolvedRef.current;
    if (!resolved || resolved.dilemmaId !== dilemmaId || playingForRef.current === dilemmaId) return;

    playerRef.current = createAmbiencePlayer(resolved.recording.url);
    playingForRef.current = dilemmaId;
  }, [dilemmaId, phase]);

  useEffect(() => {
    return () => {
      playerRef.current?.stop(400);
      playerRef.current = null;
      useAmbienceStore.getState().setRecording(null);
    };
  }, []);

  return null;
}
