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
import { SoundEffects } from "@/components/SoundEffects";
import { TravelTransition } from "@/components/TravelTransition";
import { WorldGlobe } from "@/components/WorldGlobe";
import { SESSION_DILEMMA_COUNT } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import { useSessionStore } from "@/lib/session";
import { worldSound } from "@/lib/sound";
import { useRef, useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState<Language>("da");
  const store = useSessionStore();
  const result = store.getResult();
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const zoomed = store.phase === "traveling" || store.phase === "landing" || store.phase === "dilemma" || store.phase === "consequence";
  const isDarkBackdrop = store.phase === "persona";
  const isIntro = store.phase === "intro";
  const showingDestination = Boolean(store.activeDilemma) && zoomed;
  const introProgressRef = useRef(0);
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
  const handleStartJourney = () => {
    introProgressRef.current = 1;
    void worldSound.unlock().then(() => {
      worldSound.playStartJourney();
    });
    store.start();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <SoundEffects activeDilemma={store.activeDilemma} phase={store.phase} />
      {hasMapbox ? (
        <MapboxGlobeBackdrop active={store.activeDilemma} zoomed={zoomed} introProgressRef={shouldHoldIntroGlobe ? introProgressRef : undefined} />
      ) : (
        <WorldGlobe
          active={store.activeDilemma}
          zoomed={store.phase === "landing" || store.phase === "dilemma" || store.phase === "consequence"}
          introProgressRef={shouldHoldIntroGlobe ? introProgressRef : undefined}
        />
      )}
      {isDarkBackdrop ? (
        <>
          <div className="bg-starfield pointer-events-none absolute inset-0 z-[1]" />
          <div className="bg-aurora pointer-events-none absolute inset-0 z-[1]" />
        </>
      ) : isIntro ? (
        <>
          <div className="bg-sky pointer-events-none absolute inset-0 z-[1] opacity-70" />
          <div className="bg-cloud-band pointer-events-none z-[1] opacity-60" />
        </>
      ) : (
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
      {isDarkBackdrop ? (
        <div className="bg-vignette pointer-events-none absolute inset-0 z-[2]" />
      ) : (
        <div className={`sky-glow pointer-events-none absolute inset-0 z-[2] transition-opacity duration-700 ${showingDestination ? "opacity-0" : "opacity-100"}`} />
      )}
      {store.phase === "intro" && <LanguageToggle language={language} onChange={setLanguage} />}
      <div className={store.phase === "intro" ? "" : "sky-scope"}>
        {store.phase !== "intro" && store.phase !== "persona" && store.phase !== "report" && (
          <ItineraryStrip completed={store.completedDilemmas.length} cities={cities} language={language} />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={store.phase + (store.activeDilemma?.id ?? "")}
            initial={{ opacity: 0, y: store.phase === "traveling" ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: store.phase === "traveling" ? 0 : -14 }}
            transition={{ duration: 0.45 }}
            className="relative z-10"
          >
            {store.phase === "intro" && <IntroScreen onStart={handleStartJourney} language={language} introProgressRef={introProgressRef} />}
            {store.phase === "persona" && (
              <PersonaBuilder
                language={language}
                persona={store.persona}
                onBuildPersona={(answers) => void store.buildPersona(answers)}
                onActivate={() => void store.generateNext()}
              />
            )}
            {store.phase === "traveling" && (
              <TravelTransition
                dilemma={store.activeDilemma}
                persona={store.persona}
                language={language}
                isFirstTrip={store.completedDilemmas.length === 0}
              />
            )}
            {store.phase === "landing" && store.activeDilemma && (
              <LandingScene dilemma={store.activeDilemma} persona={store.persona} language={language} onEnter={store.enterDilemma} />
            )}
            {store.phase === "dilemma" && store.activeDilemma && (
              <DilemmaCard dilemma={store.activeDilemma} persona={store.persona} language={language} onAnswer={store.answer} />
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
            {store.phase === "report" && <FinalReport result={result} loading={store.reportLoading} language={language} onRestart={store.restart} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
