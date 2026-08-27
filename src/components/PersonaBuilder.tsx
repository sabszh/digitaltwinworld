"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VoiceInput } from "@/components/VoiceInput";
import type { Language } from "@/lib/i18n";
import { roleLabels, uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import { UX_TIMING } from "@/lib/uxTiming";
import type { PersonaAnswers, UserRole } from "@/types/world2046";

// "Arbejdsgiver" and "Medarbejder" used to sit here as separate options, but
// both resolved to the same professional audience profile — an identical
// journey under two names. One "Fagperson" row keeps that entry point honest.
const visibleRoles: UserRole[] = ["Barn", "Ung", "Forælder", "Lærer / pædagog", "Fagperson", "For alle"];

type FieldKey = "age" | "role" | "hope" | "fear";

// Bars are derived from the serial, so the code belongs to this ticket instead of
// being a fixed texture. Real barcodes have irregular bar and gap widths — the old
// evenly repeating gradient (with a fake QR block stamped over it) read as an artifact.
function TicketBarcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    const result: { x: number; w: number }[] = [];
    let x = 0;
    let dark = true;
    while (x < 208) {
      hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
      const width = 1 + ((hash >>> 8) % 4);
      if (dark) result.push({ x, w: width });
      x += width;
      dark = !dark;
    }
    return result;
  }, [seed]);

  return (
    <svg className="bp-barcode" viewBox="0 0 208 44" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y="0" width={bar.w} height="44" />
      ))}
    </svg>
  );
}

