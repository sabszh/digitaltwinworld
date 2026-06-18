"use client";

import { useState } from "react";
import type { Choice, GeneratedDilemma } from "@/types/world2046";

export function ChoiceButton({ choice, index, onChoose }: { choice: Choice; index: number; onChoose: (choice: Choice) => void }) {
  return (
    <button onClick={() => onChoose(choice)} className="group grid grid-cols-[2rem_1fr] items-center gap-3 rounded-xl border border-white/10 bg-slate-950/42 p-3 text-left backdrop-blur-md transition hover:border-white/34 hover:bg-white/[0.08]">
      <span className="grid h-8 w-8 place-items-center rounded-full border border-white/14 text-sm text-white/60 transition group-hover:border-white/40 group-hover:text-white">
        {index + 1}
      </span>
      <span className="font-medium text-white">{choice.label}</span>
      {choice.description && <span className="mt-1 block text-sm text-white/62">{choice.description}</span>}
    </button>
  );
}

export function CustomAnswerInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="rounded-xl border border-dashed border-white/14 bg-slate-950/32 p-3 backdrop-blur-md">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        placeholder="Skriv egen løsning..."
        className="w-full resize-none bg-transparent text-white outline-none placeholder:text-white/38"
      />
      <button
        disabled={!text.trim()}
        onClick={() => onSubmit(text.trim())}
        className="mt-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Brug egen løsning
      </button>
    </div>
  );
}

export function DilemmaCard({ dilemma, onAnswer }: { dilemma: GeneratedDilemma; onAnswer: (choice: Choice, customAnswer?: string) => void }) {
  const customChoice: Choice = { id: "custom", label: "Egen løsning", valueImpacts: { trust: 1, localControl: 1, transparency: 1 } };
  return (
    <section className="relative z-20 flex min-h-screen items-end justify-center px-4 pb-4 pt-24 md:items-center md:justify-end md:px-8 md:pb-8">
      <div className="w-full max-w-[440px] rounded-3xl border border-white/12 bg-slate-950/54 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-white/44">
              <span>2046</span>
              <span>{dilemma.country}, {dilemma.city}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">{dilemma.title}</h2>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62">
            {dilemma.problemArea.split(" og ")[0]}
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-sm font-medium text-white">{dilemma.exactPlace?.name ?? dilemma.locationType}</p>
          <p className="mt-1 text-xs text-white/50">
            {dilemma.exactPlace?.address ?? `${dilemma.marker.lat.toFixed(5)}, ${dilemma.marker.lng.toFixed(5)}`}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-white/76">
          Du lander {dilemma.exactPlace ? `ved ${dilemma.exactPlace.name}` : `i ${dilemma.city}`} i 2046. {dilemma.scenePrompt}
        </p>

        <div className="mt-5">
          <p className="text-lg font-semibold text-white">{dilemma.question}</p>
          <div className="mt-3 grid gap-2">
            {dilemma.choices.map((choice, index) => (
              <ChoiceButton key={choice.id} choice={choice} index={index} onChoose={onAnswer} />
            ))}
            <CustomAnswerInput onSubmit={(text) => onAnswer(customChoice, text)} />
          </div>
        </div>
      </div>
    </section>
  );
}
