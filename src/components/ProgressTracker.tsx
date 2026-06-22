"use client";

import { SESSION_DILEMMA_COUNT } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";

export function ProgressTracker({ completed, language }: { completed: number; language: Language }) {
  return (
    <div className="surface-panel fixed left-4 top-4 z-30 flex items-center gap-3 rounded-full px-4 py-2 text-sm text-[var(--text)] md:left-8 md:top-8">
      <span className="font-medium">{Math.min(completed + 1, SESSION_DILEMMA_COUNT)} / {SESSION_DILEMMA_COUNT}</span>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/12">
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${(completed / SESSION_DILEMMA_COUNT) * 100}%` }} />
      </div>
      <span className="font-normal text-[var(--muted)]">{SESSION_DILEMMA_COUNT - completed} {uiText[language].left}</span>
    </div>
  );
}
