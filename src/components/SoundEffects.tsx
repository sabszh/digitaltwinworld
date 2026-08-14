"use client";

import { useEffect, useRef } from "react";
import { inferSoundscapeTags, worldSound } from "@/lib/sound";
import { RadioAmbience } from "@/components/RadioAmbience";
import type { AppPhase, GeneratedDilemma } from "@/types/world2046";

export function SoundEffects({ activeDilemma, phase }: { activeDilemma?: GeneratedDilemma; phase: AppPhase }) {
  const lastDilemmaIdRef = useRef<string | undefined>(undefined);
  const lastRevealIdRef = useRef<string | undefined>(undefined);
  const lastLandingIdRef = useRef<string | undefined>(undefined);
  const lastConsequenceIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (phase === "traveling" && !activeDilemma) {
      worldSound.startScanLoop();
      return;
    }

    worldSound.stopScanLoop();
  }, [activeDilemma, phase]);

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

  return <RadioAmbience activeDilemma={activeDilemma} phase={phase} />;
}
