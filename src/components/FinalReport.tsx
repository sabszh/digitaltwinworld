"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OrbLoader } from "@/components/ui/orb-loader";
import { problemAreaLabelsByLanguage, valueLabelsByLanguage } from "@/data/taxonomies";
import type { Language } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { getDominantValues, inferAiAttitude } from "@/lib/profileScoring";
import { worldSound } from "@/lib/sound";
import { createThermalReceipt } from "@/lib/thermalReceipt";
import { useEnterToContinue } from "@/lib/useEnterToContinue";
import type { SessionResult } from "@/types/world2046";
import { ValueProfileChart } from "./ValueProfileChart";
import { JourneyButton, JourneyCard } from "@/components/ui/journey";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";

const STAGGER = 0.12;
const autoPrintedSessions = new Set<string>();

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
  autoPrint = true,
  initialPrintState = "idle",
  onPrint,
}: {
  result: SessionResult;
  loading: boolean;
  error?: string;
  language: Language;
  onContinue: () => void;
  onRetry: () => void;
  autoPrint?: boolean;
  initialPrintState?: "idle" | "printing" | "printed" | "offline" | "failed";
  onPrint?: () => Promise<"printed" | "offline">;
}) {
  const text = uiText[language];
  const dominant = getDominantValues(result.valueProfile, 4);
  const areas = [...new Set(result.completedDilemmas.map((item) => item.problemArea))];
  const report = result.futureReport;
  const analysisReady = Boolean(report) && !loading && !error;
  const [printState, setPrintState] = useState<"idle" | "printing" | "printed" | "offline" | "failed">(initialPrintState);
  const spokenReport = report ? [
    report.headline,
    report.narrative,
    ...(report.patterns.length > 0
      ? [`${language === "da" ? "Mønstre" : "Patterns"}: ${report.patterns.join(". ")}`]
      : []),
  ].join(" ") : "";

  useEnterToContinue(onContinue, analysisReady);

  // The report resolving is the end of the journey — mark it with the app's
  // lowest, longest cue rather than letting it appear in silence.
  useEffect(() => {
    if (report) worldSound.playReportReveal();
  }, [report]);

  const handlePrint = useCallback(async () => {
    setPrintState("printing");
    try {
      if (onPrint) {
        setPrintState(await onPrint());
        return;
      }
      const response = await fetch("/api/thermal-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: await createThermalReceipt(result, language) }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => undefined) as { error?: string } | undefined;
        if (payload?.error === "thermal_printer_offline") {
          setPrintState("offline");
          return;
        }
        throw new Error("Thermal print failed");
      }
      setPrintState("printed");
    } catch {
      setPrintState("failed");
    }
  }, [language, onPrint, result]);

  useEffect(() => {
    if (!autoPrint || !analysisReady || autoPrintedSessions.has(result.sessionId)) return;
    const frame = window.requestAnimationFrame(() => {
      if (autoPrintedSessions.has(result.sessionId)) return;
      // Mark the session before starting the asynchronous work. This prevents a
      // second print in React Strict Mode and when returning from consent review.
      autoPrintedSessions.add(result.sessionId);
      void handlePrint();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [analysisReady, autoPrint, handlePrint, result.sessionId]);

  return (
    <section className="relative z-20 h-dvh overflow-y-auto overscroll-contain px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto grid max-w-6xl items-start gap-5 lg:grid-cols-[1fr_0.9fr]">

        {/* Narrative column — dossier print reveal */}
        <JourneyCard className="relative overflow-hidden">
          <div className="relative p-6 md:p-8">
          {/* Watermark */}
          <div className="report-watermark" aria-hidden>
            <span className="report-watermark-text">Future Report 2046</span>
          </div>

          <Reveal delay={0}>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-editorial text-4xl font-medium text-[var(--text)] md:text-6xl">{report?.headline ?? text.reportTitle}</h1>
              <TextToSpeechButton text={spokenReport} language={language} />
            </div>
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

              {report && report.patterns.length > 0 && (
                <Reveal delay={STAGGER * 2}>
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
        </JourneyCard>

        {/* Value profile column */}
        <JourneyCard className="overflow-hidden">
          <div className="p-6 md:p-8">
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
          </div>
          {analysisReady && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="border-t border-[var(--line)] bg-[rgba(255,255,255,0.97)] px-6 py-4 md:px-8"
            >
              {/* Samtykket er allerede afgjort før rapporten. Herfra afslutter
                  deltageren rejsen uden endnu et mellemtrin. */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {printState === "idle" || printState === "printing" ? (
                  <p className="flex min-h-11 items-center text-sm font-medium text-[var(--muted)]" role="status">
                    {language === "da" ? "Værdikortet sendes automatisk til printeren…" : "Your value card is being sent to the printer automatically…"}
                  </p>
                ) : (
                  <JourneyButton variant="secondary" onClick={() => void handlePrint()}>
                    {printState === "printed"
                      ? (language === "da" ? "Print igen" : "Print again")
                      : (language === "da" ? "Prøv at printe igen" : "Try printing again")}
                  </JourneyButton>
                )}
                <JourneyButton className="w-full sm:w-auto" onClick={onContinue} direction="forward">{text.endJourney}</JourneyButton>
              </div>
              {printState === "printed" && <p className="mt-2 text-xs text-[var(--muted)]" role="status">{language === "da" ? "Værdikortet er sendt til printerkøen." : "Your value card has been sent to the print queue."}</p>}
              {printState === "offline" && <p className="mt-2 text-xs text-[var(--muted)]" role="status">{language === "da" ? "Printeren er ikke forbundet. Tjek USB-forbindelsen, og prøv igen." : "The printer is not connected. Check the USB connection and try again."}</p>}
              {printState === "failed" && <p className="mt-2 text-xs text-[var(--muted)]">{language === "da" ? "Printeren er ikke klar endnu." : "The printer is not ready yet."}</p>}
            </motion.div>
          )}
        </JourneyCard>

      </div>
    </section>
  );
}
