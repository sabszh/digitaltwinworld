"use client";

export function GlobeMarker({ label, active = false }: { label?: string; active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${active ? "bg-amber-200 text-slate-950" : "bg-white/10 text-white/70"}`}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-slate-950" : "bg-cyan-200"}`} />
      {label ?? "Lokation"}
    </span>
  );
}
