"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import type { GeneratedDilemma } from "@/types/world2046";

export function TravelTransition({ dilemma, language }: { dilemma?: GeneratedDilemma; language: Language }) {
  if (!dilemma) {
    return (
      <div className="pointer-events-none relative z-20 flex min-h-screen items-end justify-center px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-panel rounded-full px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{uiText[language].finding}</span>
        </motion.div>
      </div>
    );
  }

  const destination = dilemma ? dilemma.exactPlace?.name ?? `${dilemma.city}, ${dilemma.country}` : uiText[language].finding;
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
