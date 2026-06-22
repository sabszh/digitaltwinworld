"use client";

import { useState } from "react";
import type { Choice, GeneratedDilemma } from "@/types/world2046";

export function ChoiceButton({ choice, index, onChoose }: { choice: Choice; index: number; onChoose: (choice: Choice) => void }) {
  return (
    <button
      onClick={() => onChoose(choice)}
      className="surface-control group grid grid-cols-[2.25rem_1fr] items-start gap-x-3.5 rounded-2xl px-3.5 py-3 text-left hover:-translate-y-0.5"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/18 bg-white/[0.06] text-sm text-[var(--muted)] transition group-hover:border-[var(--accent)] group-hover:text-[var(--text)]">
        {index + 1}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-5 text-[var(--text)]">{choice.label}</span>
        {choice.description && <span className="mt-1 block text-[13px] font-normal leading-5 text-[var(--muted)]">{choice.description}</span>}
      </span>
    </button>
  );
}

export function CustomAnswerInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="surface-card rounded-2xl p-3.5">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={1}
        placeholder="Skriv egen løsning..."
        className="w-full resize-none bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
      />
      {text.trim() && (
        <button
          onClick={() => onSubmit(text.trim())}
        className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20"
        >
          Brug egen løsning
        </button>
      )}
    </div>
  );
}

export function DilemmaCard({ dilemma, onAnswer }: { dilemma: GeneratedDilemma; onAnswer: (choice: Choice, customAnswer?: string) => void }) {
  const customChoice: Choice = { id: "custom", label: "Egen løsning", valueImpacts: { trust: 1, localControl: 1, transparency: 1 } };
  return (
    <section className="relative z-20 flex h-dvh items-end justify-center px-4 py-4 pt-20 md:items-center md:justify-end md:px-8 md:py-5">
      <div className="surface-panel flex max-h-full w-full max-w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl p-5 md:p-5">
        <div className="min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
                <span>2046</span>
                <span>{dilemma.country}, {dilemma.city}</span>
              </div>
              <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[var(--text)] md:text-[34px]">{dilemma.title}</h2>
            </div>
            <span className="shrink-0 rounded-full border border-[rgba(143,199,232,0.28)] bg-[rgba(143,199,232,0.1)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
              {dilemma.problemArea.split(" og ")[0]}
            </span>
          </div>

          <div className="surface-card mt-3.5 flex items-start gap-3 rounded-2xl p-3.5">
            <span className="mt-0.5 text-base text-[var(--accent)]">⌖</span>
            <div>
              <p className="text-[15px] font-semibold text-[var(--text)]">{dilemma.exactPlace?.name ?? dilemma.locationType}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {dilemma.exactPlace?.address ?? `${dilemma.marker.lat.toFixed(5)}, ${dilemma.marker.lng.toFixed(5)}`}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[15px] font-normal leading-6 text-[var(--muted)]">{dilemma.scenePrompt}</p>

          <div className="mt-5 pb-1">
            <p className="text-xl font-semibold text-[var(--text)]">{dilemma.question}</p>
            <div className="mt-3 grid gap-2.5">
              {dilemma.choices.map((choice, index) => (
                <ChoiceButton key={choice.id} choice={choice} index={index} onChoose={onAnswer} />
              ))}
              <CustomAnswerInput onSubmit={(text) => onAnswer(customChoice, text)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
