"use client";

import { motion } from "framer-motion";
import { Database, ShieldCheck } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";

export function ConsentScreen({ language, status, onAccept, onDecline, onBack }: {
  language: Language;
  status: "idle" | "saving" | "saved" | "error" | "declined";
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
}) {
  const da = language === "da";
  const saving = status === "saving";
  return (
    <section className="relative z-20 grid min-h-dvh place-items-center px-5 py-10">
      <motion.div className="w-full max-w-2xl" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}>
        <JourneyCard className="p-7 md:p-10">
        <JourneyButton type="button" onClick={onBack} disabled={saving} variant="secondary" direction="back">{da ? "Tilbage til rapporten" : "Back to report"}</JourneyButton>
        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(143,199,232,0.14)] text-[var(--accent)]"><Database size={22} /></div>
        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.025em] text-[var(--text)]">{da ? "Må vi gemme din rejse?" : "May we save your journey?"}</h1>
        <p className="mt-5 text-lg leading-7 text-[var(--muted)]">{da ? "Dine svar kan hjælpe os med at se, hvilke spørgsmål om 2046 der betyder noget for besøgende. Din oplevelse er fuldført, uanset hvad du vælger." : "Your answers can help us understand which questions about 2046 matter to visitors. Your experience is complete whichever option you choose."}</p>
        <div className="surface-card mt-6 rounded-2xl p-5">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[var(--accent)]" size={20} /><div><h2 className="font-semibold text-[var(--text)]">{da ? "Det gemmer vi" : "What we save"}</h2><p className="mt-1 text-sm leading-6 text-[var(--muted)]">{da ? "Rolle, skrevne svar, valg, refleksioner, værdiprofil, sprog og rapport. Ingen navn, e-mail, lydoptagelse eller bevidst identitetsfelt. Skrivne svar kan dog indeholde oplysninger, du selv har skrevet." : "Role, written answers, choices, reflections, value profile, language and report. No name, email, audio recording or deliberate identity field. Written answers may still contain details you entered yourself."}</p></div></div>
        </div>
        {status === "error" && <p role="alert" className="mt-4 rounded-xl border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">{da ? "Rejsen kunne ikke gemmes. Du kan prøve igen eller afslutte uden at gemme." : "The journey could not be saved. You can retry or finish without saving."}</p>}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <JourneyButton type="button" onClick={onAccept} disabled={saving} direction="forward">{saving ? (da ? "Gemmer…" : "Saving…") : (status === "error" ? (da ? "Prøv igen" : "Try again") : (da ? "Ja, gem mine svar" : "Yes, save my answers"))}</JourneyButton>
          <JourneyButton type="button" onClick={onDecline} disabled={saving} variant="secondary">{da ? "Nej, afslut uden at gemme" : "No, finish without saving"}</JourneyButton>
        </div>
        </JourneyCard>
      </motion.div>
    </section>
  );
}
