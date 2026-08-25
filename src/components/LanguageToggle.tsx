"use client";

import type { Language } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";

export function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="surface-panel fixed right-4 top-4 z-40 rounded-full p-1 text-sm font-bold text-[var(--muted)] md:right-8 md:top-8">
      {(["da", "en"] as const).map((option) => (
        <button
          key={option}
          onClick={() => {
            worldSound.playToggle();
            onChange(option);
          }}
          className={`rounded-full px-3.5 py-1.5 uppercase tracking-wide transition ${
            language === option ? "bg-[var(--text)] text-white shadow-sm" : "hover:text-[var(--text)]"
          }`}
          aria-pressed={language === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
