"use client";

import { getSatelliteImageModel } from "@/lib/satelliteProviders";
import type { GeneratedDilemma } from "@/types/world2046";

export function SatelliteCloseup({ dilemma, compact = false }: { dilemma: GeneratedDilemma; compact?: boolean }) {
  const zoom = dilemma.exactPlace ? 16 : 13;
  const model = getSatelliteImageModel({
    lat: dilemma.marker.lat,
    lng: dilemma.marker.lng,
    zoom,
    size: compact ? 360 : 520,
  });

  return (
    <div className="surface-panel relative overflow-hidden rounded-2xl">
      <div className={`aspect-square ${model.mode === "grid" ? "grid grid-cols-3" : ""} ${compact ? "w-full max-w-[240px]" : "w-[min(78vw,460px)]"}`}>
        {model.images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image.id} src={image.url} alt="" className="h-full w-full object-cover" draggable={false} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0_22%,rgba(245,255,250,0.08)_48%,rgba(25,55,58,0.22)_100%)]" />
      <div
        className="pointer-events-none absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_0_22px_rgba(255,255,255,0.28)]"
        style={model.markerStyle}
      >
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/65" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/65" />
      </div>
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/58 to-transparent ${compact ? "p-3" : "p-4"}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--faint)]">Satellite imagery · z{model.zoom}</p>
        <p className="mt-1 text-sm font-medium text-[var(--text)]">
          {dilemma.exactPlace?.name ?? `${dilemma.city}, ${dilemma.country}`}
        </p>
        {dilemma.exactPlace?.address && <p className="text-xs text-[var(--muted)]">{dilemma.exactPlace.address}</p>}
        <p className="text-xs text-[var(--muted)]">
          {dilemma.marker.lat.toFixed(5)}, {dilemma.marker.lng.toFixed(5)}
        </p>
        {!compact && <p className="mt-1 text-[10px] text-[var(--faint)]">{model.attribution}</p>}
      </div>
    </div>
  );
}
