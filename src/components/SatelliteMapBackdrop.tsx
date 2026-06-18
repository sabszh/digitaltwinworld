"use client";

import { motion } from "framer-motion";
import { getSatelliteImageModel } from "@/lib/satelliteProviders";
import type { GeneratedDilemma } from "@/types/world2046";

export function SatelliteMapBackdrop({
  dilemma,
  visible,
}: {
  dilemma?: GeneratedDilemma;
  visible: boolean;
}) {
  if (!dilemma) return null;

  const zoom = dilemma.exactPlace ? 16 : 13;
  const model = getSatelliteImageModel({
    lat: dilemma.marker.lat,
    lng: dilemma.marker.lng,
    zoom,
    size: 1280,
  });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 1.08 }}
      transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`absolute inset-0 ${model.mode === "grid" ? "grid grid-cols-3" : ""}`}>
        {model.images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={image.id} src={image.url} alt="" className="h-full w-full object-cover" draggable={false} />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0_18%,rgba(2,11,22,0.28)_44%,rgba(2,11,22,0.78)_100%)]" />
      <div className="absolute inset-0 bg-slate-950/18" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 shadow-[0_0_42px_rgba(255,255,255,0.28)]">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/55" />
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/55" />
      </div>
      <div className="absolute bottom-5 left-5 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-white/62 backdrop-blur-md">
        {model.attribution} · z{model.zoom}
      </div>
    </motion.div>
  );
}
