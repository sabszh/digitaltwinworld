"use client";

import type { Language } from "@/lib/i18n";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";

export function GoodbyeScreen({ language, status, onFinish }: { language: Language; status: "saved" | "declined"; onFinish: () => void }) {
  const da = language === "da";
  const saved = status === "saved";
  return (
    <section className="relative z-20 grid min-h-dvh place-items-center px-5 py-10">
      <JourneyCard className="w-full max-w-xl p-8 text-center md:p-12">
        <h1 className="text-5xl font-semibold tracking-[-0.03em] text-[var(--text)]">
          {saved ? (da ? "Tak for dit bidrag" : "Thank you for contributing") : (da ? "Din rejse er afsluttet" : "Your journey is complete")}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg leading-7 text-[var(--muted)]">
          {saved
            ? (da ? "Dine svar er gemt som aftalt. Tak fordi du tog stilling til fremtiden." : "Your answers have been saved as agreed. Thank you for considering the future.")
            : (da ? "Dine svar er ikke gemt." : "Your answers have not been saved.")}
        </p>
        <JourneyButton type="button" onClick={onFinish} className="mx-auto mt-8" direction="forward">
          {da ? "Start en ny rejse" : "Start a new journey"}
        </JourneyButton>
      </JourneyCard>
    </section>
  );
}
