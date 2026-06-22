"use client";

import { Copy, RotateCcw } from "lucide-react";
import { valueLabels } from "@/data/taxonomies";
import { getDominantValues, inferAiAttitude } from "@/lib/profileScoring";
import type { SessionResult } from "@/types/world2046";
import { ValueProfileChart } from "./ValueProfileChart";

export function FinalReport({ result, onRestart }: { result: SessionResult; onRestart: () => void }) {
  const dominant = getDominantValues(result.valueProfile, 4);
  const areas = [...new Set(result.completedDilemmas.map((item) => item.problemArea))];
  const copy = () => navigator.clipboard.writeText(JSON.stringify(result, null, 2));

  return (
    <section className="relative z-20 min-h-screen px-4 py-24 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-panel rounded-[2rem] p-6 md:p-8">
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--accent)]">Din rapport</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--text)] md:text-6xl">Din verden i 2046</h1>
          <p className="mt-6 text-xl font-normal leading-8 text-[var(--muted)]">{result.generatedSummary}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">AI-holdning</span><p className="mt-1 text-2xl font-semibold capitalize text-[var(--text)]">{inferAiAttitude(result.valueProfile)}</p></div>
            <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">Styringsstil</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.localControl >= result.valueProfile.efficiency ? "Lokal og forklarlig" : "Koordineret og effektiv"}</p></div>
            <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">Fællesskab vs. individ</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.equality + result.valueProfile.humanContact >= result.valueProfile.freedom ? "Fællesskab først" : "Individets valg"}</p></div>
            <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">Tillid vs. kontrol</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.trust + result.valueProfile.transparency >= result.valueProfile.safety ? "Tillid med indblik" : "Tryg kontrol"}</p></div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={copy} className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 font-semibold text-slate-950"><Copy size={17} /> Copy summary</button>
            <button onClick={onRestart} className="surface-control inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-[var(--text)]"><RotateCcw size={17} /> Restart</button>
          </div>
        </div>
        <div className="surface-panel rounded-[2rem] p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[var(--text)]">Værdiprofil</h2>
          <div className="mt-5"><ValueProfileChart profile={result.valueProfile} /></div>
          <h3 className="mt-8 font-semibold text-[var(--text)]">Dominerende værdier</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {dominant.map(([key]) => <span key={key} className="rounded-full bg-[rgba(143,199,232,0.12)] px-3 py-1 text-sm font-medium text-[var(--accent)]">{valueLabels[key]}</span>)}
          </div>
          <h3 className="mt-8 font-semibold text-[var(--text)]">Løste dilemmaer</h3>
          <div className="mt-3 grid gap-2">
            {result.completedDilemmas.map((item, index) => (
              <div key={`${item.dilemmaId}-${index}`} className="surface-card rounded-2xl p-3 text-sm font-normal text-[var(--muted)]">
                {item.city}, {item.country}: {item.problemArea} · {item.selectedChoiceLabel}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--faint)]">Problemområder: {areas.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
