"use client";

import { Mic, Square } from "lucide-react";
import { motion } from "framer-motion";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { worldSound } from "@/lib/sound";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";

export function VoiceInput({
  language,
  onTranscript,
  disabled,
}: {
  language: Language;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const text = uiText[language];
  const recognition = useSpeechRecognition(language === "da" ? "da-DK" : "en-US");

  if (!recognition.supported) return null;

  const toggle = () => {
    if (recognition.listening) {
      worldSound.playRecordTick(false);
      recognition.stop();
      return;
    }
    worldSound.playRecordTick(true);
    recognition.start((finalText) => onTranscript(finalText));
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Icon-only: the label repeated the placeholder next to it and made the
          control compete with the primary action. The accessible name carries
          the meaning instead, and a tooltip covers discoverability. */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={recognition.listening}
        aria-label={recognition.listening ? text.voiceStop : text.voiceStart}
        title={recognition.listening ? text.voiceStop : text.voiceStart}
        className={`voice-input-control relative grid h-11 w-11 shrink-0 place-items-center self-start rounded-full border transition ${
          recognition.listening
            ? "border-[var(--accent)]/60 bg-[rgba(143,199,232,0.14)] text-[var(--accent)]"
            : "border-white/12 bg-black/15 text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
        }`}
      >
        {recognition.listening && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-[var(--accent)]/50"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {recognition.listening ? <Square className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
      </button>
      {recognition.listening && recognition.interim && (
        <p className="text-xs italic text-[var(--faint)]">{recognition.interim}</p>
      )}
      {recognition.error === "denied" && <p className="text-xs text-[var(--faint)]">{text.voiceDenied}</p>}
    </div>
  );
}
