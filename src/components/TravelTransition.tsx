"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/i18n";
import type { GeneratedDilemma } from "@/types/world2046";

const loadingCopy = {
  da: {
    title: "Scanner kloden",
    subtitle: "Finder de mest relevante steder for din rejse",
    steps: ["Matcher tema", "Zoomer ind", "Bygger dilemma"],
  },
  en: {
    title: "Scanning the globe",
    subtitle: "Finding the most relevant places for your journey",
    steps: ["Matching theme", "Zooming in", "Building dilemma"],
  },
} satisfies Record<Language, { title: string; subtitle: string; steps: string[] }>;

export function TravelTransition({ dilemma, language }: { dilemma?: GeneratedDilemma; language: Language }) {
  if (!dilemma) {
    const copy = loadingCopy[language];

    return (
      <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-6">
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(143,199,232,0.05),rgba(5,16,27,0.1)_38%,rgba(5,16,27,0.26)_100%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative w-full max-w-[min(620px,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-white/15 bg-[rgba(5,18,24,0.72)] px-7 py-8 text-center shadow-[0_28px_100px_rgba(0,0,0,0.42)] backdrop-blur-[18px] md:px-12 md:py-10"
        >
          <motion.div
            aria-hidden
            className="absolute -left-28 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-[rgba(143,199,232,0.16)]"
            animate={{ rotate: 360, scale: [1, 1.04, 1] }}
            transition={{ rotate: { duration: 9, repeat: Infinity, ease: "linear" }, scale: { duration: 3.6, repeat: Infinity, ease: "easeInOut" } }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-20 top-6 h-48 w-48 rounded-full border border-[rgba(242,200,121,0.12)]"
            animate={{ rotate: -360, scale: [1.02, 0.96, 1.02] }}
            transition={{ rotate: { duration: 11, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-70"
            animate={{ x: ["-45%", "45%", "-45%"], opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[rgba(143,199,232,0.24)] bg-[rgba(143,199,232,0.06)] shadow-[0_0_54px_rgba(143,199,232,0.2)]">
              <motion.span
                aria-hidden
                className="absolute h-20 w-20 rounded-full border border-[rgba(143,199,232,0.18)]"
                animate={{ scale: [0.72, 1.18, 0.72], opacity: [0.15, 0.65, 0.15] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className="block h-3 w-3 rounded-full bg-[var(--text)] shadow-[0_0_28px_rgba(247,243,234,0.82)]"
                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <h2 className="mt-7 text-5xl font-semibold leading-none tracking-[-0.04em] text-[var(--text)] md:text-6xl">{copy.title}</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg font-normal leading-7 text-[var(--muted)] md:text-xl">{copy.subtitle}</p>
            <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
              <motion.div
                className="h-full rounded-full bg-[rgba(143,199,232,0.22)]"
                animate={{ width: ["24%", "72%", "38%", "84%"] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="-mt-2 h-full w-32 rounded-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent shadow-[0_0_22px_rgba(143,199,232,0.65)]"
                animate={{ x: ["-8rem", "28rem"] }}
                transition={{ duration: 2.15, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {copy.steps.map((step, index) => (
                <motion.span
                  key={step}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-1.5 text-sm text-[var(--muted)]"
                  animate={{ opacity: [0.38, 0.94, 0.38], y: [0, -1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.34, ease: "easeInOut" }}
                >
                  {step}
                </motion.span>
              ))}
            </div>
          </div>
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
