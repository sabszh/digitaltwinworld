"use client";

import { valueLabelsByLanguage } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import type { ValueProfile } from "@/types/world2046";

export function ValueProfileChart({ profile, language }: { profile: ValueProfile; language: Language }) {
  const entries = Object.entries(profile) as Array<[keyof ValueProfile, number]>;
  // Scale by the largest swing in either direction, so a -7 and a +7 read as
  // equally strong. Floor of 1 keeps an all-zero profile from dividing by zero.
  const scale = Math.max(1, ...entries.map(([, value]) => Math.abs(value)));

  return (
    <div className="grid gap-2.5">
      <div className="grid grid-cols-[150px_1fr_34px] items-center gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--faint)]">
        <span />
        <div className="flex justify-between">
          <span>{language === "da" ? "Fravalgt" : "Away from"}</span>
          <span>{language === "da" ? "Tilvalgt" : "Toward"}</span>
        </div>
        <span />
      </div>

      {entries.map(([key, value]) => {
        const magnitude = (Math.abs(value) / scale) * 50;
        const positive = value > 0;
        return (
          <div key={key} className="grid grid-cols-[150px_1fr_34px] items-center gap-3 text-sm">
            <span className="text-[var(--muted)]">{valueLabelsByLanguage[language][key]}</span>
            <div className="relative h-2 rounded-full bg-[var(--line)]">
              {/* centre axis: zero sits in the middle, not at the left edge */}
              <span aria-hidden className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-[var(--faint)]" />
              {value !== 0 && (
                <div
                  className="absolute top-0 h-full rounded-full"
                  style={{
                    width: `${magnitude}%`,
                    left: positive ? "50%" : undefined,
                    right: positive ? undefined : "50%",
                    background: positive ? "var(--accent)" : "var(--accent-warm)",
                  }}
                />
              )}
            </div>
            <span className="text-right tabular-nums text-[var(--faint)]">
              {value > 0 ? `+${value}` : value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
