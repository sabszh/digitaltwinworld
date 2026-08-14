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
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={recognition.listening}
        className={`voice-input-control relative inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-2 text-xs font-medium transition ${
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
        {recognition.listening ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <Mic className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{recognition.listening ? text.voiceStop : text.voiceStart}</span>
      </button>
      {recognition.listening && recognition.interim && (
        <p className="text-xs italic text-[var(--faint)]">{recognition.interim}</p>
      )}
      {recognition.error === "denied" && <p className="text-xs text-[var(--faint)]">{text.voiceDenied}</p>}
    </div>
  );
}
