"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe2, ShieldCheck, Star, UserRound, type LucideIcon } from "lucide-react";
import { AiLoader } from "@/components/ui/ai-loader";
import { VoiceInput } from "@/components/VoiceInput";
import type { Language } from "@/lib/i18n";
import { roleLabels, uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import { UX_TIMING } from "@/lib/uxTiming";
import type { Persona, PersonaAnswers, UserRole } from "@/types/world2046";

const visibleRoles: UserRole[] = ["Ung", "Forælder", "Lærer / pædagog", "Arbejdsgiver", "Medarbejder", "For alle"];

type FieldKey = "role" | "matters" | "hopeFear";

const timeBoardRows = [
  { flight: "WLD 2026", to: "DOKK1 / AARHUS", time: "NOW", gate: "46", status: "BOARDING" },
  { flight: "WLD 2031", to: "FREMTIDENS BYER", time: "12:18", gate: "G7", status: "SHUFFLING" },
  { flight: "WLD 2038", to: "DIGITALE HJEM", time: "14:06", gate: "H2", status: "CHECK-IN" },
  { flight: "WLD 2041", to: "INSTITUTIONER", time: "15:25", gate: "A9", status: "ON TIME" },
  { flight: "WLD 2046", to: "WORLD 2046", time: "∞", gate: "W1", status: "OPEN" },
];

const splitFlapChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/→∙";

function shuffleText(value: string, tick: number, rowIndex: number) {
  return value
    .split("")
    .map((char, charIndex) => {
      if (char === " ") return " ";
      const settled = (tick + rowIndex * 2 + charIndex) % 12 > 2;
      if (settled) return char;
      const index = (tick * 7 + rowIndex * 11 + charIndex * 5) % splitFlapChars.length;
      return splitFlapChars[index];
    })
    .join("");
}

function TimeFlowDepartureBoard({ language, loadingText }: { language: Language; loadingText: string }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((current) => current + 1), 130);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="time-flow-board" aria-label={loadingText}>
      <div className="time-flow-board-head">
        <div>
          <span>{language === "da" ? "Afgang" : "Departures"}</span>
          <strong>{language === "da" ? "Tidsrejser" : "Time departures"}</strong>
        </div>
        <time>{shuffleText("20:46", tick, 7)}</time>
      </div>
      <div className="time-flow-board-cols" aria-hidden="true">
        <span>Flight</span>
        <span>To</span>
        <span>Time</span>
        <span>Gate</span>
        <span>Status</span>
      </div>
      <div className="time-flow-board-rows">
        {timeBoardRows.map((row, index) => (
          <div className="time-flow-board-row" key={row.flight}>
            <span>{shuffleText(row.flight, tick, index)}</span>
            <strong>{shuffleText(row.to, tick + 3, index)}</strong>
            <span>{shuffleText(row.time, tick + 6, index)}</span>
            <span>{shuffleText(row.gate, tick + 9, index)}</span>
            <em>{shuffleText(row.status, tick + 12, index)}</em>
          </div>
        ))}
      </div>
      <div className="time-flow-board-status">
        <AiLoader text={loadingText} className="loader-wrapper--persona" />
      </div>
    </div>
  );
}

function TicketField({
  label,
  value,
  placeholder,
  active,
  icon: Icon,
  onClick,
}: {
  label: string;
  value?: string;
  placeholder: string;
  active: boolean;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`ticket-field text-left transition ${active ? "ticket-field--active" : ""}`}>
      <span className="ticket-field-body">
        <span className="ticket-field-icon" aria-hidden="true"><Icon /></span>
        <span className="ticket-field-copy">
          <span className="ticket-label">{label}</span>
          <strong className={`block truncate text-[13px] font-semibold ${value ? "text-[var(--text)]" : "text-[var(--faint)]"}`}>
            {value || placeholder}
          </strong>
        </span>
        {value ? <span className="ticket-field-check" aria-hidden="true">✓</span> : null}
      </span>
    </button>
  );
}

