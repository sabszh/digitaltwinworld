"use client";

import { useEffect, useRef } from "react";
import { inferSoundscapeTags, worldSound } from "@/lib/sound";
import { FieldRecordingAmbience } from "@/components/FieldRecordingAmbience";
import type { AppPhase, GeneratedDilemma } from "@/types/world2046";

export function SoundEffects({ activeDilemma, phase }: { activeDilemma?: GeneratedDilemma; phase: AppPhase }) {
  const lastDilemmaIdRef = useRef<string | undefined>(undefined);
  const lastRevealIdRef = useRef<string | undefined>(undefined);
  const lastLandingIdRef = useRef<string | undefined>(undefined);
  const lastConsequenceIdRef = useRef<string | undefined>(undefined);

  // The landing page has no field recording behind it, so the drone is the only
  // thing holding the room. Browsers refuse to start an AudioContext before a
  // gesture, hence the one-shot listeners: the drone is armed on mount and
  // becomes audible the moment the visitor moves, scrolls or types.
  useEffect(() => {
    if (phase !== "intro") {
      worldSound.stopAmbientDrone();
      return;
    }

    let welcomed = false;
    let introActive = true;
    const arm = () => {
      void worldSound.unlock().then(() => {
        if (!welcomed) {
          welcomed = true;
          worldSound.playIntroWelcome();
        }
        // A visitor's first gesture is often the click on "Start rejsen".
        // That click immediately changes phase and runs this effect's cleanup.
        // The welcome sound must still be allowed to play after the AudioContext
        // resumes; only the idle drone belongs exclusively to the intro phase.
        if (introActive) worldSound.startAmbientDrone();
      }).catch(() => {
        // Audio can be unavailable (for example in a browser with sound
        // disabled). The journey must remain usable in that case.
      });
    };
    const gestures = ["pointerdown", "keydown", "touchstart"] as const;

    arm();
    gestures.forEach((gesture) => window.addEventListener(gesture, arm, { once: true, passive: true }));

    return () => {
      introActive = false;
      gestures.forEach((gesture) => window.removeEventListener(gesture, arm));
      worldSound.stopAmbientDrone();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "traveling" && !activeDilemma) {
      worldSound.startScanLoop();
      return;
    }

    worldSound.stopScanLoop();
  }, [activeDilemma, phase]);

  // The score runs for the whole crossing, not just the fetch: the counter keeps
  // climbing after the destination arrives, and cutting the music there left the
  // last seconds — the loudest part of the animation — in silence.
  useEffect(() => {
    if (phase !== "traveling") {
      worldSound.stopTimeTravelScore();
      return;
    }

    worldSound.playTimeMachineCharge();
    worldSound.startTimeTravelScore();
    return () => worldSound.stopTimeTravelScore();
  }, [phase]);

  useEffect(() => {
    if (phase !== "consequence" || !activeDilemma || lastConsequenceIdRef.current === activeDilemma.id) return;

    lastConsequenceIdRef.current = activeDilemma.id;
    worldSound.playConsequenceReveal();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if (phase !== "traveling" || !activeDilemma || lastDilemmaIdRef.current === activeDilemma.id) return;

    lastDilemmaIdRef.current = activeDilemma.id;
    worldSound.playFlyToEarth();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if (phase !== "landing" || !activeDilemma || lastLandingIdRef.current === activeDilemma.id) return;

    lastLandingIdRef.current = activeDilemma.id;
    worldSound.playLandingArrival();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if (phase !== "dilemma" || !activeDilemma || lastRevealIdRef.current === activeDilemma.id) return;

    lastRevealIdRef.current = activeDilemma.id;
    worldSound.playDilemmaReveal();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if ((phase === "landing" || phase === "dilemma" || phase === "consequence") && activeDilemma) {
      worldSound.startSoundscape(inferSoundscapeTags(activeDilemma));
      return;
    }

    worldSound.stopSoundscape();
  }, [activeDilemma, phase]);

  return <FieldRecordingAmbience activeDilemma={activeDilemma} phase={phase} />;
}
