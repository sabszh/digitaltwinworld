"use client";

export function GlobeMarker({ label, active = false }: { label?: string; active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${active ? "bg-amber-100 text-slate-950" : "bg-white/14 text-white/74"}`}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-slate-950" : "bg-sky-100"}`} />
      {label ?? "Lokation"}
    </span>
  );
}
