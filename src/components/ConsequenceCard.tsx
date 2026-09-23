"use client";

import { motion } from "framer-motion";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import { useEnterToContinue } from "@/lib/useEnterToContinue";
import type { Choice, GeneratedDilemma } from "@/types/world2046";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";

export function ConsequenceCard({
  choice,
  dilemma,
  customAnswer,
  language,
  isFinalStop = false,
  onBack,
  onContinue,
}: {
  choice?: Choice;
  dilemma?: GeneratedDilemma;
  customAnswer?: string;
  language: Language;
  isFinalStop?: boolean;
  onBack: () => void;
  onContinue: (reflection: string, viaVoice: boolean) => void;
}) {
  const text = uiText[language];
  const place = dilemma?.exactPlace?.name ?? dilemma?.locationType ?? "stedet";

  const continueJourney = () => {
    worldSound.playButtonTap();
    onContinue("", false);
  };

  useEnterToContinue(continueJourney);

  const consequenceText = customAnswer
    ? language === "da" ? `Dit valg ændrer, hvem der får indflydelse på ${place}, og hvem der må leve med usikkerheden.` : `Your choice changes who has influence at ${place}, and who must live with the uncertainty.`
    : choice?.consequence
      ? choice.consequence.split(".")[0] + "."
    : choice
      ? language === "da" ? `${choice.label} ændrer, hvem der får sin vilje lige nu.` : `${choice.label} changes who gets their way right now.`
      : language === "da" ? "Dit valg ændrer, hvem der bærer ansvaret." : "Your choice changes who carries the responsibility.";

  return (
    // Desaturation reveal: enters desaturated, floods back to full colour
    <motion.section
      className="relative z-20 grid min-h-screen place-items-center px-6 py-10"
      initial={{ filter: "saturate(0.12)" }}
      animate={{ filter: "saturate(1)" }}
      transition={{ duration: 1.0, ease: "easeOut" }}
    >
      <JourneyCard className="consequence-card max-w-xl p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-[-0.025em] text-[var(--text)]">{customAnswer ? text.consequenceOwnPath : choice?.label}</h2>
          <TextToSpeechButton
            text={`${customAnswer ? text.consequenceOwnPath : choice?.label ?? ""}. ${consequenceText}`}
            language={language}
          />
        </div>
        <p className="mt-5 text-lg font-normal leading-7 text-[var(--muted)]">{consequenceText}</p>

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <JourneyButton
            onClick={() => {
              worldSound.playButtonTap();
              onBack();
            }}
            variant="secondary"
            direction="back"
          >
            {text.back}
          </JourneyButton>
          <JourneyButton
            onClick={continueJourney}
            variant="primary"
            direction="forward"
          >
            {isFinalStop
              ? text.endJourney
              : text.continueJourney}
          </JourneyButton>
        </div>
      </JourneyCard>
    </motion.section>
  );
}
