"use client";

import { SESSION_DILEMMA_COUNT } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";

export function ProgressTracker({ completed, language }: { completed: number; language: Language }) {
  return (
    <div className="fixed left-4 top-4 z-30 flex items-center gap-3 rounded-full border border-white/12 bg-slate-950/55 px-4 py-2 text-sm text-white/86 backdrop-blur-md md:left-8 md:top-8">
      <span className="font-medium">{Math.min(completed + 1, SESSION_DILEMMA_COUNT)} / {SESSION_DILEMMA_COUNT}</span>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-white/80" style={{ width: `${(completed / SESSION_DILEMMA_COUNT) * 100}%` }} />
      </div>
      <span className="text-white/60">{SESSION_DILEMMA_COUNT - completed} {uiText[language].left}</span>
    </div>
  );
}
