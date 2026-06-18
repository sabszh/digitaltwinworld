"use client";

import { ArrowRight } from "lucide-react";
import type { Choice } from "@/types/world2046";

export function ConsequenceCard({ choice, customAnswer, onContinue }: { choice?: Choice; customAnswer?: string; onContinue: () => void }) {
  const text = customAnswer
    ? "Du valgte en egen løsning. Den tæller som en lokal og gennemsigtig vej, hvor mennesker stadig er med til at forme systemet."
    : "Du valgte en løsning, hvor teknologien ikke bare fjernes, men får rammer. Det styrker tillid og handling, men kræver ansvar fra dem, der bruger systemet.";

  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-6">
      <div className="glass max-w-2xl rounded-[2rem] p-7 md:p-9">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-amber-200/80">Konsekvens</p>
        <h2 className="mt-3 text-3xl font-semibold">{customAnswer ? "Din egen vej" : choice?.label}</h2>
        <p className="mt-5 text-lg leading-8 text-white/78">{text}</p>
        {customAnswer && <p className="mt-4 rounded-2xl bg-white/[0.06] p-4 text-white/70">{customAnswer}</p>}
        <button onClick={onContinue} className="mt-7 inline-flex items-center gap-3 rounded-full bg-cyan-200 px-5 py-3 font-semibold text-slate-950">
          Rejs videre <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
