"use client";

import { useEffect, useRef } from "react";
import { worldSound } from "@/lib/sound";
import type { AppPhase, GeneratedDilemma } from "@/types/world2046";

type RadioStation = { id: string; name: string; streamUrl: string; codec: string; bitrate: number };
const RADIO_PHASES: AppPhase[] = ["landing", "dilemma", "consequence"];

export function RadioAmbience({ activeDilemma, phase }: { activeDilemma?: GeneratedDilemma; phase: AppPhase }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phaseRef = useRef(phase);
  const stationReadyRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.075;
    audioRef.current = audio;
    const resume = () => {
      if (stationReadyRef.current && RADIO_PHASES.includes(phaseRef.current)) void audio.play().catch(() => undefined);
    };
    window.addEventListener("pointerdown", resume, { passive: true });
    window.addEventListener("keydown", resume);
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
    if (!audio || !activeDilemma) return;
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    stationReadyRef.current = false;
    audio.pause();
    audio.removeAttribute("src");

    const tryStation = (station: RadioStation) => new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (playable: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("error", onError);
        resolve(playable);
      };
      const onCanPlay = () => finish(true);
      const onError = () => finish(false);
      const timeout = window.setTimeout(() => finish(false), 4500);
      audio.addEventListener("canplay", onCanPlay, { once: true });
      audio.addEventListener("error", onError, { once: true });
      audio.src = station.streamUrl;
      audio.load();
    });

    const load = async () => {
      try {
        const query = new URLSearchParams({ lat: String(activeDilemma.marker.lat), lng: String(activeDilemma.marker.lng) });
        const response = await fetch(`/api/radio?${query}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json() as { stations?: RadioStation[] };
        for (const station of data.stations ?? []) {
          if (controller.signal.aborted || requestIdRef.current !== requestId) return;
          if (await tryStation(station)) {
            stationReadyRef.current = true;
            worldSound.playRadioTune();
            if (RADIO_PHASES.includes(phaseRef.current)) await audio.play().catch(() => undefined);
            return;
          }
        }
        if (process.env.NODE_ENV === "development") console.info("World 2046 radio: procedural ambience fallback active");
      } catch (error) {
        if (process.env.NODE_ENV === "development" && !controller.signal.aborted) console.info("World 2046 radio: provider unavailable", error);
      }
    };
    void load();
    return () => controller.abort();
  }, [activeDilemma]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (RADIO_PHASES.includes(phase) && stationReadyRef.current) void audio.play().catch(() => undefined);
    else audio.pause();
  }, [phase]);

  return null;
}
