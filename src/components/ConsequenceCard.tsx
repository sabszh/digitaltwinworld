"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { simplifyTextForAudience } from "@/lib/audience";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import type { Choice, GeneratedDilemma } from "@/types/world2046";

export function ConsequenceCard({
  choice,
  dilemma,
  customAnswer,
  language,
  onBack,
  onContinue,
}: {
  choice?: Choice;
  dilemma?: GeneratedDilemma;
  customAnswer?: string;
  language: Language;
  onBack: () => void;
  onContinue: (reflection: string, viaVoice: boolean) => void;
}) {
  const text = uiText[language];
  const place = dilemma?.exactPlace?.name ?? dilemma?.locationType ?? "stedet";
  const technology = dilemma ? simplifyTextForAudience(dilemma.role, dilemma.technology) : "teknologien";

  const consequenceText = customAnswer
    ? simplifyTextForAudience(dilemma?.role ?? "For alle", `Din løsning giver ${technology} tydeligere rammer på ${place}.`)
    : choice?.consequence
      ? simplifyTextForAudience(dilemma?.role ?? "For alle", choice.consequence.split(".")[0] + ".")
    : choice
      ? simplifyTextForAudience(dilemma?.role ?? "For alle", `${choice.label} ændrer balancen mellem mennesker og ${technology}.`)
      : "Dit valg ændrer retningen.";

  return (
    // Desaturation reveal: enters desaturated, floods back to full colour
    <motion.section
      className="relative z-20 grid min-h-screen place-items-center px-6 py-10"
      initial={{ filter: "saturate(0.12)" }}
      animate={{ filter: "saturate(1)" }}
      transition={{ duration: 1.0, ease: "easeOut" }}
    >
      <div className="surface-panel consequence-card max-w-xl p-7 md:p-8">
        <p className="consequence-eyebrow">{dilemma?.exactPlace?.name ?? dilemma?.city ?? text.consequenceKicker}</p>
        <h2 className="font-editorial mt-3 text-3xl font-semibold italic text-[var(--text)]">{customAnswer ? text.consequenceOwnPath : choice?.label}</h2>
        <p className="mt-5 text-lg font-normal leading-7 text-[var(--muted)]">{consequenceText}</p>

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => {
              worldSound.playButtonTap();
              onBack();
            }}
            className="surface-control inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold text-[var(--text)]"
          >
            <ArrowLeft size={18} /> {text.back}
          </button>
          <button
            onClick={() => {
              worldSound.playButtonTap();
              onContinue("", false);
            }}
            className="consequence-primary inline-flex items-center gap-3 rounded-full px-5 py-3 font-semibold"
          >
            {text.continueJourney} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
