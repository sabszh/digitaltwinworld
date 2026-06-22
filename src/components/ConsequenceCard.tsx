"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Choice } from "@/types/world2046";

export function ConsequenceCard({ choice, customAnswer, onBack, onContinue }: { choice?: Choice; customAnswer?: string; onBack: () => void; onContinue: () => void }) {
  const text = customAnswer
    ? "Du valgte en egen løsning. Den tæller som en lokal og gennemsigtig vej, hvor mennesker stadig er med til at forme systemet."
    : "Du valgte en løsning, hvor teknologien ikke bare fjernes, men får rammer. Det styrker tillid og handling, men kræver ansvar fra dem, der bruger systemet.";

  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-6">
      <div className="surface-panel max-w-2xl rounded-[2rem] p-7 md:p-9">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--accent-warm)]">Konsekvens</p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--text)]">{customAnswer ? "Din egen vej" : choice?.label}</h2>
        <p className="mt-5 text-lg font-normal leading-8 text-[var(--muted)]">{text}</p>
        {customAnswer && <p className="surface-card mt-4 rounded-2xl p-4 font-normal text-[var(--muted)]">{customAnswer}</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={onBack} className="surface-control inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold text-[var(--text)]">
            <ArrowLeft size={18} /> Tilbage
          </button>
          <button onClick={onContinue} className="inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-sky-950/20">
            Rejs videre <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
