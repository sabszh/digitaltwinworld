"use client";

import { valueLabels } from "@/data/taxonomies";
import type { ValueProfile } from "@/types/world2046";

export function ValueProfileChart({ profile }: { profile: ValueProfile }) {
  const max = Math.max(1, ...Object.values(profile));
  return (
    <div className="grid gap-3">
      {(Object.entries(profile) as Array<[keyof ValueProfile, number]>).map(([key, value]) => (
        <div key={key} className="grid grid-cols-[150px_1fr_28px] items-center gap-3 text-sm">
          <span className="text-white/68">{valueLabels[key]}</span>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-200" style={{ width: `${(value / max) * 100}%` }} />
          </div>
          <span className="text-right text-white/56">{value}</span>
        </div>
      ))}
    </div>
  );
}
