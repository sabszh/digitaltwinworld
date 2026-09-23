"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n";

const JOURNEY_DURATION_SECONDS = 5 * 60;

export function formatJourneyTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function JourneyTimer({ language }: { language: Language }) {
  const [remainingSeconds, setRemainingSeconds] = useState(JOURNEY_DURATION_SECONDS);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();

    const updateRemainingTime = () => {
      if (startedAtRef.current === null) return;
      const elapsedSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setRemainingSeconds(Math.max(0, JOURNEY_DURATION_SECONDS - elapsedSeconds));
    };

    updateRemainingTime();
    const interval = window.setInterval(updateRemainingTime, 250);
    return () => window.clearInterval(interval);
  }, []);

  const formattedTime = formatJourneyTime(remainingSeconds);
  const label = language === "da" ? "Forventet rejsetid" : "Estimated journey time";

  return (
    <aside className="fixed bottom-4 left-4 z-30 overflow-hidden rounded-xl border border-white/60 bg-white/80 shadow-[0_12px_36px_rgba(6,27,52,0.18)] backdrop-blur-md md:bottom-8 md:left-8">
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <Clock3 className="h-4 w-4 text-[#1c5d9c]" aria-hidden="true" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#536277]">{label}</p>
          <time
            className="mt-0.5 block font-mono text-lg font-semibold leading-none tabular-nums text-[#082b58]"
            dateTime={`PT${remainingSeconds}S`}
            aria-label={`${label}: ${formattedTime}`}
          >
            {formattedTime}
          </time>
        </div>
      </div>
      <div className="h-0.5 bg-[#dce8f0]" aria-hidden="true">
        <div
          className="h-full origin-left bg-[#1c5d9c] transition-[width] duration-300 ease-linear"
          style={{ width: `${(remainingSeconds / JOURNEY_DURATION_SECONDS) * 100}%` }}
        />
      </div>
    </aside>
  );
}
