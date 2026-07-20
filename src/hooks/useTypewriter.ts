"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 22): string {
  const [displayed, setDisplayed] = useState({ source: text, value: "" });

  useEffect(() => {
    if (!text) return;
    let index = 0;
    const id = window.setInterval(() => {
      index++;
      setDisplayed({ source: text, value: text.slice(0, index) });
      if (index >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);

  return displayed.source === text ? displayed.value : "";
}
