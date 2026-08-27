"use client";

import { motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AiLoader } from "@/components/ui/ai-loader";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import { UX_TIMING } from "@/lib/uxTiming";
import type { GeneratedDilemma } from "@/types/world2046";

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

/**
 * Counts 2026 → 2046 while the destination is being generated.
 *
 * It must not reach 2046 before the app has somewhere to land: arriving early
 * and then sitting there makes the wait feel broken. So the counter eases
 * towards 2045 over a span far longer than any generation, decelerating as it
 * goes, and only steps onto 2046 once `ready` turns true. `onLanded` fires after
 * the glitch so the caller can hold the view until the number has actually
 * arrived.
 */
function YearCounter({ ready, onLanded }: { ready: boolean; onLanded: () => void }) {
  const year = useMotionValue(2026);
  const [display, setDisplay] = useState("2026");
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchFiredRef = useRef(false);
  const lastDigitsRef = useRef("2026");
  // Kept in a ref so the motion-value subscription always calls the latest
  // callback without resubscribing on every render.
  const landedRef = useRef(onLanded);
  useEffect(() => {
    landedRef.current = onLanded;
  }, [onLanded]);
  // Written straight to the DOM rather than through state: this changes on every
  // frame of a 30s animation, and re-rendering four flip digits that often is
  // wasted work. CSS reads it to grow the glow as 2046 approaches.
  const counterRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(year, "change", (value) => {
    counterRef.current?.style.setProperty("--year-progress", ((value - 2026) / 20).toFixed(3));
    const rounded = Math.round(value);
    const next = String(rounded).padStart(4, "0").slice(-4);
    if (next !== lastDigitsRef.current) {
      lastDigitsRef.current = next;
      setDisplay(next);
      if (rounded < 2046) worldSound.playYearTick();
    }
    if (rounded >= 2046 && !glitchFiredRef.current) {
      glitchFiredRef.current = true;
      setIsGlitching(true);
      worldSound.playYearLanded();
      window.setTimeout(() => {
        setIsGlitching(false);
        landedRef.current();
      }, 620);
    }
  });

  useEffect(() => {
    // Stops one short of 2046 — the last year belongs to the arrival.
    const controls = animate(year, 2045, {
      duration: UX_TIMING.yearCounterApproachMs / 1000,
      ease: [0.12, 0.62, 0.2, 1],
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Scale the final run to the distance left, so a fast generation still
    // reads as a run-up rather than a jump cut.
    const remaining = Math.max(0, 2046 - year.get());
    const controls = animate(year, 2046, {
      duration: Math.min(2.4, UX_TIMING.yearCounterLandMs / 1000 + remaining * 0.09),
      ease: "easeOut",
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <span ref={counterRef} className={`year-counter inline-flex gap-1 ${isGlitching ? "year-glitch" : ""}`}>
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
  error,
  onRetry,
  onArrive,
}: {
  dilemma?: GeneratedDilemma;
  language: Language;
  isFirstTrip: boolean;
  error?: string;
  onRetry: () => void;
  onArrive: () => void;
}) {
  const text = uiText[language];
  // The loading view stays up until the counter has actually reached 2046, even
  // if the destination arrived earlier — otherwise the year is cut off mid-flip.
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (!landed) return;
    worldSound.playArrivalStamp();
    onArrive();
  }, [landed, onArrive]);

  if (error) {
    return (
      <div className="fixed inset-0 z-20 grid place-items-center px-6">
        <div className="journey-card w-full max-w-md p-7 text-center">
          <p className="text-lg font-semibold text-[var(--text)]">{language === "da" ? "Vi kunne ikke finde næste stop." : "We could not find the next stop."}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{language === "da" ? "Prøv igen om et øjeblik." : "Please try again in a moment."}</p>
          <button type="button" onClick={onRetry} className="journey-button journey-button--primary mt-6">{language === "da" ? "Prøv igen" : "Try again"}</button>
        </div>
      </div>
    );
  }

  if (!dilemma || !landed) {
    const steps = isFirstTrip
      ? [text.timeMachineTripOneStep1, text.timeMachineTripOneStep2, text.timeMachineTripOneStep3]
      : [text.timeMachineTripNextStep1, text.timeMachineTripNextStep2, text.timeMachineTripNextStep3];

    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex h-screen items-center justify-center overflow-hidden px-6">
        <div aria-hidden className="absolute inset-0 bg-[rgba(0,0,0,0.32)]" />

        {/* A gradient orb wrapped around the globe rather than a grid over the
            viewport: it reads as energy gathering at the planet itself, and it
            scales with the globe instead of squaring off at the screen edges.
            Two counter-rotating layers keep the light moving without a seam. */}
        <div aria-hidden className="transit-orb">
          <motion.div
            className="transit-orb-halo"
            animate={{ scale: [1, 1.05, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="transit-orb-sheen"
            animate={{ rotate: 360 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="transit-orb-sheen transit-orb-sheen--reverse"
            animate={{ rotate: -360 }}
            transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          />
        </div>
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
            <YearCounter ready={Boolean(dilemma)} onLanded={() => setLanded(true)} />
          </div>
          <AiLoader texts={steps} className="loader-wrapper--globe-scan" />
        </motion.div>
      </div>
    );
  }

  return null;
}
