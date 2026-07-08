"use client";

import { MapPin } from "lucide-react";
import { SESSION_DILEMMA_COUNT } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";

export function ItineraryStrip({
  completed,
  cities,
  language,
}: {
  completed: number;
  cities: (string | undefined)[];
  language: Language;
}) {
  return (
    <div className="itinerary-strip surface-panel fixed left-4 top-4 z-30 overflow-hidden rounded-full px-1 py-1 text-xs md:left-8 md:top-8">
      {Array.from({ length: SESSION_DILEMMA_COUNT }, (_, index) => {
        const isDone = index < completed;
        const isCurrent = index === completed;
        const city = cities[index];
        return (
          <div
            key={index}
            className={`itinerary-stop rounded-full px-3 py-1.5 ${isCurrent ? "itinerary-stop--current" : ""} ${!isDone && !isCurrent ? "itinerary-stop--upcoming" : ""}`}
          >
            <span className="ticket-label !mb-0.5">
              {language === "da" ? "Stop" : "Stop"} {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-1 font-semibold text-[var(--text)]">
              {isCurrent && <MapPin className="h-3 w-3 text-[var(--accent)]" aria-hidden="true" />}
              {city ?? "TBD"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
