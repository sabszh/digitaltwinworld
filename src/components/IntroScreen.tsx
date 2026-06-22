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
        <h1 className="text-7xl font-black tracking-normal text-white md:text-[110px] md:leading-none">World 2046</h1>
        <p className="mt-6 max-w-xl text-[22px] font-normal leading-8 text-white/82 md:text-[25px] md:leading-9">
          {text.introBody}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button onClick={onStart} className="inline-flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 font-medium text-slate-950 shadow-lg shadow-white/10 transition hover:bg-white">
            {text.startJourney} <ArrowRight size={18} />
          </button>
          <span className="text-sm font-light text-white/70">{text.introMeta}</span>
        </div>
      </div>
    </motion.section>
  );
}
