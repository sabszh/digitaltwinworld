"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarClock, MapPin } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import { UX_TIMING } from "@/lib/uxTiming";
import type { GeneratedDilemma } from "@/types/world2046";

export function LandingScene({
  dilemma,
  language,
  onEnter,
}: {
  dilemma: GeneratedDilemma;
  language: Language;
  onEnter: () => void;
}) {
  const text = uiText[language];
  const [showButton, setShowButton] = useState(false);
  const place = dilemma.exactPlace?.name ?? dilemma.city;
  const scene = dilemma.landingScene ?? `Du lander i ${place}, 2046.`;

  useEffect(() => {
    const buttonTimer = window.setTimeout(() => setShowButton(true), UX_TIMING.arrivalCtaDelayMs);
    return () => {
      window.clearTimeout(buttonTimer);
    };
  }, [dilemma.id]);

  return (
    <section className="relative z-20 flex min-h-screen items-end justify-center px-4 py-8 md:items-center md:justify-end md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="arrival-card w-full max-w-lg"
      >
        <div className="arrival-card-meta arrival-card-meta--top">
          <span><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> {text.landingYear}</span>
          <span><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {dilemma.problemArea}</span>
        </div>
        <h2>{place}</h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="arrival-card-scene"
        >
          {scene}
        </motion.p>

        <motion.div className="arrival-card-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 8 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => {
              worldSound.playButtonTap();
              onEnter();
            }}
            style={{ pointerEvents: showButton ? "auto" : "none" }}
            className="arrival-card-cta"
          >
            {text.landingEnter} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
