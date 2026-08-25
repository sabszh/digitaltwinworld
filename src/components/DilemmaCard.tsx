"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { VoiceInput } from "@/components/VoiceInput";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { frameQuestion } from "@/lib/questionFraming";
import { worldSound } from "@/lib/sound";
import type { Choice, GeneratedDilemma } from "@/types/world2046";
import { JourneyBadge, JourneyCard } from "@/components/ui/journey";

function formatPlace(dilemma: GeneratedDilemma) {
  return dilemma.exactPlace?.name ?? dilemma.city;
}

export function ChoiceButton({ choice, index, onChoose }: { choice: Choice; index: number; onChoose: (choice: Choice) => void }) {
  return (
    <button
      onClick={() => {
        worldSound.playChoiceSelect(index);
        onChoose(choice);
      }}
      className="decision-choice group grid grid-cols-[2.25rem_1fr] items-start gap-x-3.5 px-3.5 py-3 text-left hover:-translate-y-0.5"
    >
      <span className="tech-index grid h-9 w-9 place-items-center rounded-full border border-white/18 bg-white/[0.06] text-[var(--muted)] transition group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-5 text-[var(--text)]">{choice.label}</span>
        {choice.description && (
          <span className="mt-1 block text-[13px] leading-5 text-[var(--muted)]">{choice.description}</span>
        )}
      </span>
    </button>
  );
}

export function CustomAnswerInput({ language, onSubmit }: { language: Language; onSubmit: (text: string, viaVoice: boolean) => void }) {
  const text = uiText[language];
  const [value, setValue] = useState("");
  const [usedVoice, setUsedVoice] = useState(false);

  return (
    <div className="custom-answer-card p-3.5">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={1}
        onFocus={() => worldSound.playTextFocus()}
        placeholder={text.dilemmaCustomPlaceholder}
        className="w-full resize-none bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
      />
      <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
        <VoiceInput
          language={language}
          onTranscript={(transcript) => {
            setUsedVoice(true);
            setValue((current) => (current ? `${current} ${transcript}` : transcript));
          }}
        />
        {value.trim() && (
          <button
            onClick={() => {
              worldSound.playChoiceSelect(3);
              onSubmit(value.trim(), usedVoice);
            }}
            className="inline-flex rounded-full bg-[var(--night)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-950/20"
          >
            {text.dilemmaCustomSubmit}
          </button>
        )}
      </div>
    </div>
  );
}

export function DilemmaCard({
  dilemma,
  language,
  onAnswer,
}: {
  dilemma: GeneratedDilemma;
  language: Language;
  onAnswer: (choice: Choice, customAnswer?: string, viaVoice?: boolean) => void;
}) {
  // No impacts here. A written answer used to score a fixed +1 trust / localControl
  // / transparency regardless of what it said, so arguing for tighter central
  // control credited you with valuing local control. It is scored from the text
  // itself at report time (see scoreWrittenAnswers) and contributes nothing until
  // then — the profile is only ever rendered in FinalReport.
  const customChoice: Choice = { id: "custom", label: language === "da" ? "Egen løsning" : "Own response", valueImpacts: {} };
  const place = formatPlace(dilemma);
  const framed = frameQuestion(dilemma);

  return (
    <section className="relative z-20 flex h-dvh items-end justify-center px-4 py-4 pt-20 md:items-center md:justify-end md:px-8 md:py-5">
      <JourneyCard className="dilemma-briefing flex max-h-full w-full max-w-[min(620px,calc(100vw-2rem))] flex-col overflow-hidden p-5 md:p-7">
        <div className="min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
          <div className="dilemma-meta flex flex-wrap gap-2">
            <JourneyBadge icon={<MapPin className="h-3.5 w-3.5" aria-hidden="true" />}>{place}</JourneyBadge>
            <JourneyBadge>{uiText[language].landingYear}</JourneyBadge>
          </div>

          <h2 className="font-editorial mt-4 text-[26px] font-semibold italic leading-tight text-[var(--text)] md:text-[32px]">
            {dilemma.title}
          </h2>

          <p className="dilemma-scene mt-3 text-[15px] leading-6 text-[var(--muted)]">
            {dilemma.scenePrompt}
          </p>

          {/* What is actually at stake for someone here. The scene says where you
              are; this says why it is worth stopping for. */}
          {dilemma.stake ? (
            <div className="dilemma-stake-wrap">
              <p className="dilemma-context-label">{language === "da" ? "Det står på spil" : "What is at stake"}</p>
              <p className="dilemma-stake">{dilemma.stake}</p>
            </div>
          ) : null}

          <motion.div
            className="mt-5 pb-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <p className="dilemma-context-label">{language === "da" ? "Dit valg" : "Your choice"}</p>
            <p className="mt-1 text-[17px] font-semibold leading-6 text-[var(--text)]">{framed.question}</p>
            <div className="mt-4 grid gap-2.5">
              {dilemma.choices.map((choice, index) => (
                <ChoiceButton key={choice.id} choice={choice} index={index} onChoose={onAnswer} />
              ))}
              <CustomAnswerInput language={language} onSubmit={(value, viaVoice) => onAnswer(customChoice, value, viaVoice)} />
            </div>
          </motion.div>
        </div>
      </JourneyCard>
    </section>
  );
}
