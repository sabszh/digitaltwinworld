"use client";

import { motion } from "framer-motion";
import { Copy, RotateCcw } from "lucide-react";
import { AiLoader } from "@/components/ui/ai-loader";
import { valueLabels } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { getDominantValues, inferAiAttitude } from "@/lib/profileScoring";
import type { SessionResult } from "@/types/world2046";
import { ValueProfileChart } from "./ValueProfileChart";

const STAGGER = 0.12;

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FinalReport({
  result,
  loading,
  language,
  onRestart,
}: {
  result: SessionResult;
  loading: boolean;
  language: Language;
  onRestart: () => void;
}) {
  const text = uiText[language];
  const dominant = getDominantValues(result.valueProfile, 4);
  const areas = [...new Set(result.completedDilemmas.map((item) => item.problemArea))];
  const report = result.futureReport;
  const copy = () => navigator.clipboard.writeText(JSON.stringify(result, null, 2));

  return (
    <section className="relative z-20 h-dvh overflow-y-auto px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-6xl items-start gap-5 lg:grid-cols-[1fr_0.9fr]">

        {/* Narrative column — dossier print reveal */}
        <div className="surface-panel relative max-h-[calc(100dvh-4rem)] overflow-y-auto p-6 md:max-h-[calc(100dvh-5rem)] md:p-8">
          {/* Watermark */}
          <div className="report-watermark" aria-hidden>
            <span className="report-watermark-text">Future Report 2046</span>
          </div>

          <Reveal delay={0}>
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--accent)]">{text.reportKicker}</p>
            <h1 className="font-editorial mt-3 text-4xl font-semibold italic text-[var(--text)] md:text-6xl">{report?.headline ?? text.reportTitle}</h1>
          </Reveal>

          {loading ? (
            <div className="mt-6 grid place-items-start">
              <AiLoader texts={[text.reportLoadingStep1, text.reportLoadingStep2]} />
            </div>
          ) : (
            <>
              <Reveal delay={STAGGER}>
                <p className="mt-6 text-xl font-normal leading-8 text-[var(--muted)]">{report?.narrative ?? result.generatedSummary}</p>
              </Reveal>

              {report && report.quotes.length > 0 && (
                <Reveal delay={STAGGER * 2}>
                  <div className="mt-6 grid gap-3">
                    <h3 className="font-semibold text-[var(--text)]">{text.reportQuotes}</h3>
                    {report.quotes.map((item, index) => (
                      <blockquote key={index} className="border-l-2 border-[var(--accent)] pl-4">
                        <p className="italic leading-6 text-[var(--text)]">&ldquo;{item.quote}&rdquo;</p>
                        <cite className="mt-1 block text-xs not-italic text-[var(--faint)]">— {item.context}</cite>
                      </blockquote>
                    ))}
                  </div>
                </Reveal>
              )}

              {report && report.patterns.length > 0 && (
                <Reveal delay={STAGGER * 3}>
                  <div className="mt-6">
                    <h3 className="font-semibold text-[var(--text)]">{text.reportPatterns}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.patterns.map((pattern) => (
                        <span key={pattern} className="rounded-full bg-[rgba(242,200,121,0.12)] px-3 py-1 text-sm font-medium text-[var(--accent-warm)]">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}
            </>
          )}

          <Reveal delay={STAGGER * 4}>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportAiAttitude}</span><p className="mt-1 text-2xl font-semibold capitalize text-[var(--text)]">{inferAiAttitude(result.valueProfile)}</p></div>
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportGovernanceStyle}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.localControl >= result.valueProfile.efficiency ? text.reportGovernanceLocal : text.reportGovernanceEfficient}</p></div>
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportCollective}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.equality + result.valueProfile.humanContact >= result.valueProfile.freedom ? text.reportCollectiveFirst : text.reportIndividualFirst}</p></div>
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportTrustControl}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.trust + result.valueProfile.transparency >= result.valueProfile.safety ? text.reportTrustWithInsight : text.reportSafeControl}</p></div>
            </div>
          </Reveal>

          <Reveal delay={STAGGER * 5}>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={copy} className="report-primary inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold"><Copy size={17} /> {text.reportCopySummary}</button>
              <button onClick={onRestart} className="surface-control inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold text-[var(--text)]"><RotateCcw size={17} /> {text.reportRestart}</button>
            </div>
          </Reveal>
        </div>

        {/* Value profile column */}
        <div className="surface-panel max-h-[calc(100dvh-4rem)] overflow-y-auto p-6 md:max-h-[calc(100dvh-5rem)] md:p-8">
          <Reveal delay={STAGGER * 2}>
            <h2 className="text-2xl font-semibold text-[var(--text)]">{text.reportValueProfile}</h2>
            <div className="mt-5"><ValueProfileChart profile={result.valueProfile} /></div>
          </Reveal>
          <Reveal delay={STAGGER * 3}>
            <h3 className="mt-8 font-semibold text-[var(--text)]">{text.reportDominantValues}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {dominant.map(([key]) => <span key={key} className="rounded-full bg-[rgba(143,199,232,0.12)] px-3 py-1 text-sm font-medium text-[var(--accent)]">{valueLabels[key]}</span>)}
            </div>
          </Reveal>
          <Reveal delay={STAGGER * 4}>
            <h3 className="mt-8 font-semibold text-[var(--text)]">{text.reportSolvedDilemmas}</h3>
            <div className="mt-3 grid gap-2">
              {result.completedDilemmas.map((item, index) => (
                <div key={`${item.dilemmaId}-${index}`} className="surface-card rounded-2xl p-3 text-sm font-normal text-[var(--muted)]">
                  <p>{item.city}, {item.country}: {item.problemArea} · {item.selectedChoiceLabel}</p>
                  {item.reflection && <p className="mt-1 italic text-[var(--faint)]">&ldquo;{item.reflection}&rdquo;</p>}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[var(--faint)]">{text.reportProblemAreas}: {areas.join(", ")}</p>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
