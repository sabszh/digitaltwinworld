"use client";

import type { Language } from "@/lib/i18n";
import { roleLabels, uiText } from "@/lib/i18n";
import type { UserRole } from "@/types/world2046";

const visibleRoles: UserRole[] = ["Ung", "Forælder", "Lærer / pædagog", "Arbejdsgiver", "Medarbejder", "For alle"];

export function RoleSelection({ onSelect, language }: { onSelect: (role: UserRole) => void; language: Language }) {
  const text = uiText[language];
  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/14 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">{text.choosePerspective}</p>
        <h2 className="mt-2 text-3xl font-semibold leading-tight text-white md:text-4xl">{text.roleQuestion}</h2>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {visibleRoles.map((role) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-4 text-left text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/34 hover:bg-white/[0.12]"
            >
              {roleLabels[language][role]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
