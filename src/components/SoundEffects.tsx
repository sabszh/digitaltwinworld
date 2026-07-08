"use client";

import { useEffect, useRef } from "react";
import { inferSoundscapeTags, worldSound } from "@/lib/sound";
import type { AppPhase, GeneratedDilemma } from "@/types/world2046";

export function SoundEffects({ activeDilemma, phase }: { activeDilemma?: GeneratedDilemma; phase: AppPhase }) {
  const lastDilemmaIdRef = useRef<string | undefined>(undefined);
  const lastRevealIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (phase === "traveling" && !activeDilemma) {
      worldSound.startScanLoop();
      return;
    }

    worldSound.stopScanLoop();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if (phase !== "traveling" || !activeDilemma || lastDilemmaIdRef.current === activeDilemma.id) return;

    lastDilemmaIdRef.current = activeDilemma.id;
    worldSound.playFlyToEarth();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if (phase !== "dilemma" || !activeDilemma || lastRevealIdRef.current === activeDilemma.id) return;

    lastRevealIdRef.current = activeDilemma.id;
    worldSound.playDilemmaReveal();
  }, [activeDilemma, phase]);

  useEffect(() => {
    if ((phase === "dilemma" || phase === "consequence") && activeDilemma) {
      worldSound.startSoundscape(inferSoundscapeTags(activeDilemma));
      return;
    }

    worldSound.stopSoundscape();
  }, [activeDilemma, phase]);

  return null;
}
