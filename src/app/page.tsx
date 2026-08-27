"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ConsequenceCard } from "@/components/ConsequenceCard";
import { DilemmaCard } from "@/components/DilemmaCard";
import { FinalReport } from "@/components/FinalReport";
import { IntroScreen } from "@/components/IntroScreen";
import { ItineraryStrip } from "@/components/ItineraryStrip";
import { LandingScene } from "@/components/LandingScene";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MapboxGlobeBackdrop } from "@/components/MapboxGlobeBackdrop";
import { PersonaBuilder } from "@/components/PersonaBuilder";
import { ConsentScreen } from "@/components/ConsentScreen";
import { GoodbyeScreen } from "@/components/GoodbyeScreen";
import { SoundEffects } from "@/components/SoundEffects";
import { TravelTransition } from "@/components/TravelTransition";
import { WorldGlobe } from "@/components/WorldGlobe";
import { SESSION_DILEMMA_COUNT } from "@/data/taxonomies";
import { useSessionStore } from "@/lib/session";
import { worldSound } from "@/lib/sound";
import { useEffect, useRef, useState } from "react";
import type { Choice, GeneratedDilemma } from "@/types/world2046";

function getDilemmaColorTone(dilemma?: GeneratedDilemma): string {
  if (!dilemma) return "";
  const area = dilemma.problemArea ?? "";
  if (area.includes("Sundhed") || area.includes("omsorg")) return "warm";
  if (area.includes("Uddannelse")) return "warm";
  if (area.includes("Klima") || area.includes("energi") || area.includes("resiliens")) return "earth";
  if (area.includes("Digital") || area.includes("tillid") || area.includes("rettighed")) return "cold";
  if (area.includes("Arbejde")) return "industrial";
  return "cold";
}

