"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ConsequenceCard } from "@/components/ConsequenceCard";
import { DilemmaCard } from "@/components/DilemmaCard";
import { FinalReport } from "@/components/FinalReport";
import { IntroScreen } from "@/components/IntroScreen";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MapboxGlobeBackdrop } from "@/components/MapboxGlobeBackdrop";
import { ProgressTracker } from "@/components/ProgressTracker";
import { RoleSelection } from "@/components/RoleSelection";
import { SoundEffects } from "@/components/SoundEffects";
import { TravelTransition } from "@/components/TravelTransition";
import { WorldGlobe } from "@/components/WorldGlobe";
import type { Language } from "@/lib/i18n";
import { useSessionStore } from "@/lib/session";
import { worldSound } from "@/lib/sound";
import { useRef, useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState<Language>("da");
  const store = useSessionStore();
  const result = store.getResult();
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const zoomed = store.phase === "traveling" || store.phase === "dilemma" || store.phase === "consequence";
  const introProgressRef = useRef(0);
  const shouldHoldIntroGlobe =
    store.phase === "intro" ||
    store.phase === "role-selection" ||
    (store.phase === "traveling" && !store.activeDilemma);
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
          zoomed={store.phase === "dilemma" || store.phase === "consequence"}
          introProgressRef={shouldHoldIntroGlobe ? introProgressRef : undefined}
        />
      )}
      <div className="bg-starfield pointer-events-none absolute inset-0 z-[1]" />
      <div className="bg-aurora pointer-events-none absolute inset-0 z-[1]" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(0,0,0,0.42),rgba(0,0,0,0.04)_46%,rgba(0,0,0,0.32))]" />
      <div className="bg-vignette pointer-events-none absolute inset-0 z-[2]" />
      {store.phase === "intro" && <LanguageToggle language={language} onChange={setLanguage} />}
      {store.phase !== "intro" && store.phase !== "role-selection" && store.phase !== "report" && <ProgressTracker completed={store.completedDilemmas.length} language={language} />}
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
          {store.phase === "role-selection" && <RoleSelection onSelect={store.chooseRole} language={language} />}
          {store.phase === "traveling" && <TravelTransition dilemma={store.activeDilemma} language={language} />}
          {store.phase === "dilemma" && store.activeDilemma && <DilemmaCard dilemma={store.activeDilemma} onAnswer={store.answer} />}
          {store.phase === "consequence" && (
            <ConsequenceCard
              choice={store.lastChoice}
              dilemma={store.activeDilemma}
              customAnswer={store.lastCustomAnswer}
              onBack={store.backToDilemma}
              onContinue={store.continueJourney}
            />
          )}
          {store.phase === "report" && <FinalReport result={result} onRestart={store.restart} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
