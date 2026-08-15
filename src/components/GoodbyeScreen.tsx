"use client";

import type { Language } from "@/lib/i18n";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";

export function GoodbyeScreen({ language, saved, onFinish }: { language: Language; saved: boolean; onFinish: () => void }) {
  const da = language === "da";
  return <section className="relative z-20 grid min-h-dvh place-items-center px-5 py-10"><JourneyCard className="w-full max-w-xl p-8 text-center md:p-12"><h1 className="text-5xl font-semibold tracking-[-0.03em] text-[var(--text)]">{da ? "Tak for rejsen" : "Thank you for travelling"}</h1><p className="mx-auto mt-5 max-w-md text-lg leading-7 text-[var(--muted)]">{saved ? (da ? "Dine svar er gemt. De bliver en del af det samlede billede af, hvilke fremtider vi kan stå inde for." : "Your answers have been saved. They will become part of the shared picture of futures people can live with.") : (da ? "Dine svar blev ikke gemt. De forsvinder, når du afslutter." : "Your answers were not saved. They disappear when you finish.")}</p><JourneyButton type="button" onClick={onFinish} className="mx-auto mt-8" direction="forward">{da ? "Afslut og gør klar til den næste" : "Finish and reset for the next visitor"}</JourneyButton></JourneyCard></section>;
}
