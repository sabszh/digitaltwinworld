"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/i18n";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";
import { useEnterToContinue } from "@/lib/useEnterToContinue";

export function ConsentScreen({ language, status, onAccept, onDecline, onBack }: {
  language: Language;
  status: "idle" | "saving" | "saved" | "error" | "declined";
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
}) {
  const da = language === "da";
  const saving = status === "saving";
  useEnterToContinue(onAccept, !saving);
  return (
    <section className="relative z-20 grid min-h-dvh place-items-center px-5 py-10">
      <motion.div className="w-full max-w-2xl" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
        <JourneyCard className="p-7 md:p-10">
          <JourneyButton type="button" onClick={onBack} disabled={saving} variant="secondary" direction="back">
            {da ? "Tilbage til sidste valg" : "Back to the last choice"}
          </JourneyButton>

          <h1 className="mt-8 text-4xl font-semibold tracking-[-0.025em] text-[var(--text)]">
            {da ? "Må vi beholde dine svar?" : "May we keep your answers?"}
          </h1>
          {/* Two short lines, no icons, no reassurance theatre: the screen asks a
              question and says what it is for. Anything longer reads as a policy. */}
          <p className="mt-5 text-lg leading-7 text-[var(--muted)]">
            {da
              ? "Vi bruger svarene til at forstå, hvad mennesker prioriterer i 2046. Du får din rapport bagefter, uanset hvad du vælger."
              : "We use the answers to understand what people prioritise in 2046. You will see your report afterwards, whatever you choose."}
          </p>

          <div className="consent-scope-list surface-card mt-6 rounded-2xl p-5">
            <h2 className="font-semibold text-[var(--text)]">{da ? "Det her gemmer vi" : "This is what we keep"}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {da
                ? "Din rolle, dine valg, din rapport og det, du selv skrev undervejs."
                : "Your role, choices, report and anything you wrote along the way."}
            </p>
          </div>

          {status === "error" && (
            <p role="alert" className="mt-4 rounded-xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">
              {da ? "Det gik galt. Prøv igen, eller afslut uden at gemme." : "That did not work. Try again, or finish without saving."}
            </p>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <JourneyButton type="button" onClick={onAccept} disabled={saving} direction="forward">
              {saving ? (da ? "Gemmer…" : "Saving…") : status === "error" ? (da ? "Prøv igen" : "Try again") : da ? "Gem svarene" : "Save my answers"}
            </JourneyButton>
            <JourneyButton type="button" onClick={onDecline} disabled={saving} variant="secondary">
              {da ? "Fortsæt uden at gemme" : "Continue without saving"}
            </JourneyButton>
          </div>
        </JourneyCard>
      </motion.div>
    </section>
  );
}
