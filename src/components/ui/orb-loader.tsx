"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * The report's loading state, built from the same orb as the time-travel screen.
 *
 * The travel orb is a ring wrapped around the live Mapbox globe and is sized off
 * geometry that only exists while the globe is on screen. The report runs on a
 * light background with no globe behind it, so this is a self-contained sphere
 * in the same visual language: a navy planet, a terminator sweeping across it,
 * and the halo the travel screen uses — rather than a second, unrelated spinner.
 */
export function OrbLoader({ texts, label }: { texts: string[]; label?: string }) {
  const phrases = texts.length ? texts : [label ?? ""];
  const [index, setIndex] = useState(0);
  const active = phrases[index] ?? "";

  useEffect(() => {
    if (phrases.length < 2) return;
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % phrases.length), 2400);
    return () => window.clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="orb-loader" role="status" aria-live="polite" aria-label={active}>
      <div className="orb-loader-globe" aria-hidden="true">
        <motion.span
          className="orb-loader-halo"
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.95, 0.5] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="orb-loader-body" />
        <motion.span
          className="orb-loader-sweep"
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="orb-loader-sweep orb-loader-sweep--slow"
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <span key={active} className="orb-loader-text" aria-hidden="true">
        {active}
      </span>
    </div>
  );
}
