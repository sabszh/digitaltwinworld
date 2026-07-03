"use client";

import { motion } from "framer-motion";
import { AiLoader } from "@/components/ui/ai-loader";
import type { Language } from "@/lib/i18n";
import type { GeneratedDilemma } from "@/types/world2046";

const loadingCopy = {
  da: {
    steps: ["Scanner kloden", "Scanner byer", "Bygger dilemma"],
  },
  en: {
    steps: ["Scanning the globe", "Scanning cities", "Building dilemma"],
  },
} satisfies Record<Language, { steps: string[] }>;

export function TravelTransition({ dilemma, language }: { dilemma?: GeneratedDilemma; language: Language }) {
  if (!dilemma) {
    const copy = loadingCopy[language];

    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex h-screen items-center justify-center overflow-hidden px-6">
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[rgba(0,0,0,0.42)]"
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
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(173,95,255,0.22),transparent_66%)] blur-2xl"
            animate={{ opacity: [0.38, 0.86, 0.38] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <AiLoader texts={copy.steps} className="loader-wrapper--globe-scan" />
        </motion.div>
      </div>
    );
  }

  const destination = dilemma.exactPlace?.name ?? `${dilemma.city}, ${dilemma.country}`;
  const context = dilemma ? `${dilemma.problemArea} · ${dilemma.technology}` : "World 2046";

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
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">Rejser til</p>
        <p className="mt-3 text-3xl font-semibold leading-tight text-[var(--text)]">{destination}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">{context}</p>
      </motion.div>
    </div>
  );
}
