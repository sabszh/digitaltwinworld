"use client";

import { ArrowRight, CalendarDays, MapPin, Plane, PlaneTakeoff, Users } from "lucide-react";
import { useState } from "react";
import type { Language } from "@/lib/i18n";
import { UX_TIMING } from "@/lib/uxTiming";

export function IntroScreen({
  onStart,
  language,
}: {
  onStart: () => void;
  language: Language;
}) {
  const [isAutoLaunching, setIsAutoLaunching] = useState(false);

  const launchFromSearch = () => {
    if (isAutoLaunching) return;
    setIsAutoLaunching(true);
    window.setTimeout(onStart, UX_TIMING.searchToBoardingMs);
  };

  // .intro-scope keeps the intro-only styling applied while this screen plays its
  // exit animation, after main[data-phase] has already advanced to the next phase.
  return (
    <div className="intro-scope relative z-20 h-screen overflow-hidden">
      <section className="intro-hero relative flex h-screen flex-col items-center justify-center px-6">
        <h1 className="horizon-title">
          <span>World</span>
          <em>2046</em>
        </h1>
        <div className="hero-flight-panel" aria-label={language === "da" ? "Rejseoversigt" : "Journey overview"}>
          <div className="hero-flight-fields">
            <div className="hero-flight-field">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Hvorfra" : "From"}</span>
              <strong>Dokk1, Aarhus</strong>
            </div>
            <div className="hero-flight-field">
              <Plane className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Hvorhen" : "To"}</span>
              <strong>World 2046</strong>
            </div>
            <div className="hero-flight-field">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Hvornår" : "When"}</span>
              <strong>{language === "da" ? "Nu → fremtid" : "Now → future"}</strong>
            </div>
            <div className="hero-flight-field">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Personer" : "People"}</span>
              <strong>1</strong>
            </div>
            <button
              type="button"
              className={`hero-flight-search ${isAutoLaunching ? "hero-flight-search--launching" : ""}`}
              onClick={launchFromSearch}
              disabled={isAutoLaunching}
              aria-label={language === "da" ? "Start rejsen" : "Start the journey"}
            >
              <PlaneTakeoff className="hero-flight-search-icon h-5 w-5" aria-hidden="true" />
              <span>{language === "da" ? "Start rejsen" : "Start journey"}</span>
              <ArrowRight className="hero-flight-search-arrow h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
