"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { VoiceInput } from "@/components/VoiceInput";
import { countryFlag } from "@/lib/countryFlag";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { frameQuestion } from "@/lib/questionFraming";
import { worldSound } from "@/lib/sound";
import type { Choice, GeneratedDilemma } from "@/types/world2046";
import { JourneyBadge, JourneyCard } from "@/components/ui/journey";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";

function formatPlace(dilemma: GeneratedDilemma) {
  return `${dilemma.city}, ${dilemma.country}`;
}

export function ChoiceButton({
  choice,
  index,
  onChoose,
  revealDelay = 0,
  reducedMotion = false,
}: {
  choice: Choice;
  index: number;
  onChoose: (choice: Choice) => void;
  revealDelay?: number;
  reducedMotion?: boolean | null;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.16 : 0.34, delay: reducedMotion ? 0 : revealDelay, ease: "easeOut" }}
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
    </motion.button>
  );
}

export function CustomAnswerInput({
  language,
  initialValue = "",
  initialViaVoice = false,
  onSubmit,
}: {
  language: Language;
  initialValue?: string;
  initialViaVoice?: boolean;
  onSubmit: (text: string, viaVoice: boolean) => void;
}) {
  const text = uiText[language];
  const [value, setValue] = useState(initialValue);
  const [interim, setInterim] = useState("");
  const [usedVoice, setUsedVoice] = useState(initialViaVoice);

  return (
    <div className="custom-answer-card p-3.5">
      <textarea
        value={interim ? `${value}${value ? " " : ""}${interim}` : value}
        onChange={(event) => {
          setInterim("");
          setValue(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || !value.trim()) return;
          event.preventDefault();
          worldSound.playChoiceSelect(3);
          onSubmit(value.trim(), usedVoice);
        }}
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
            setInterim("");
            setValue((current) => (current ? `${current} ${transcript}` : transcript));
          }}
          onInterim={setInterim}
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
  customAnswerDraft,
  onAnswer,
}: {
  dilemma: GeneratedDilemma;
  language: Language;
  customAnswerDraft?: { dilemmaId: string; text: string; viaVoice: boolean };
  onAnswer: (choice: Choice, customAnswer?: string, viaVoice?: boolean) => void;
}) {
  const reducedMotion = useReducedMotion();
  // No impacts here. A written answer used to score a fixed +1 trust / localControl
  // / transparency regardless of what it said, so arguing for tighter central
  // control credited you with valuing local control. It is scored from the text
  // itself at report time (see scoreWrittenAnswers) and contributes nothing until
  // then — the profile is only ever rendered in FinalReport.
  const customChoice: Choice = { id: "custom", label: language === "da" ? "Egen løsning" : "Own response", valueImpacts: {} };
  const place = formatPlace(dilemma);
  const framed = frameQuestion(dilemma);
  const spokenDilemma = [
    dilemma.title,
    dilemma.scenePrompt,
    dilemma.stake ? `${language === "da" ? "Det står på spil" : "What is at stake"}: ${dilemma.stake}` : "",
    framed.question,
    ...dilemma.choices.map((choice, index) =>
      `${language === "da" ? "Valg" : "Choice"} ${index + 1}: ${choice.label}. ${choice.description ?? ""}`,
    ),
  ].filter(Boolean).join(" ");
  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reducedMotion ? 0.16 : 0.36,
      delay: reducedMotion ? 0 : delay,
      ease: "easeOut" as const,
    },
  });
  const flag = countryFlag(dilemma.country, dilemma.region);

  return (
    <section className="relative z-20 flex h-dvh items-end justify-center px-4 py-4 pt-20 md:items-center md:justify-end md:px-8 md:py-5">
      <JourneyCard className="dilemma-briefing flex max-h-full w-full max-w-[min(620px,calc(100vw-2rem))] flex-col overflow-hidden p-5 md:p-7">
        <div className="min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
          <motion.div {...reveal(0.06)} className="dilemma-meta flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <JourneyBadge icon={<span role="img" aria-label={dilemma.country}>{flag}</span>}>{place}</JourneyBadge>
              <JourneyBadge>{uiText[language].landingYear}</JourneyBadge>
            </div>
            <TextToSpeechButton text={spokenDilemma} language={language} />
          </motion.div>

          <motion.h2 {...reveal(0.16)} className="font-editorial mt-4 text-[26px] font-semibold italic leading-tight text-[var(--text)] md:text-[32px]">
            {dilemma.title}
          </motion.h2>

          <motion.p {...reveal(0.29)} className="dilemma-scene mt-3 text-[15px] leading-6 text-[var(--muted)]">
            {dilemma.scenePrompt}
          </motion.p>

          {/* What is actually at stake for someone here. The scene says where you
              are; this says why it is worth stopping for. */}
          {dilemma.stake ? (
            <motion.div {...reveal(0.43)} className="dilemma-stake-wrap">
              <p className="dilemma-context-label">{language === "da" ? "Det står på spil" : "What is at stake"}</p>
              <p className="dilemma-stake">{dilemma.stake}</p>
            </motion.div>
          ) : null}

          <motion.div
            className="mt-5 pb-1"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.16 : 0.36, delay: reducedMotion ? 0 : 0.58, ease: "easeOut" }}
          >
            <p className="dilemma-context-label">{language === "da" ? "Dit valg" : "Your choice"}</p>
            <p className="mt-1 text-[17px] font-semibold leading-6 text-[var(--text)]">{framed.question}</p>
            <div className="mt-4 grid gap-2.5">
              {dilemma.choices.map((choice, index) => (
                <ChoiceButton
                  key={choice.id}
                  choice={choice}
                  index={index}
                  onChoose={onAnswer}
                  revealDelay={0.74 + index * 0.11}
                  reducedMotion={reducedMotion}
                />
              ))}
              <motion.div {...reveal(1.2)}>
                <CustomAnswerInput
                  language={language}
                  initialValue={customAnswerDraft?.dilemmaId === dilemma.id ? customAnswerDraft.text : ""}
                  initialViaVoice={customAnswerDraft?.dilemmaId === dilemma.id ? customAnswerDraft.viaVoice : false}
                  onSubmit={(value, viaVoice) => onAnswer(customChoice, value, viaVoice)}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </JourneyCard>
    </section>
  );
}
