"use client";

import { valueLabels } from "@/data/taxonomies";
import type { ValueProfile } from "@/types/world2046";

export function ValueProfileChart({ profile }: { profile: ValueProfile }) {
  const max = Math.max(1, ...Object.values(profile));
  return (
    <div className="grid gap-3">
      {(Object.entries(profile) as Array<[keyof ValueProfile, number]>).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[150px_1fr_28px] items-center gap-3 text-sm">
          <span className="text-[var(--muted)]">{valueLabels[key]}</span>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--text)]" style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <span className="text-right text-[var(--faint)]">{value}</span>
        </div>
      ))}
    </div>
  );
}
