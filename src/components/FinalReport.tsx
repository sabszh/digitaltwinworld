"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrbLoader } from "@/components/ui/orb-loader";
import { problemAreaLabelsByLanguage, valueLabelsByLanguage } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { getDominantValues, inferAiAttitude } from "@/lib/profileScoring";
import { worldSound } from "@/lib/sound";
import { createThermalReceipt } from "@/lib/thermalReceipt";
import type { SessionResult } from "@/types/world2046";
import { ValueProfileChart } from "./ValueProfileChart";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";

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
  error,
  language,
  onContinue,
  onRetry,
}: {
  result: SessionResult;
  loading: boolean;
  error?: string;
  language: Language;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const text = uiText[language];
  const dominant = getDominantValues(result.valueProfile, 4);
  const areas = [...new Set(result.completedDilemmas.map((item) => item.problemArea))];
  const report = result.futureReport;
  const analysisReady = Boolean(report) && !loading && !error;
  const [printState, setPrintState] = useState<"idle" | "printing" | "failed">("idle");

  // The report resolving is the end of the journey — mark it with the app's
  // lowest, longest cue rather than letting it appear in silence.
  useEffect(() => {
    if (report) worldSound.playReportReveal();
  }, [report]);

  const handlePrint = async () => {
    setPrintState("printing");
    try {
      const response = await fetch("/api/thermal-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: await createThermalReceipt(result, language) }),
      });
      if (!response.ok) throw new Error("Thermal print failed");
      setPrintState("idle");
    } catch {
      setPrintState("failed");
    }
  };

  return (
    <section className="relative z-20 h-dvh overflow-y-auto px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-6xl items-start gap-5 lg:grid-cols-[1fr_0.9fr]">

        {/* Narrative column — dossier print reveal */}
        <JourneyCard className="relative flex h-[calc(100dvh-4rem)] flex-col overflow-hidden md:h-[calc(100dvh-5rem)]">
          <div className="relative min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          {/* Watermark */}
          <div className="report-watermark" aria-hidden>
            <span className="report-watermark-text">Future Report 2046</span>
          </div>

          <Reveal delay={0}>
            <h1 className="font-editorial text-4xl font-medium text-[var(--text)] md:text-6xl">{report?.headline ?? text.reportTitle}</h1>
          </Reveal>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-300/10 p-5 text-[var(--text)]">
              <p className="font-semibold">{language === "da" ? "Rapporten kunne ikke laves." : "The report could not be created."}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{language === "da" ? "Prøv igen om et øjeblik." : "Please try again in a moment."}</p>
              <JourneyButton className="mt-4" onClick={onRetry}>{language === "da" ? "Prøv igen" : "Try again"}</JourneyButton>
            </div>
          ) : loading ? (
            <div className="mt-6">
              <OrbLoader texts={[text.reportLoadingStep1, text.reportLoadingStep2]} />
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
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportAiAttitude}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{inferAiAttitude(result.valueProfile, language)}</p></div>
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportGovernanceStyle}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.localControl >= result.valueProfile.efficiency ? text.reportGovernanceLocal : text.reportGovernanceEfficient}</p></div>
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportCollective}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.equality + result.valueProfile.humanContact >= result.valueProfile.freedom ? text.reportCollectiveFirst : text.reportIndividualFirst}</p></div>
              <div className="surface-card rounded-2xl p-4"><span className="text-[var(--faint)]">{text.reportTrustControl}</span><p className="mt-1 text-2xl font-semibold text-[var(--text)]">{result.valueProfile.trust + result.valueProfile.transparency >= result.valueProfile.safety ? text.reportTrustWithInsight : text.reportSafeControl}</p></div>
            </div>
          </Reveal>

          </div>
          {analysisReady && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="shrink-0 border-t border-[var(--line)] bg-[rgba(255,255,255,0.97)] px-6 py-4 md:px-8"
            >
              {/* Kun én vej videre herfra. "Start forfra" lod folk gå direkte til en
                  ny rejse uden nogensinde at tage stilling til, om den forrige måtte
                  gemmes — samtykkeskærmen er nu det eneste, der afslutter rejsen. */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <JourneyButton variant="secondary" disabled={printState === "printing"} onClick={() => void handlePrint()}>
                  {printState === "printing" ? (language === "da" ? "Printer…" : "Printing…") : (language === "da" ? "Print dit værdikort" : "Print your value card")}
                </JourneyButton>
                <JourneyButton className="w-full sm:w-auto" onClick={onContinue} direction="forward">{language === "da" ? "Færdiggør rejsen" : "Complete journey"}</JourneyButton>
              </div>
              {printState === "failed" && <p className="mt-2 text-xs text-[var(--muted)]">{language === "da" ? "Printeren er ikke klar endnu." : "The printer is not ready yet."}</p>}
            </motion.div>
          )}
        </JourneyCard>

        {/* Value profile column */}
        <JourneyCard className="h-[calc(100dvh-4rem)] overflow-y-auto p-6 md:h-[calc(100dvh-5rem)] md:p-8">
          <Reveal delay={STAGGER * 2}>
            <h2 className="text-2xl font-semibold text-[var(--text)]">{text.reportValueProfile}</h2>
            <div className="mt-5"><ValueProfileChart profile={result.valueProfile} language={language} /></div>
          </Reveal>
          <Reveal delay={STAGGER * 3}>
            <h3 className="mt-8 font-semibold text-[var(--text)]">{text.reportDominantValues}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {dominant.map(([key]) => <span key={key} className="rounded-full bg-[rgba(143,199,232,0.12)] px-3 py-1 text-sm font-medium text-[var(--accent)]">{valueLabelsByLanguage[language][key]}</span>)}
            </div>
          </Reveal>
          <Reveal delay={STAGGER * 4}>
            <h3 className="mt-8 font-semibold text-[var(--text)]">{text.reportSolvedDilemmas}</h3>
            <div className="mt-3 grid gap-2">
              {result.completedDilemmas.map((item, index) => (
                <div key={`${item.dilemmaId}-${index}`} className="surface-card rounded-2xl p-3 text-sm font-normal text-[var(--muted)]">
                  <p>{item.city}, {item.country}: {problemAreaLabelsByLanguage[language][item.problemArea]} · {item.selectedChoiceLabel}</p>
                  {item.reflection && <p className="mt-1 italic text-[var(--faint)]">&ldquo;{item.reflection}&rdquo;</p>}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[var(--faint)]">{text.reportProblemAreas}: {areas.map((area) => problemAreaLabelsByLanguage[language][area]).join(", ")}</p>
          </Reveal>
        </JourneyCard>

      </div>
    </section>
  );
}
