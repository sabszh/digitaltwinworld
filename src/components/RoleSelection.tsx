"use client";

import type { Language } from "@/lib/i18n";
import { roleLabels, uiText } from "@/lib/i18n";
import type { UserRole } from "@/types/world2046";

const visibleRoles: UserRole[] = ["Ung", "Forælder", "Lærer / pædagog", "Arbejdsgiver", "Medarbejder", "For alle"];

export function RoleSelection({ onSelect, language }: { onSelect: (role: UserRole) => void; language: Language }) {
  const text = uiText[language];
  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-6">
      <div className="surface-panel w-full max-w-3xl rounded-[1.75rem] p-5 md:p-7">
        <h2 className="text-3xl font-semibold leading-tight text-[var(--text)] md:text-4xl">{text.roleQuestion}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {visibleRoles.map((role) => (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="surface-control rounded-2xl px-4 py-4 text-left text-lg font-medium text-[var(--text)] hover:-translate-y-0.5"
            >
              {roleLabels[language][role]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
