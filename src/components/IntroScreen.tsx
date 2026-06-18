"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";

export function IntroScreen({ onStart, language }: { onStart: () => void; language: Language }) {
  const text = uiText[language];
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-20 flex min-h-screen items-center px-6 md:px-12">
      <div className="max-w-2xl">
        <h1 className="text-6xl font-semibold tracking-normal text-white md:text-8xl">World 2046</h1>
        <p className="mt-6 max-w-xl text-xl leading-8 text-white/78">
          {text.introBody}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button onClick={onStart} className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-white/86">
            {text.startJourney} <ArrowRight size={18} />
          </button>
          <span className="text-sm text-white/62">{text.introMeta}</span>
        </div>
      </div>
    </motion.section>
  );
}
