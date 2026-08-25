"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Shrinks a headline just enough that no single word overflows its box.
 *
 * Place names in this app are long Danish compounds ("Katrinebjergskolen") that
 * cannot break at a space. Two approaches were tried and rejected first:
 * hyphenation (the browser dictionary splits compounds in meaningless places,
 * e.g. "Katrineb-jergskolen") and overflow-wrap alone (breaks mid-word with no
 * hyphen at all, e.g. "Katrinebjergskol/en"). Scaling the type keeps every break
 * on a real word boundary.
 *
 * Measuring has to happen with overflow-wrap disabled: while it is active the
 * word is broken rather than overflowing, so the overflow this loop looks for
 * never appears and the headline silently stays at full size.
 */
export function useFitHeadline<T extends HTMLElement>(text: string, minScale = 0.55) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.style.fontSize = "";
    element.style.overflowWrap = "normal";
    element.style.wordBreak = "normal";

    const basePx = parseFloat(window.getComputedStyle(element).fontSize);
    if (!basePx) return;

    const floor = basePx * minScale;
    let size = basePx;

    while (element.scrollWidth > element.clientWidth + 1 && size > floor) {
      size -= 1;
      element.style.fontSize = `${size}px`;
    }

    // Only if shrinking still cannot contain it do we allow a hard break — better
    // an awkward break than a name clipped off by the card's hidden overflow.
    element.style.overflowWrap = element.scrollWidth > element.clientWidth + 1 ? "break-word" : "normal";

    return () => {
      element.style.fontSize = "";
      element.style.overflowWrap = "";
      element.style.wordBreak = "";
    };
  }, [text, minScale]);

  return ref;
}
