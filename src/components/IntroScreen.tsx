"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";

const TOTAL_SECTIONS = 3;

export function IntroScreen({
  onStart,
  language,
  introProgressRef,
}: {
  onStart: () => void;
  language: Language;
  introProgressRef?: React.MutableRefObject<number>;
}) {
  const text = uiText[language];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({ container: scrollRef });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
    if (introProgressRef) introProgressRef.current = value;
  });

  const currentSection = Math.min(TOTAL_SECTIONS, Math.floor(progress * TOTAL_SECTIONS) + 1);
  const readyToLaunch = progress > 0.88;

  return (
    <div ref={scrollRef} className="relative z-20 h-screen overflow-y-auto overflow-x-hidden">
      {/* Readability scrim behind the centered text */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(46% 38% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0.18) 55%, transparent 72%)" }}
      />

      {/* Side menu */}
      <div className="horizon-side-menu">
        <div className="horizon-menu-icon">
          <span />
          <span />
          <span />
        </div>
        <div className="horizon-vertical-text">2046</div>
      </div>

      {/* Section 1 — hero */}
      <section className="relative flex h-screen flex-col items-center justify-center px-6">
        <h1 className="horizon-title">World 2046</h1>
        <div className="horizon-subtitle max-w-2xl">
          <p className="horizon-subtitle-line">{text.introBody}</p>
          <p className="horizon-subtitle-line">{text.introMeta}</p>
        </div>
      </section>

      {/* Section 2 — build-up */}
      <section className="relative flex h-screen flex-col items-center justify-center px-6">
        <div className="max-w-2xl">
          <p className="horizon-lead">{text.introSectionTwoLine1}</p>
          <p className="horizon-subtitle-line">{text.introSectionTwoLine2}</p>
        </div>
      </section>

      {/* Section 3 — ready */}
      <section className="relative flex h-screen flex-col items-center justify-center px-6">
        <div className="flex max-w-2xl flex-col items-center">
          <p className="horizon-lead">{text.introSectionThreeLine1}</p>
          <p className="horizon-subtitle-line">{text.introSectionThreeLine2}</p>

          <motion.div
            initial={false}
            animate={{ opacity: readyToLaunch ? 1 : 0, y: readyToLaunch ? 0 : 24 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-10 flex flex-col items-center gap-5"
            style={{ pointerEvents: readyToLaunch ? "auto" : "none" }}
          >
            <p className="horizon-subtitle-line !text-[var(--text)]">{text.introReadyQuestion}</p>
            <button type="button" onClick={onStart} className="horizon-cta">
              {text.startJourney}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Scroll progress indicator */}
      <div className="horizon-scroll">
        <div className="horizon-scroll-text">{text.introScrollLabel}</div>
        <div className="horizon-progress-track">
          <motion.div className="horizon-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="horizon-section-counter">
          {String(currentSection).padStart(2, "0")} / {String(TOTAL_SECTIONS).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
