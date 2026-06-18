"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import type { GeneratedDilemma } from "@/types/world2046";

export function TravelTransition({ dilemma, language }: { dilemma?: GeneratedDilemma; language: Language }) {
  return (
    <div className="pointer-events-none relative z-20 flex min-h-screen items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl rounded-3xl border border-white/10 bg-slate-950/42 p-6 text-center shadow-2xl shadow-black/25 backdrop-blur-md">
        <p className="mt-4 text-3xl font-semibold text-white">{dilemma ? dilemma.exactPlace?.name ?? `${dilemma.city}, ${dilemma.country}` : uiText[language].finding}</p>
        {dilemma && (
          <p className="mt-3 font-mono text-sm text-white/58">
            {dilemma.marker.lat.toFixed(5)}, {dilemma.marker.lng.toFixed(5)}
          </p>
        )}
      </motion.div>
    </div>
  );
}