function TextFieldExpansion({
  language,
  chips,
  value,
  placeholder,
  doneLabel,
  autoAdvanceOnChip,
  onChange,
  onVoiceUsed,
  onDone,
}: {
  language: Language;
  chips: string[];
  value: string;
  placeholder: string;
  doneLabel?: string;
  autoAdvanceOnChip?: boolean;
  onChange: (text: string) => void;
  onVoiceUsed: () => void;
  onDone: (nextValue?: string) => void;
}) {
  const text = uiText[language];
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
      <div className="border-t border-dashed border-[var(--line)] p-4 md:p-5">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                worldSound.playChoiceSelect(0);
                const nextValue = value ? `${value} ${chip}` : chip;
                onChange(nextValue);
                if (autoAdvanceOnChip) {
                  window.setTimeout(() => onDone(nextValue), 160);
                }
              }}
              className="surface-control rounded-full px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)]"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="surface-card mt-3 rounded-2xl p-3.5">
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={2}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <VoiceInput
              language={language}
              onTranscript={(transcript) => {
                onVoiceUsed();
                onChange(value ? `${value} ${transcript}` : transcript);
              }}
            />
            <button
              type="button"
              onClick={() => {
                worldSound.playChoiceSelect(1);
                onDone();
              }}
              className="ticket-launch rounded-full px-4 py-2 text-xs font-semibold"
            >
              {doneLabel ?? text.personaContinue}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PersonaBuilder({
  language,
  onBuildPersona,
  onActivate,
}: {
  language: Language;
  persona?: Persona;
  onBuildPersona: (answers: PersonaAnswers) => void;
  onActivate: () => void;
}) {
  const text = uiText[language];
  const [expandedField, setExpandedField] = useState<FieldKey | null>("role");
  const [checkedIn, setCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [loadingBoardReleased, setLoadingBoardReleased] = useState(false);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [matters, setMatters] = useState("");
  const [hopeFear, setHopeFear] = useState("");
  const [mattersViaVoice, setMattersViaVoice] = useState(false);
  const [hopeFearViaVoice, setHopeFearViaVoice] = useState(false);

  const mattersChips = text.personaMattersChips.split(",");
  const hopeFearChips = text.personaHopeFearChips.split(",");
  const toggleField = (field: FieldKey) => setExpandedField((current) => (current === field ? null : field));
  const handleCheckIn = (nextHopeFear?: string) => {
    const resolvedHopeFear = nextHopeFear ?? hopeFear;
    if (!role || !matters.trim() || !resolvedHopeFear.trim()) return;
    worldSound.playPersonaCheckIn();
    setExpandedField(null);
    onBuildPersona({ role, matters, hopeFear: resolvedHopeFear, mattersViaVoice, hopeFearViaVoice });
    setIsCheckingIn(true);
    setLoadingBoardReleased(false);
    setTimeout(() => setCheckedIn(true), UX_TIMING.boardingPassSlideMs);
    setTimeout(() => {
      setLoadingBoardReleased(true);
      worldSound.playTimeMachineCharge();
      onActivate();
    }, UX_TIMING.boardingBoardMs);
  };

  if (checkedIn) {
    return (
      <motion.section
        className="relative z-20 grid min-h-screen place-items-center px-6 py-10"
        animate={{ opacity: loadingBoardReleased ? 0 : 1 }}
        transition={{ duration: 0.65, ease: [0.86, 0, 0.07, 1] }}
      >
        <div className="persona-loading-stage">
          <TimeFlowDepartureBoard language={language} loadingText={text.personaBuilding} />
        </div>
      </motion.section>
    );
  }

  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-5xl">
        {/* Boarding pass with paper check-in animation */}
        <motion.div
          className="surface-panel boarding-pass overflow-y-auto"
          initial={{ x: "130vw", rotate: 4, scale: 0.97, opacity: 0 }}
          animate={
            isCheckingIn
              ? { x: "115vw", rotate: 3.5, scale: 0.96, opacity: 0.96 }
              : { x: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{ type: "spring", stiffness: 170, damping: 26, mass: 0.9 }}
        >
          {/* ── Boarding pass header ── */}
          <div className="bp-head">
            <div className="bp-brand-lockup">
              <span className="bp-brand-copy">
                <span className="bp-brand">World 2046</span>
                <span className="bp-tagline">{language === "da" ? "Din rejse. Vores fremtid." : "Your journey. Our future."}</span>
              </span>
            </div>
            <span className="bp-ticket-meta">
              <span className="bp-pass-label">Boarding Pass</span>
              <span>Electronic ticket · WLD2046</span>
            </span>
          </div>

          <aside className="bp-stub" aria-hidden="true">
            <div>
              <span className="bp-pass-label">Boarding Pass</span>
              <p>Electronic ticket</p>
              <strong>WLD-01 / 2046</strong>
            </div>
            <div className="bp-stub-route">
              <span>From</span>
              <strong>DOKK1</strong>
              <span>To</span>
              <strong>WORLD 2046</strong>
            </div>
            <div className="bp-seat-box">
              <span>Gate</span>
              <strong>46</strong>
              <em>Zone 3</em>
            </div>
            <div className="bp-stub-divider" aria-hidden="true"><span /><Globe2 /><span /></div>
            <div className="bp-stub-code">WLD-01-2026-AAR-2046</div>
          </aside>

          {/* ── Route ── */}
          <div className="bp-route">
            <div className="bp-city-block">
              <span className="ticket-label">{language === "da" ? "Afgang" : "Departure"}</span>
              <span className="bp-code">2026</span>
              <span className="bp-city-sub">{language === "da" ? "Nutid" : "Present"}</span>
            </div>
            <span className="bp-arrow">→</span>
            <div className="bp-city-block">
              <span className="ticket-label">{language === "da" ? "Ankomst" : "Arrival"}</span>
              <span className="bp-code">2046</span>
              <span className="bp-city-sub">{language === "da" ? "Fremtid" : "Future"}</span>
            </div>
            <div className="bp-flight-info">
              <div className="bp-flight-col">
                <span className="ticket-label">{language === "da" ? "Rejse" : "Journey"}</span>
                <span className="bp-flight-val">WLD-01</span>
              </div>
            </div>
            <div className="bp-route-map" aria-hidden="true">
              <svg className="bp-route-map-svg" viewBox="0 0 240 88" focusable="false">
                <defs>
                  <pattern id="bp-map-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1.15" />
                  </pattern>
                  <linearGradient id="bp-route-gradient" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#4d91e5" />
                    <stop offset="1" stopColor="#1c5d9c" />
                  </linearGradient>
                </defs>
                <g className="bp-map-land" fill="url(#bp-map-dots)">
                  <path d="M16 25c12-12 30-15 47-7l12 11-13 10-14-4-10 10-15-7z" />
                  <path d="M58 45c11 4 19 15 16 27l-9 13-8-16-8-13z" />
                  <path d="M99 21c22-10 61-10 102 2l23 12-20 8-25-5-14 8-22-8-17 5-13-10z" />
                  <path d="M111 43l25-3 13 16-10 20-16-3-11-15z" />
                  <path d="M193 57l25-2 12 12-15 10-20-7z" />
                </g>
                <path className="bp-route-line" d="M47 62c34-38 86-46 151-36" />
                <circle className="bp-route-start" cx="47" cy="62" r="5.5" />
                <circle className="bp-route-end" cx="198" cy="26" r="5.2" />
              </svg>
            </div>
          </div>

          {/* ── Perforated tear line ── */}
          <div className="bp-tear" />

          <div className="bp-fields">
            <TicketField
              label={text.personaFieldTravelAs}
              value={role ? roleLabels[language][role] : undefined}
              placeholder={text.personaFieldRolePrompt}
              active={expandedField === "role"}
              icon={UserRound}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("role");
              }}
            />
            <TicketField
              label={text.personaFieldGoodFuture}
              value={matters || undefined}
              placeholder={text.personaFieldMattersPrompt}
              active={expandedField === "matters"}
              icon={Star}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("matters");
              }}
            />
            <TicketField
              label={text.personaFieldHopeFear}
              value={hopeFear || undefined}
              placeholder={text.personaFieldHopeFearPrompt}
              active={expandedField === "hopeFear"}
              icon={ShieldCheck}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("hopeFear");
              }}
            />

            <AnimatePresence>
              {expandedField === "role" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden md:col-span-3"
                >
                  <div className="grid gap-2 border-t border-dashed border-[var(--line)] p-3 sm:grid-cols-2 md:p-4">
                    {visibleRoles.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          worldSound.playChoiceSelect(index);
                          setRole(option);
                          setExpandedField("matters");
                        }}
                        className="surface-control group grid grid-cols-[2.25rem_1fr] items-center gap-x-3.5 px-4 py-2.5 text-left"
                      >
                        <span className="tech-index grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--control)] text-[var(--muted)] transition group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[15px] font-medium text-[var(--text)]">{roleLabels[language][option]}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {expandedField === "matters" && (
                <div key="matters" className="md:col-span-3">
                  <TextFieldExpansion
                    language={language}
                    chips={mattersChips}
                    value={matters}
                    placeholder={text.personaStepMattersPlaceholder}
                    autoAdvanceOnChip
                    onChange={setMatters}
                    onVoiceUsed={() => setMattersViaVoice(true)}
                    onDone={() => setExpandedField("hopeFear")}
                  />
                </div>
              )}

              {expandedField === "hopeFear" && (
                <div key="hopeFear" className="md:col-span-3">
                  <TextFieldExpansion
                    language={language}
                    chips={hopeFearChips}
                    value={hopeFear}
                    placeholder={text.personaStepHopeFearPlaceholder}
                    doneLabel={text.personaContinue}
                    autoAdvanceOnChip
                    onChange={setHopeFear}
                    onVoiceUsed={() => setHopeFearViaVoice(true)}
                    onDone={(nextValue) => handleCheckIn(nextValue)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
