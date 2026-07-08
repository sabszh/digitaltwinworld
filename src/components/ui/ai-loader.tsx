"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AiLoaderProps = {
  text?: string;
  texts?: string[];
  className?: string;
};

export function AiLoader({ text = "Scanner kloden", texts, className }: AiLoaderProps) {
  const phrases = texts?.length ? texts : [text];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeText = phrases[activeIndex] ?? text;

  useEffect(() => {
    if (phrases.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % phrases.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={cn("loader-wrapper", className)} role="status" aria-label={activeText} aria-live="polite">
      <span key={activeText} className="loader-text-line" aria-hidden="true">
        {activeText}
      </span>
      <div className="loader" aria-hidden="true" />
    </div>
  );
}

export const Component = AiLoader;
