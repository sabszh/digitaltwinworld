"use client";

import { Check, MapPin, Plane } from "lucide-react";
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
    <nav
      className="itinerary-strip departure-strip fixed left-4 top-4 z-30 text-xs md:left-8 md:top-8"
      aria-label={language === "da" ? "Rejsens fem stop" : "The five stops of the journey"}
    >
      <div className="departure-strip-label">
        <Plane className="h-3.5 w-3.5" aria-hidden="true" />
        {language === "da" ? "Afgange" : "Departures"}
      </div>
      {Array.from({ length: SESSION_DILEMMA_COUNT }, (_, index) => {
        const isDone = index < completed;
        const isCurrent = index === completed;
        const city = cities[index];
        const state = isDone ? "is-done" : isCurrent ? "is-current" : "is-upcoming";

        return (
          <div key={index} className={`itinerary-stop ${state}`} aria-current={isCurrent ? "step" : undefined}>
            {isDone && <Check className="itinerary-stop-icon" aria-hidden="true" />}
            {isCurrent && <MapPin className="itinerary-stop-icon" aria-hidden="true" />}
            {/* A destination you have not reached yet is genuinely unknown — a split-flap
                board shows blanks there. "TBD" was developer shorthand leaking to players. */}
            <span className="itinerary-stop-name">
              {city ?? <span className="itinerary-stop-blank" aria-label={language === "da" ? "Ukendt stop" : "Unknown stop"}>–––</span>}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
