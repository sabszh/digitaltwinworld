"use client";

import type { Language } from "@/lib/i18n";

export function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="fixed right-4 top-4 z-40 rounded-full border border-white/12 bg-slate-950/45 p-1 text-xs font-medium text-white/62 backdrop-blur-md md:right-8 md:top-8">
      {(["da", "en"] as const).map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1.5 uppercase transition ${
            language === option ? "bg-white text-slate-950" : "hover:text-white"
          }`}
          aria-pressed={language === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
