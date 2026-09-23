"use client";

import { Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n";

export function TextToSpeechButton({ text, language }: { text: string; language: Language }) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const label = speaking
    ? (language === "da" ? "Stop oplæsning" : "Stop reading")
    : (language === "da" ? "Læs højt" : "Read aloud");

  const stop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
  };

  const toggle = () => {
    if (speaking) {
      stop();
      return;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;

    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    const targetLanguage = language === "da" ? "da-DK" : "en-GB";
    const voices = synthesis.getVoices();
    utterance.lang = targetLanguage;
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === targetLanguage.toLowerCase())
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(language))
      ?? null;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const finish = () => {
      if (utteranceRef.current !== utterance) return;
      utteranceRef.current = null;
      setSpeaking(false);
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    utteranceRef.current = utterance;
    setSpeaking(true);
    synthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      const utterance = utteranceRef.current;
      if (!utterance || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      utterance.onend = null;
      utterance.onerror = null;
      utteranceRef.current = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!text.trim()}
      aria-pressed={speaking}
      aria-label={label}
      className="surface-control inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {speaking ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      <span>{label}</span>
    </button>
  );
}