function TicketField({
  label,
  value,
  active,
  activeHint,
  onClick,
}: {
  label: string;
  value?: string;
  active: boolean;
  activeHint: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`ticket-field text-left transition ${active ? "ticket-field--active" : ""}`}>
      <span className="ticket-field-body">
        <span className="ticket-field-copy">
          <span className="ticket-label">{label}</span>
          {/* An active empty field points to its open input below; inactive fields
              keep a blank line so the ticket never jumps when an answer lands. */}
          <strong className="block truncate text-[13px] font-semibold text-[var(--text)]">
            {value || (active ? activeHint : " ")}
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
  doneDisabled,
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
  doneDisabled?: boolean;
  autoAdvanceOnChip?: boolean;
  onChange: (text: string) => void;
  onVoiceUsed: () => void;
  onDone: (nextValue?: string) => void;
}) {
  const text = uiText[language];
  const [interim, setInterim] = useState("");
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
            value={interim ? `${value}${value ? " " : ""}${interim}` : value}
            onChange={(event) => {
              setInterim("");
              onChange(event.target.value);
            }}
            rows={2}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
          />
          {/* Mic sits on the right, next to the action it feeds — on the left it
              read as a separate control belonging to the text area above. */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <VoiceInput
              language={language}
              onTranscript={(transcript) => {
                onVoiceUsed();
                setInterim("");
                onChange(value ? `${value} ${transcript}` : transcript);
              }}
              onInterim={setInterim}
            />
            <button
              type="button"
              disabled={doneDisabled}
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
  onCheckIn,
}: {
  language: Language;
  onCheckIn: (answers: PersonaAnswers) => Promise<void>;
}) {
  const text = uiText[language];
  const activeFieldHint = language === "da" ? "Vælg eller skriv nedenfor ↓" : "Choose or write below ↓";
  const [expandedField, setExpandedField] = useState<FieldKey | null>("age");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [hope, setHope] = useState("");
  const [fear, setFear] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [hopeViaVoice, setHopeViaVoice] = useState(false);
  const [fearViaVoice, setFearViaVoice] = useState(false);
  const pendingCheckInRef = useRef<PersonaAnswers | undefined>(undefined);

  const hopeChips = text.personaHopeChips.split(",");
  const fearChips = text.personaFearChips.split(",");

  // The stub is issued as you answer: every field you fill stamps another part of
  // the ticket, so the pass becomes yours rather than staying printed decoration.
  const ticket = useMemo(() => {
    const roleIndex = role ? visibleRoles.indexOf(role) : -1;
    const filled = [age !== undefined, Boolean(role), Boolean(hope.trim()), Boolean(fear.trim())];
    const checkInReady = Boolean(role && hope.trim() && fear.trim());
    const hash = [role ?? "", hope, fear, age ?? ""]
      .join("|")
      .split("")
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);
    return {
      passenger: role ? roleLabels[language][role].toUpperCase() : null,
      seat: roleIndex >= 0 ? `${12 + roleIndex * 4}${"ABCDEF"[roleIndex]}` : null,
      zone: roleIndex >= 0 ? roleIndex + 1 : null,
      serial: checkInReady
        ? `WLD-01-2026-AAR-${String(hash).padStart(5, "0")}`
        : "WLD-01-2026-AAR-•••••",
      stamped: filled.filter(Boolean).length,
      checkInReady,
    };
  }, [role, hope, fear, age, language]);

  // One confirmation per field that gets its tick — driven off the count rather
  // than the individual setters, so typing into a field does not retrigger it.
  const stampedRef = useRef(0);
  useEffect(() => {
    if (ticket.stamped > stampedRef.current) worldSound.playFieldComplete();
    stampedRef.current = ticket.stamped;
  }, [ticket.stamped]);

  const toggleField = (field: FieldKey) => setExpandedField((current) => (current === field ? null : field));
  const handleCheckIn = async (nextFear?: string) => {
    const resolvedFear = nextFear ?? fear;
    if (!role || !hope.trim() || !resolvedFear.trim()) return;
    worldSound.playPersonaCheckIn();
    // Keep the open field in place until the ticket is off screen. Collapsing
    // it here changes the paper's aspect ratio halfway through its departure.
    setIsCheckingIn(true);
    // Do not change the app phase yet: the pass's paper CSS belongs to the
    // persona phase and must remain active until it has left the screen.
    pendingCheckInRef.current = { role, hope, fear: resolvedFear, age, hopeViaVoice, fearViaVoice };
  };

  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-4 py-10">
      {/* The shadow lives on the wrapper as a drop-shadow so it follows the pass's
          masked silhouette — the notches are real cut-outs, not painted circles. */}
      <div className="bp-shell w-full max-w-5xl">
        {/* Boarding pass with paper check-in animation */}
        <motion.div
          className={`surface-panel boarding-pass overflow-y-auto ${isCheckingIn ? "boarding-pass--departing" : ""}`}
          initial={{ x: "130vw", rotate: 4, scale: 0.97, opacity: 0 }}
          animate={
            isCheckingIn
              ? { x: "115vw", rotate: 3.5, scale: 0.96, opacity: 0.96 }
              : { x: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={isCheckingIn ? { duration: UX_TIMING.boardingPassSlideMs / 1000, ease: [0.22, 0.8, 0.3, 1] } : { type: "spring", stiffness: 170, damping: 26, mass: 0.9 }}
          onAnimationComplete={() => {
            if (!isCheckingIn) return;
            const answers = pendingCheckInRef.current;
            if (answers) void onCheckIn(answers);
          }}
        >
          {/* ── Boarding pass header ── */}
          <div className="bp-head">
            <div className="bp-brand-lockup">
              <span className="bp-brand-copy">
                <span className="bp-brand">World 2046</span>
                <span className="bp-tagline">{language === "da" ? "Din rejse. Vores fremtid." : "Your journey. Our future."}</span>
              </span>
            </div>
          </div>

          <aside className="bp-stub" aria-hidden="true">
            <div>
              <span className="bp-pass-label">Boarding Pass</span>
              <p>Electronic ticket</p>
              <strong>WLD-01 / 2046</strong>
            </div>
            <div className="bp-stub-route">
              <span>Passenger</span>
              <strong className={ticket.passenger ? "bp-stub-filled" : "bp-stub-pending"}>
                {ticket.passenger ?? "— — — — —"}
              </strong>
            </div>
            <div className="bp-seat-box">
              <span>Seat</span>
              <strong className={ticket.seat ? "bp-stub-filled" : "bp-stub-pending"}>{ticket.seat ?? "––"}</strong>
              <em>{ticket.zone ? `Zone ${ticket.zone}` : "Zone –"}</em>
            </div>
            <div className="bp-stub-code">
              <span className={ticket.checkInReady ? "bp-stub-filled" : "bp-stub-pending"}>{ticket.serial}</span>
              <TicketBarcode seed={ticket.serial} />
            </div>
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
                    <stop offset="0" stopColor="#1c5d9c" />
                    <stop offset="1" stopColor="#0b3568" />
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
              label={language === "da" ? "Din alder nu" : "Your age now"}
              value={age === undefined ? undefined : (language === "da" ? `${age} år · ${age + 20} i 2046` : `${age} · ${age + 20} in 2046`)}
              active={expandedField === "age"}
              activeHint={activeFieldHint}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("age");
              }}
            />
            <TicketField
              label={text.personaFieldRolePrompt}
              value={role ? roleLabels[language][role] : undefined}
              active={expandedField === "role"}
              activeHint={activeFieldHint}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("role");
              }}
            />
            <TicketField
              label={text.personaFieldHopePrompt}
              value={hope || undefined}
              active={expandedField === "hope"}
              activeHint={activeFieldHint}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("hope");
              }}
            />
            <TicketField
              label={text.personaFieldFearPrompt}
              value={fear || undefined}
              active={expandedField === "fear"}
              activeHint={activeFieldHint}
              onClick={() => {
                worldSound.playTextFocus();
                toggleField("fear");
              }}
            />

            <AnimatePresence>
              {expandedField === "age" && (
                <motion.div
                  key="age"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden md:col-span-4"
                >
                  <div className="flex flex-wrap items-end gap-3 border-t border-dashed border-[var(--line)] p-4 md:p-5">
                    <label className="flex items-center gap-3 text-sm font-medium text-[var(--muted)]" htmlFor="boarding-age">
                      <span>{language === "da" ? "Hvor gammel er du nu?" : "How old are you now?"}</span>
                      <input
                        id="boarding-age"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max="120"
                        autoFocus
                        value={age ?? ""}
                        onChange={(event) => {
                          const raw = event.target.value;
                          const next = Number(raw);
                          setAge(raw !== "" && Number.isInteger(next) && next >= 0 && next <= 120 ? next : undefined);
                        }}
                        placeholder="—"
                        className="surface-control w-24 rounded-xl px-3 py-2 text-lg font-semibold text-[var(--text)] outline-none"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        worldSound.playChoiceSelect(0);
                        setExpandedField("role");
                      }}
                      className="ticket-launch ml-auto rounded-full px-4 py-2 text-xs font-semibold"
                    >
                      {language === "da" ? "Fortsæt" : "Continue"}
                    </button>
                  </div>
                </motion.div>
              )}
              {expandedField === "role" && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden md:col-span-4"
                >
                  <div className="grid gap-2 border-t border-dashed border-[var(--line)] p-3 sm:grid-cols-2 md:p-4">
                    {visibleRoles.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          worldSound.playChoiceSelect(index);
                          setRole(option);
                          setExpandedField("hope");
                        }}
                        className={
                          // An odd number of roles would leave a half-empty row,
                          // so the catch-all closes the grid across both columns.
                          index === visibleRoles.length - 1 && visibleRoles.length % 2 === 1
                            ? "bp-role-option sm:col-span-2"
                            : "bp-role-option"
                        }
                        aria-pressed={role === option}
                      >
                        <span className="bp-role-seat" aria-hidden="true">
                          {`${12 + index * 4}${"ABCDEF"[index]}`}
                        </span>
                        <span className="bp-role-name">{roleLabels[language][option]}</span>
                        <span className="bp-role-class" aria-hidden="true">
                          {language === "da" ? "Vælg" : "Select"}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {expandedField === "hope" && (
                <div key="hope" className="md:col-span-4">
                  <TextFieldExpansion
                    language={language}
                    chips={hopeChips}
                    value={hope}
                    placeholder={text.personaStepHopePlaceholder}
                    autoAdvanceOnChip
                    onChange={setHope}
                    onVoiceUsed={() => setHopeViaVoice(true)}
                    onDone={() => setExpandedField("fear")}
                  />
                </div>
              )}

              {expandedField === "fear" && (
                <div key="fear" className="md:col-span-4">
                  <TextFieldExpansion
                    language={language}
                    chips={fearChips}
                    value={fear}
                    placeholder={text.personaStepFearPlaceholder}
                    doneLabel={text.personaCheckIn}
                    doneDisabled={!fear.trim()}
                    onChange={setFear}
                    onVoiceUsed={() => setFearViaVoice(true)}
                    onDone={(nextValue) => void handleCheckIn(nextValue)}
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
