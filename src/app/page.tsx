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
import { TravelTransition } from "@/components/TravelTransition";
import { WorldGlobe } from "@/components/WorldGlobe";
import type { Language } from "@/lib/i18n";
import { useSessionStore } from "@/lib/session";
import { useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState<Language>("da");
  const store = useSessionStore();
  const result = store.getResult();
  const hasMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const zoomed = store.phase === "traveling" || store.phase === "dilemma" || store.phase === "consequence";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071016]">
      {hasMapbox ? (
        <MapboxGlobeBackdrop active={store.activeDilemma} zoomed={zoomed} />
      ) : (
        <WorldGlobe active={store.activeDilemma} zoomed={store.phase === "dilemma" || store.phase === "consequence"} />
      )}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_55%_38%,rgba(143,199,232,0.1),transparent_32%),linear-gradient(90deg,rgba(3,9,13,0.5),rgba(7,16,22,0.1)_46%,rgba(3,9,13,0.36))]" />
      {store.phase === "intro" && <LanguageToggle language={language} onChange={setLanguage} />}
      {store.phase !== "intro" && store.phase !== "role-selection" && store.phase !== "report" && <ProgressTracker completed={store.completedDilemmas.length} language={language} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={store.phase + (store.activeDilemma?.id ?? "")}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.45 }}
          className="relative z-10"
        >
          {store.phase === "intro" && <IntroScreen onStart={store.start} language={language} />}
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
