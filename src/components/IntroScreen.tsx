"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CalendarDays, MapPin, Plane, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { UX_TIMING } from "@/lib/uxTiming";

export function IntroScreen({
  onStart,
  language,
  introProgressRef,
}: {
  onStart: () => void;
  language: Language;
  introProgressRef?: React.MutableRefObject<number>;
}) {
  const text = uiText[language];
  const scrollRef = useRef<HTMLDivElement>(null);
  const readySectionRef = useRef<HTMLElement>(null);
  const autoLaunchTimeoutRef = useRef<number | null>(null);
  const autoPressTimeoutRef = useRef<number | null>(null);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const [readyToLaunch, setReadyToLaunch] = useState(false);
  const [isAutoLaunching, setIsAutoLaunching] = useState(false);
  const [isAutoPressingStart, setIsAutoPressingStart] = useState(false);
  const wasReadyRef = useRef(false);

  const { scrollYProgress } = useScroll({ container: scrollRef });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    // Update introProgressRef directly — no re-render
    if (introProgressRef) introProgressRef.current = value;

    // Only trigger a re-render when crossing the launch threshold
    const ready = value > 0.88;
    if (ready !== wasReadyRef.current) {
      wasReadyRef.current = ready;
      setReadyToLaunch(ready);
    }
  });

  useEffect(() => {
    return () => {
      if (autoLaunchTimeoutRef.current) window.clearTimeout(autoLaunchTimeoutRef.current);
      if (autoPressTimeoutRef.current) window.clearTimeout(autoPressTimeoutRef.current);
      if (scrollAnimationFrameRef.current) window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    };
  }, []);

  const launchFromSearch = () => {
    if (isAutoLaunching) return;
    setIsAutoLaunching(true);
    const container = scrollRef.current;
    const readySection = readySectionRef.current;
    if (container && readySection) {
      const startTop = container.scrollTop;
      const targetTop = readySection.offsetTop;
      const startedAt = performance.now();
      const duration = UX_TIMING.searchScrollMs;
      const easeInOutCubic = (value: number) =>
        value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

      if (scrollAnimationFrameRef.current) window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      const animateScroll = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        container.scrollTop = startTop + (targetTop - startTop) * easeInOutCubic(progress);
        if (progress < 1) {
          scrollAnimationFrameRef.current = window.requestAnimationFrame(animateScroll);
        }
      };
      scrollAnimationFrameRef.current = window.requestAnimationFrame(animateScroll);
    }
    if (autoLaunchTimeoutRef.current) window.clearTimeout(autoLaunchTimeoutRef.current);
    if (autoPressTimeoutRef.current) window.clearTimeout(autoPressTimeoutRef.current);
    autoPressTimeoutRef.current = window.setTimeout(() => {
      setIsAutoPressingStart(true);
    }, UX_TIMING.searchAutoPressDelayMs);
    autoLaunchTimeoutRef.current = window.setTimeout(() => {
      onStart();
    }, UX_TIMING.searchAutoStartDelayMs);
  };

  return (
    <div ref={scrollRef} className="relative z-20 h-screen overflow-y-auto overflow-x-hidden">
      {/* Section 1 — hero */}
      <section className="intro-hero relative flex h-screen flex-col items-center justify-center px-6">
        <h1 className="horizon-title">
          <span>World</span>
          <em>2046</em>
        </h1>
        <div className="hero-flight-panel" aria-label={language === "da" ? "Rejseoversigt" : "Journey overview"}>
          <div className="hero-flight-fields">
            <div className="hero-flight-field">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Hvorfra" : "From"}</span>
              <strong>Dokk1, Aarhus</strong>
            </div>
            <div className="hero-flight-field">
              <Plane className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Hvorhen" : "To"}</span>
              <strong>World 2046</strong>
            </div>
            <div className="hero-flight-field">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Hvornår" : "When"}</span>
              <strong>{language === "da" ? "Nu → fremtid" : "Now → future"}</strong>
            </div>
            <div className="hero-flight-field">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{language === "da" ? "Personer" : "People"}</span>
              <strong>1</strong>
            </div>
            <button
              type="button"
              className={`hero-flight-search ${isAutoLaunching ? "hero-flight-search--launching" : ""}`}
              onClick={launchFromSearch}
              disabled={isAutoLaunching}
              aria-label={language === "da" ? "Find gate" : "Find gate"}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 — build-up */}
      <section className="intro-message-section relative flex flex-col items-center px-6">
        <div className="intro-message-copy max-w-2xl">
          <p className="horizon-lead">{text.introSectionTwoLine1}</p>
          <p className="horizon-subtitle-line">{text.introSectionTwoLine2}</p>
        </div>
      </section>

      {/* Section 3 — ready */}
      <section ref={readySectionRef} className="relative flex h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={false}
          animate={{
            opacity: readyToLaunch ? 1 : 0,
            y: readyToLaunch ? 0 : 24,
            scale: isAutoPressingStart ? 0.94 : 1,
          }}
          transition={{
            opacity: { duration: 0.5, ease: "easeOut" },
            y: { duration: 0.5, ease: "easeOut" },
            scale: { duration: 0.18, ease: "easeInOut" },
          }}
          className="flex flex-col items-center"
          style={{ pointerEvents: readyToLaunch ? "auto" : "none" }}
        >
          <button
            type="button"
            onClick={onStart}
            className={`horizon-cta horizon-cta--final ${isAutoPressingStart ? "horizon-cta--auto-press" : ""}`}
          >
            <span>{text.startJourney}</span>
          </button>
        </motion.div>
      </section>

    </div>
  );
}
