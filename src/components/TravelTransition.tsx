"use client";

import { motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { AiLoader } from "@/components/ui/ai-loader";
import { WarpCanvas } from "@/components/WarpCanvas";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { UX_TIMING } from "@/lib/uxTiming";
import type { GeneratedDilemma, Persona } from "@/types/world2046";
import { problemAreaLabelsByLanguage } from "@/data/taxonomies";

function FlipDigit({ digit }: { digit: string }) {
  return (
    <span className="flip-digit">
      <span aria-hidden className="flip-digit-seam" />
      <motion.span
        key={digit}
        initial={{ opacity: 0, y: "-42%", rotateX: -62 }}
        animate={{ opacity: 1, y: "0%", rotateX: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flip-digit-face"
      >
        {digit}
      </motion.span>
    </span>
  );
}

function YearCounter() {
  const year = useMotionValue(2026);
  const [display, setDisplay] = useState("2026");
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchFiredRef = useRef(false);

  useMotionValueEvent(year, "change", (value) => {
    const rounded = Math.round(value);
    setDisplay(String(rounded).padStart(4, "0").slice(-4));
    // Trigger chromatic aberration glitch as we hit 2046
    if (rounded >= 2046 && !glitchFiredRef.current) {
      glitchFiredRef.current = true;
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 620);
    }
  });

  useEffect(() => {
    const controls = animate(year, 2046, { duration: UX_TIMING.yearCounterMs / 1000, ease: "easeInOut" });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className={`year-counter inline-flex gap-1 ${isGlitching ? "year-glitch" : ""}`}>
      {display.split("").map((digit, index) => (
        <FlipDigit key={index} digit={digit} />
      ))}
    </span>
  );
}

export function TravelTransition({
  dilemma,
  language,
  isFirstTrip,
}: {
  dilemma?: GeneratedDilemma;
  persona?: Persona;
  language: Language;
  isFirstTrip: boolean;
}) {
  const text = uiText[language];

  if (!dilemma) {
    const steps = isFirstTrip
      ? [text.timeMachineTripOneStep1, text.timeMachineTripOneStep2, text.timeMachineTripOneStep3]
      : [text.timeMachineTripNextStep1, text.timeMachineTripNextStep2, text.timeMachineTripNextStep3];

    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex h-screen items-center justify-center overflow-hidden px-6">
        {/* Warp star streaks */}
        <WarpCanvas />

        <div aria-hidden className="absolute inset-0 bg-[rgba(0,0,0,0.32)]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-20 text-center"
        >
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(60,131,207,0.24),transparent_66%)] blur-2xl"
            animate={{ opacity: [0.38, 0.86, 0.38] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="time-transit">
            <span className="time-transit-label">
              {language === "da" ? "Tidsrejse i gang" : "Time transit in progress"}
            </span>
            <YearCounter />
            <span className="time-transit-route">2026 → 2046</span>
          </div>
          <AiLoader texts={steps} className="loader-wrapper--globe-scan" />
        </motion.div>
      </div>
    );
  }

  const destination = dilemma.exactPlace?.name ?? `${dilemma.city}, ${dilemma.country}`;
  const context = language === "da" ? `${dilemma.problemArea} · ${dilemma.technology}` : problemAreaLabelsByLanguage.en[dilemma.problemArea];

  return (
    <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="approach-card">
        <h2><MapPin className="h-5 w-5" aria-hidden="true" /> {destination}</h2>
        <p>{context} · 2046</p>
      </motion.div>
    </div>
  );
}
