"use client";

import { useEffect, useRef } from "react";

export function useEnterToContinue(onContinue: () => void, enabled = true) {
  const onContinueRef = useRef(onContinue);

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing
      ) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement) {
        // Buttons and links already activate on Enter. Leaving those to the
        // browser avoids firing the same action twice.
        if (target.closest("button, a, select")) return;
        if (target.isContentEditable) return;
      }

      event.preventDefault();
      onContinueRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
