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
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <p className="font-mono text-sm uppercase tracking-[0.18em] text-cyan-200/80">Din rapport</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">Din verden i 2046</h1>
          <p className="mt-6 text-xl leading-8 text-white/80">{result.generatedSummary}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.06] p-4"><span className="text-white/45">AI-holdning</span><p className="mt-1 text-2xl capitalize">{inferAiAttitude(result.valueProfile)}</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><span className="text-white/45">Styringsstil</span><p className="mt-1 text-2xl">{result.valueProfile.localControl >= result.valueProfile.efficiency ? "Lokal og forklarlig" : "Koordineret og effektiv"}</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><span className="text-white/45">Fællesskab vs. individ</span><p className="mt-1 text-2xl">{result.valueProfile.equality + result.valueProfile.humanContact >= result.valueProfile.freedom ? "Fællesskab først" : "Individets valg"}</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-4"><span className="text-white/45">Tillid vs. kontrol</span><p className="mt-1 text-2xl">{result.valueProfile.trust + result.valueProfile.transparency >= result.valueProfile.safety ? "Tillid med indblik" : "Tryg kontrol"}</p></div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={copy} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950"><Copy size={17} /> Copy summary</button>
            <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-white/18 px-5 py-3 font-semibold text-white"><RotateCcw size={17} /> Restart</button>
          </div>
        </div>
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Værdiprofil</h2>
          <div className="mt-5"><ValueProfileChart profile={result.valueProfile} /></div>
          <h3 className="mt-8 font-semibold">Dominerende værdier</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {dominant.map(([key]) => <span key={key} className="rounded-full bg-cyan-200/12 px-3 py-1 text-sm text-cyan-100">{valueLabels[key]}</span>)}
          </div>
          <h3 className="mt-8 font-semibold">Løste dilemmaer</h3>
          <div className="mt-3 grid gap-2">
            {result.completedDilemmas.map((item, index) => (
              <div key={`${item.dilemmaId}-${index}`} className="rounded-2xl bg-white/[0.045] p-3 text-sm text-white/70">
                {item.city}, {item.country}: {item.problemArea} · {item.selectedChoiceLabel}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/48">Problemområder: {areas.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