export default function Home() {
  const store = useSessionStore();
  const language = store.language;
  const result = store.getResult();
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const zoomed = store.phase === "persona" || store.phase === "traveling" || store.phase === "landing" || store.phase === "dilemma" || store.phase === "consequence";
  const isInitialTravel = store.phase === "traveling" && !store.activeDilemma;
  const isPersona = store.phase === "persona";
  const isDarkBackdrop = isInitialTravel || isPersona;
  const isIntro = store.phase === "intro";
  const showingDestination = Boolean(store.activeDilemma) && zoomed;
  const introProgressRef = useRef(0);
  const introAnimationFrameRef = useRef<number | null>(null);
  const shouldHoldIntroGlobe =
    store.phase === "intro" ||
    store.phase === "persona" ||
    (store.phase === "traveling" && !store.activeDilemma);
  const activeIsCompleted = store.activeDilemma
    ? store.completedDilemmas.some((item) => item.dilemmaId === store.activeDilemma?.id)
    : false;
  const cities = Array.from({ length: SESSION_DILEMMA_COUNT }, (_, index) => {
    if (index < store.completedDilemmas.length) return store.completedDilemmas[index].city;
    if (index === store.completedDilemmas.length && !activeIsCompleted) return store.activeDilemma?.city;
    return undefined;
  });

  // Impact flash state (consequence reveal)
  const [showFlash, setShowFlash] = useState(false);

  const handleAnswer = (choice: Choice, customAnswer?: string, viaVoice?: boolean) => {
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
      store.answer(choice, customAnswer, viaVoice);
    }, 160);
  };

  // Mouse parallax refs for dark phases
  const starfieldRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const isParallaxPhase = store.phase === "intro" || store.phase === "persona";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!isParallaxPhase) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 7;
      if (starfieldRef.current) {
        starfieldRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate(${x * 0.55}px, ${y * 0.55}px)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [isParallaxPhase]);

  useEffect(() => {
    return () => {
      if (introAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(introAnimationFrameRef.current);
      }
    };
  }, []);

  const handleStartJourney = () => {
    if (introAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(introAnimationFrameRef.current);
    }
    introProgressRef.current = 0;
    const startedAt = performance.now();
    const transitionDuration = 900;
    const animateGlobeTransition = (now: number) => {
      const rawProgress = Math.min((now - startedAt) / transitionDuration, 1);
      // Ease the downward globe movement without making the pass arrival feel delayed.
      introProgressRef.current = 1 - Math.pow(1 - rawProgress, 3);
      if (rawProgress < 1) {
        introAnimationFrameRef.current = window.requestAnimationFrame(animateGlobeTransition);
      } else {
        introAnimationFrameRef.current = null;
      }
    };
    introAnimationFrameRef.current = window.requestAnimationFrame(animateGlobeTransition);
    void worldSound.unlock().then(() => {
      worldSound.playStartJourney();
    });
    store.start();
  };

  const dilemmaColorTone = getDilemmaColorTone(store.activeDilemma);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-black"
      data-phase={store.phase}
    >
      <SoundEffects activeDilemma={store.activeDilemma} phase={store.phase} />

      {/* Impact flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="pointer-events-none fixed inset-0 z-[500] bg-white"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          />
        )}
      </AnimatePresence>

      {hasMapbox ? (
        <MapboxGlobeBackdrop
          active={store.activeDilemma}
          zoomed={zoomed}
          introProgressRef={shouldHoldIntroGlobe ? introProgressRef : undefined}
          slowAfterIntro={isPersona}
        />
      ) : (
        <WorldGlobe
          active={store.activeDilemma}
          zoomed={store.phase === "persona" || store.phase === "landing" || store.phase === "dilemma" || store.phase === "consequence"}
          introProgressRef={shouldHoldIntroGlobe ? introProgressRef : undefined}
        />
      )}
      {isDarkBackdrop ? (
        <>
          <div
            ref={starfieldRef}
            className="bg-starfield pointer-events-none absolute inset-0 z-[1]"
            style={{ transition: "transform 0.45s ease-out" }}
          />
          <div
            ref={auroraRef}
            className="bg-aurora pointer-events-none absolute inset-0 z-[1]"
            style={{ transition: "transform 0.65s ease-out" }}
          />
        </>
      ) : isIntro || isPersona ? null : (
        <>
          <div className={`bg-sky pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700 ${showingDestination ? "opacity-0" : "opacity-100"}`} />
          <div className={`bg-cloud-band pointer-events-none z-[1] transition-opacity duration-700 ${showingDestination ? "opacity-0" : "opacity-90"}`} />
        </>
      )}
      <div
        className={`pointer-events-none absolute inset-0 z-[2] ${
          isDarkBackdrop
            ? "bg-[linear-gradient(90deg,rgba(0,0,0,0.42),rgba(0,0,0,0.04)_46%,rgba(0,0,0,0.32))]"
            : "sky-edge-vignette"
        }`}
      />
      {isDarkBackdrop ? <div className="bg-vignette pointer-events-none absolute inset-0 z-[2]" /> : null}
      <div className="sky-glow pointer-events-none absolute inset-0 z-[2]" />
      {store.phase === "intro" && <LanguageToggle language={language} onChange={store.setLanguage} />}
      <div
        className={store.phase === "intro" ? "" : "sky-scope"}
        data-tone={dilemmaColorTone || undefined}
      >
        {store.phase !== "intro" && store.phase !== "persona" && store.phase !== "report" && store.phase !== "consent" && store.phase !== "goodbye" && (
          <ItineraryStrip completed={store.completedDilemmas.length} cities={cities} language={language} />
        )}
        <AnimatePresence mode="sync">
          <motion.div
            // A destination resolves while the app is already travelling. Keeping
            // one key for that phase means the same year counter lands once,
            // instead of AnimatePresence briefly running an old and a new
            // transit window side-by-side.
            key={store.phase === "traveling" ? "traveling" : store.phase + (store.activeDilemma?.id ?? "")}
            initial={{ opacity: 0, y: store.phase === "traveling" ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: store.phase === "traveling" ? 0 : -14 }}
            transition={{ duration: 0.45 }}
            className="relative z-10"
          >
            {store.phase === "intro" && (
              <IntroScreen
                onStart={handleStartJourney}
                language={language}
              />
            )}
            {store.phase === "persona" && (
              <PersonaBuilder
                language={language}
                onCheckIn={store.checkIn}
              />
            )}
            {store.phase === "traveling" && (
              <TravelTransition
                dilemma={store.activeDilemma}
                language={language}
                isFirstTrip={store.completedDilemmas.length === 0}
                onArrive={store.enterLanding}
              />
            )}
            {store.phase === "landing" && store.activeDilemma && (
              <LandingScene dilemma={store.activeDilemma} language={language} onEnter={store.enterDilemma} />
            )}
            {store.phase === "dilemma" && store.activeDilemma && (
              <DilemmaCard dilemma={store.activeDilemma} language={language} onAnswer={handleAnswer} />
            )}
            {store.phase === "consequence" && (
              <ConsequenceCard
                choice={store.lastChoice}
                dilemma={store.activeDilemma}
                customAnswer={store.lastCustomAnswer}
                language={language}
                onBack={store.backToDilemma}
                onContinue={(reflection, viaVoice) => {
                  if (reflection) store.saveReflection(reflection, viaVoice);
                  store.continueJourney();
                }}
              />
            )}
            {store.phase === "report" && <FinalReport result={result} loading={store.reportLoading} error={store.reportError} language={language} onContinue={store.reviewConsent} onRetry={() => void store.finishJourney()} />}
            {store.phase === "consent" && <ConsentScreen language={language} status={store.consentStatus} onAccept={() => void store.saveConsentedSession()} onDecline={store.declineConsent} onBack={() => useSessionStore.setState({ phase: "report" })} />}
            {store.phase === "goodbye" && <GoodbyeScreen language={language} status={store.consentStatus === "saved" ? "saved" : "declined"} onFinish={store.restart} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
