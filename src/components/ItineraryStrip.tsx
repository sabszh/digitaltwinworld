"use client";

import { MapPin, Plane } from "lucide-react";
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
    <div className="itinerary-strip departure-strip fixed left-4 top-4 z-30 text-xs md:left-8 md:top-8">
      <div className="departure-strip-label">
        <Plane className="h-3.5 w-3.5" aria-hidden="true" />
        {language === "da" ? "Afgange" : "Departures"}
      </div>
      {Array.from({ length: SESSION_DILEMMA_COUNT }, (_, index) => {
        const isDone = index < completed;
        const isCurrent = index === completed;
        const city = cities[index];
        return (
          <div
            key={index}
            className={`itinerary-stop ${isCurrent ? "itinerary-stop--current" : ""} ${!isDone && !isCurrent ? "itinerary-stop--upcoming" : ""}`}
          >
            <span className="ticket-label !mb-0.5">
              Gate {String(index + 1).padStart(2, "0")}
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
