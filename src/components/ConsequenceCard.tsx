"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { valueLabels } from "@/data/taxonomies";
import { worldSound } from "@/lib/sound";
import type { Choice, GeneratedDilemma } from "@/types/world2046";

export function ConsequenceCard({
  choice,
  dilemma,
  customAnswer,
  onBack,
  onContinue,
}: {
  choice?: Choice;
  dilemma?: GeneratedDilemma;
  customAnswer?: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  const prioritizedValues = Object.entries(choice?.valueImpacts ?? {})
    .filter(([, impact]) => typeof impact === "number" && impact > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => valueLabels[key as keyof typeof valueLabels].toLowerCase());

  const valuePhrase =
    prioritizedValues.length === 0
      ? "en mere afvejet retning"
      : prioritizedValues.length === 1
        ? prioritizedValues[0]
        : `${prioritizedValues[0]} og ${prioritizedValues[1]}`;
  const place = dilemma?.exactPlace?.name ?? dilemma?.locationType ?? "stedet";
  const technology = dilemma?.technology ?? "teknologien";

  const text = customAnswer
    ? `Din egen løsning gør ${place} til et lokalt forsøg, hvor ${technology} får tydeligere rammer. Det kan skabe mere ejerskab, men kræver at nogen følger op, når hverdagen ændrer sig.`
    : choice?.consequence
      ? choice.consequence
    : choice
      ? `${choice.label} gør ${technology} til et mere aktivt valg på ${place}. Det styrker ${valuePhrase}, men flytter også ansvar til dem, der skal justere løsningen i hverdagen.`
      : "Du valgte en løsning, hvor teknologien får tydeligere rammer. Det styrker retningen, men kræver stadig ansvar fra dem, der bruger systemet.";

  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-6">
      <div className="surface-panel max-w-2xl rounded-[2rem] p-7 md:p-9">
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--accent-warm)]">Konsekvens</p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--text)]">{customAnswer ? "Din egen vej" : choice?.label}</h2>
        <p className="mt-5 text-lg font-normal leading-8 text-[var(--muted)]">{text}</p>
        {customAnswer && <p className="surface-card mt-4 rounded-2xl p-4 font-normal text-[var(--muted)]">{customAnswer}</p>}
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={() => {
              worldSound.playButtonTap();
              onBack();
            }}
            className="surface-control inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold text-[var(--text)]"
          >
            <ArrowLeft size={18} /> Tilbage
          </button>
          <button
            onClick={() => {
              worldSound.playButtonTap();
              onContinue();
            }}
            className="inline-flex items-center gap-3 rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-sky-950/20"
          >
            Rejs videre <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
