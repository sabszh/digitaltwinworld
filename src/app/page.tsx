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
    <main className="relative min-h-screen overflow-hidden bg-[#03172a]">
      {hasMapbox ? (
        <MapboxGlobeBackdrop active={store.activeDilemma} zoomed={zoomed} />
      ) : (
        <WorldGlobe active={store.activeDilemma} zoomed={store.phase === "dilemma" || store.phase === "consequence"} />
      )}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_57%_40%,rgba(80,148,190,0.1),transparent_34%),linear-gradient(90deg,rgba(2,18,34,0.66),rgba(5,44,76,0.18)_48%,rgba(2,20,38,0.58))]" />
      <LanguageToggle language={language} onChange={setLanguage} />
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
          {store.phase === "consequence" && <ConsequenceCard choice={store.lastChoice} customAnswer={store.lastCustomAnswer} onContinue={store.continueJourney} />}
          {store.phase === "report" && <FinalReport result={result} onRestart={store.restart} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
