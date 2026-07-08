"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { AiLoader } from "@/components/ui/ai-loader";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import type { GeneratedDilemma, Persona } from "@/types/world2046";

function FlipDigit({ digit }: { digit: string }) {
  return (
    <span className="relative inline-flex h-10 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--night)] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4)]">
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center font-mono text-xl tabular-nums text-[var(--cloud)]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function YearCounter() {
  const year = useMotionValue(2026);
  const [display, setDisplay] = useState("2026");

  useMotionValueEvent(year, "change", (value) => setDisplay(String(Math.round(value))));

  useEffect(() => {
    const controls = animate(year, 2046, { duration: 2.4, ease: "easeInOut" });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className="inline-flex gap-1">
      {display.split("").map((digit, index) => (
        <FlipDigit key={index} digit={digit} />
      ))}
    </span>
  );
}

export function TravelTransition({
  dilemma,
  persona,
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
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[rgba(255,255,255,0.14)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative text-center"
        >
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(60,131,207,0.24),transparent_66%)] blur-2xl"
            animate={{ opacity: [0.38, 0.86, 0.38] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative mb-4">
            <YearCounter />
          </div>
          <AiLoader texts={steps} className="loader-wrapper--globe-scan" />
        </motion.div>
      </div>
    );
  }

  const destination = dilemma.exactPlace?.name ?? `${dilemma.city}, ${dilemma.country}`;
  const context = `${dilemma.problemArea} · ${dilemma.technology}`;

  return (
    <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="surface-panel relative w-full max-w-lg overflow-hidden rounded-3xl p-7 text-center">
        <motion.div
          aria-hidden
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70"
          initial={{ scaleX: 0.25 }}
          animate={{ scaleX: [0.25, 1, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[rgba(143,199,232,0.28)] bg-[rgba(143,199,232,0.08)]">
          <motion.span
            className="block h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_24px_rgba(143,199,232,0.72)]"
            animate={{ scale: [1, 1.28, 1], opacity: [0.72, 1, 0.72] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">{text.travelArrivingKicker}</p>
        <p className="mt-3 text-3xl font-semibold leading-tight text-[var(--text)]">{destination}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">{context}</p>
        {persona && (
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--faint)]">
            {text.travelArrivingAs} <span className="text-[var(--muted)]">{persona.title}</span>
          </p>
        )}
      </motion.div>
    </div>
  );
}
