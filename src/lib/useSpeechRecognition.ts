"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionErrorCode = "denied" | "no-speech" | "network" | "unknown";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const globalWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;
}

function mapError(error: string): RecognitionErrorCode {
  if (error === "not-allowed" || error === "service-not-allowed") return "denied";
  if (error === "no-speech") return "no-speech";
  if (error === "network") return "network";
  return "unknown";
}

export function useSpeechRecognition(lang: "da-DK" | "en-US") {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<RecognitionErrorCode | undefined>(undefined);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const stoppedByUserRef = useRef(true);
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time browser feature detection, not derived from React state
    setSupported(Boolean(getSpeechRecognitionConstructor()));
  }, []);

  useEffect(() => {
    return () => {
      stoppedByUserRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getSpeechRecognitionConstructor();
      if (!Ctor) return;

      onFinalRef.current = onFinal;
      setError(undefined);
      setInterim("");
      stoppedByUserRef.current = false;

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalChunk = "";
        let interimChunk = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result.isFinal) finalChunk += result[0].transcript;
          else interimChunk += result[0].transcript;
        }
        if (finalChunk.trim()) onFinalRef.current?.(finalChunk.trim());
        setInterim(interimChunk);
      };

      recognition.onerror = (event) => {
        setError(mapError(event.error));
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          stoppedByUserRef.current = true;
        }
      };

      recognition.onend = () => {
        setInterim("");
        if (stoppedByUserRef.current) {
          setListening(false);
          return;
        }
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      };

      recognitionRef.current = recognition;
      setListening(true);
      try {
        recognition.start();
      } catch {
        setListening(false);
      }
    },
    [lang],
  );

  const stop = useCallback(() => {
    stoppedByUserRef.current = true;
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  return { supported, listening, interim, error, start, stop };
}
