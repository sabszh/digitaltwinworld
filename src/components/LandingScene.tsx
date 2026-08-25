"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAmbienceStore } from "@/lib/ambienceStore";
import { recordingYear } from "@/lib/aporee";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import { UX_TIMING } from "@/lib/uxTiming";
import { useFitHeadline } from "@/lib/useFitHeadline";
import type { GeneratedDilemma } from "@/types/world2046";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";

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
  const recording = useAmbienceStore((state) => state.recording);
  const place = dilemma.exactPlace?.name ?? dilemma.city;
  const titleRef = useFitHeadline<HTMLHeadingElement>(place);
  const scene = dilemma.landingScene ?? (language === "da" ? `Du lander i ${place}, 2046.` : `You arrive at ${place}, 2046.`);

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
        className="w-full max-w-lg"
      >
        <JourneyCard className="arrival-card">
        <h2 ref={titleRef}>{place}</h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="arrival-card-scene"
        >
          {scene}
        </motion.p>

        {recording && (
          <motion.p
            className="arrival-card-credit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.2 }}
          >
            <span className="arrival-card-credit-label">{text.landingHearing}</span>
            <span className="arrival-card-credit-title">{recording.title}</span>
            {/* Attribution is not decoration: several recordings are CC-BY or CC-BY-SA. */}
            {[recording.artist, recordingYear(recording.recordedAt)].filter(Boolean).length > 0 && (
              <span className="arrival-card-credit-meta">
                {[recording.artist, recordingYear(recording.recordedAt)].filter(Boolean).join(", ")}
              </span>
            )}
          </motion.p>
        )}

        <motion.div className="arrival-card-action" initial={{ opacity: 0, y: 8 }} animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 8 }} transition={{ duration: 0.4 }}>
          <JourneyButton
            onClick={() => {
              worldSound.playButtonTap();
              onEnter();
            }}
            style={{ pointerEvents: showButton ? "auto" : "none" }}
            variant="primary"
            direction="forward"
            className="arrival-card-cta"
            aria-label={text.landingEnter}
          />
        </motion.div>
        </JourneyCard>
      </motion.div>
    </section>
  );
}
