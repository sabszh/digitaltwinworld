"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, MapPin, UserRound } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import type { GeneratedDilemma, Persona } from "@/types/world2046";

const AUTO_ADVANCE_MS = 8000;
const BUTTON_DELAY_MS = 4000;

export function LandingScene({
  dilemma,
  persona,
  language,
  onEnter,
}: {
  dilemma: GeneratedDilemma;
  persona?: Persona;
  language: Language;
  onEnter: () => void;
}) {
  const text = uiText[language];
  const [showButton, setShowButton] = useState(false);
  const place = dilemma.exactPlace?.name ?? dilemma.city;
  const scene = dilemma.landingScene ?? `Du lander i ${place}, 2046.`;

  useEffect(() => {
    const buttonTimer = window.setTimeout(() => setShowButton(true), BUTTON_DELAY_MS);
    const advanceTimer = window.setTimeout(() => onEnter(), AUTO_ADVANCE_MS);
    return () => {
      window.clearTimeout(buttonTimer);
      window.clearTimeout(advanceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dilemma.id]);

  return (
    <section className="relative z-20 flex min-h-screen items-end justify-center px-4 py-8 md:items-center md:justify-end md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="surface-panel w-full max-w-lg rounded-3xl p-6 md:p-7"
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/15 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
            <CalendarClock className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            {text.landingYear}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/15 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            {place}
          </span>
          {persona && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/15 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
              <UserRound className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
              {persona.title}
            </span>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 text-[19px] font-normal leading-7 text-[var(--text)] md:text-[21px]"
        >
          {scene}
        </motion.p>

        {dilemma.landingDetail && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-3 text-sm italic text-[var(--faint)]"
          >
            {dilemma.landingDetail}
          </motion.p>
        )}

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 8 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => {
              worldSound.playButtonTap();
              onEnter();
            }}
            style={{ pointerEvents: showButton ? "auto" : "none" }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-sky-950/20"
          >
            {text.landingEnter}
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
