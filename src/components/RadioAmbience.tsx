"use client";

import { useEffect, useRef, useState } from "react";
import { worldSound } from "@/lib/sound";
import type { AppPhase, GeneratedDilemma } from "@/types/world2046";

type RadioStation = {
  id: string;
  name: string;
  streamUrl: string;
};

const RADIO_PHASES: AppPhase[] = ["landing", "dilemma", "consequence"];

export function RadioAmbience({ activeDilemma, phase }: { activeDilemma?: GeneratedDilemma; phase: AppPhase }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phaseRef = useRef<AppPhase>(phase);
  const activeDilemmaIdRef = useRef<string | undefined>(undefined);
  const stationRef = useRef<RadioStation | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const [stationReady, setStationReady] = useState(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "none";
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const resume = () => {
      if (RADIO_PHASES.includes(phaseRef.current) && stationRef.current && audio.paused) {
        void audio.play().catch(() => undefined);
      }
    };
    window.addEventListener("pointerdown", resume, { passive: true });
    window.addEventListener("keydown", resume, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeDilemma || activeDilemmaIdRef.current === activeDilemma.id) return;

    activeDilemmaIdRef.current = activeDilemma.id;
    stationRef.current = null;
    setStationReady(false);
    audio.pause();
    audio.removeAttribute("src");

    const controller = new AbortController();
    const loadStation = async () => {
      try {
        const query = new URLSearchParams({
          lat: String(activeDilemma.marker.lat),
          lng: String(activeDilemma.marker.lng),
        });
        const response = await fetch(`/api/radio?${query.toString()}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = (await response.json()) as { station?: RadioStation | null };
        if (!data.station || controller.signal.aborted || activeDilemmaIdRef.current !== activeDilemma.id) return;

        stationRef.current = data.station;
        setStationReady(true);
        worldSound.playRadioTune();
        audio.src = data.station.streamUrl;
        audio.load();
        // A tiny tuning cue makes the radio feel discovered, not injected.
        // The stream itself remains deliberately very quiet.
        if (RADIO_PHASES.includes(phaseRef.current)) {
          await audio.play().catch(() => undefined);
        }
      } catch {
        // Ambient radio is optional; the authored soundscape remains available.
      }
    };

    void loadStation();
    return () => controller.abort();
  }, [activeDilemma, phase]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeFrameRef.current !== null) window.cancelAnimationFrame(fadeFrameRef.current);
    const target = RADIO_PHASES.includes(phase) && stationReady && stationRef.current ? 0.075 : 0;
    const startedVolume = audio.volume;
    const startedAt = performance.now();
    const duration = target > startedVolume ? 1500 : 750;

    const fade = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = progress * progress * (3 - 2 * progress);
      audio.volume = startedVolume + (target - startedVolume) * eased;
      if (progress < 1) {
        fadeFrameRef.current = window.requestAnimationFrame(fade);
      } else {
        fadeFrameRef.current = null;
        if (target === 0) audio.pause();
      }
    };
    if (target > 0 && audio.paused) {
      void audio.play().catch(() => undefined);
    }
    fadeFrameRef.current = window.requestAnimationFrame(fade);

    return () => {
      if (fadeFrameRef.current !== null) window.cancelAnimationFrame(fadeFrameRef.current);
    };
  }, [phase, activeDilemma, stationReady]);

  return null;
}
