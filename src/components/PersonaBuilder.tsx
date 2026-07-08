"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { AiLoader } from "@/components/ui/ai-loader";
import { VoiceInput } from "@/components/VoiceInput";
import type { Language } from "@/lib/i18n";
import { roleLabels, uiText } from "@/lib/i18n";
import { worldSound } from "@/lib/sound";
import type { Persona, PersonaAnswers, UserRole } from "@/types/world2046";

const visibleRoles: UserRole[] = ["Ung", "Forælder", "Lærer / pædagog", "Arbejdsgiver", "Medarbejder", "For alle"];

type FieldKey = "role" | "matters" | "hopeFear";

function TicketField({
  label,
  value,
  placeholder,
  active,
  onClick,
}: {
  label: string;
  value?: string;
  placeholder: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={`ticket-field text-left transition ${active ? "bg-[rgba(60,131,207,0.08)]" : ""}`}>
      <span className="ticket-label">{label}</span>
      <strong className={`block truncate text-[13px] font-semibold ${value ? "text-[var(--text)]" : "text-[var(--faint)]"}`}>
        {value || placeholder}
      </strong>
    </button>
  );
}

function TextFieldExpansion({
  language,
  chips,
  value,
  placeholder,
  onChange,
  onVoiceUsed,
  onDone,
}: {
  language: Language;
  chips: string[];
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
  onVoiceUsed: () => void;
  onDone: () => void;
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
                worldSound.playButtonTap();
                onChange(value ? `${value} ${chip}` : chip);
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
                worldSound.playButtonTap();
                onDone();
              }}
              className="ticket-launch rounded-full px-4 py-2 text-xs font-semibold"
            >
              {text.personaContinue}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PersonaBuilder({
  language,
  persona,
  onBuildPersona,
  onActivate,
}: {
  language: Language;
  persona?: Persona;
  onBuildPersona: (answers: PersonaAnswers) => void;
  onActivate: () => void;
}) {
  const text = uiText[language];
  const [expandedField, setExpandedField] = useState<FieldKey | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [matters, setMatters] = useState("");
  const [hopeFear, setHopeFear] = useState("");
  const [mattersViaVoice, setMattersViaVoice] = useState(false);
  const [hopeFearViaVoice, setHopeFearViaVoice] = useState(false);

  const mattersChips = text.personaMattersChips.split(",");
  const hopeFearChips = text.personaHopeFearChips.split(",");
  const canCheckIn = Boolean(role) && matters.trim().length > 0 && hopeFear.trim().length > 0;

  const toggleField = (field: FieldKey) => setExpandedField((current) => (current === field ? null : field));

  if (checkedIn) {
    return (
      <section className="relative z-20 grid min-h-screen place-items-center px-6 py-10">
        <div className="surface-panel w-full max-w-xl rounded-[1.75rem] p-6 md:p-8">
          {!persona ? (
            <div className="grid place-items-center py-10">
              <AiLoader text={text.personaBuilding} />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center justify-between">
                <span className="ticket-label">{text.personaPassenger}</span>
                <span className="ticket-label">{text.personaRoute}</span>
              </div>
              <h2 className="font-editorial mt-2 text-3xl font-semibold italic text-[var(--text)] md:text-4xl">{persona.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {persona.traits.map((trait) => (
                  <span key={trait} className="rounded-full bg-[rgba(60,131,207,0.1)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
                    {trait}
                  </span>
                ))}
              </div>
              <div className="ticket-stub">
                <span className="ticket-label">{text.personaBoardingNotes}</span>
                <p className="mt-2 text-[15px] leading-7 text-[var(--muted)]">{persona.text}</p>
              </div>
              <button
                onClick={() => {
                  worldSound.playTimeMachineCharge();
                  onActivate();
                }}
                className="ticket-launch mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold"
              >
                <Sparkles size={18} /> {text.personaBoard}
              </button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-20 grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <h2 className="font-editorial mb-5 text-center text-2xl font-semibold italic text-[var(--text)] md:text-3xl">{text.personaStepRole}</h2>
        <div className="surface-panel boarding-pass">
          <TicketField
            label={text.personaFieldTravelAs}
            value={role ? roleLabels[language][role] : undefined}
            placeholder={text.personaFieldRolePrompt}
            active={expandedField === "role"}
            onClick={() => {
              worldSound.playButtonTap();
              toggleField("role");
            }}
          />
          <TicketField
            label={text.personaFieldGoodFuture}
            value={matters || undefined}
            placeholder={text.personaFieldMattersPrompt}
            active={expandedField === "matters"}
            onClick={() => {
              worldSound.playButtonTap();
              toggleField("matters");
            }}
          />
          <TicketField
            label={text.personaFieldHopeFear}
            value={hopeFear || undefined}
            placeholder={text.personaFieldHopeFearPrompt}
            active={expandedField === "hopeFear"}
            onClick={() => {
              worldSound.playButtonTap();
              toggleField("hopeFear");
            }}
          />
          <button
            type="button"
            disabled={!canCheckIn}
            title={text.personaCheckIn}
            onClick={() => {
              if (!role || !canCheckIn) return;
              worldSound.playButtonTap();
              onBuildPersona({ role, matters, hopeFear, mattersViaVoice, hopeFearViaVoice });
              setCheckedIn(true);
            }}
            className="ticket-launch"
          >
            <ArrowRight size={20} />
          </button>

          <AnimatePresence>
            {expandedField === "role" && (
              <motion.div
                key="role"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden md:col-span-4"
              >
                <div className="grid gap-2.5 border-t border-dashed border-[var(--line)] p-4 sm:grid-cols-2 md:p-5">
                  {visibleRoles.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        worldSound.playButtonTap();
                        setRole(option);
                        setExpandedField(null);
                      }}
                      className="surface-control group grid grid-cols-[2.25rem_1fr] items-center gap-x-3.5 rounded-2xl px-4 py-3 text-left"
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
              <div key="matters" className="md:col-span-4">
                <TextFieldExpansion
                  language={language}
                  chips={mattersChips}
                  value={matters}
                  placeholder={text.personaStepMattersPlaceholder}
                  onChange={setMatters}
                  onVoiceUsed={() => setMattersViaVoice(true)}
                  onDone={() => setExpandedField(null)}
                />
              </div>
            )}

            {expandedField === "hopeFear" && (
              <div key="hopeFear" className="md:col-span-4">
                <TextFieldExpansion
                  language={language}
                  chips={hopeFearChips}
                  value={hopeFear}
                  placeholder={text.personaStepHopeFearPlaceholder}
                  onChange={setHopeFear}
                  onVoiceUsed={() => setHopeFearViaVoice(true)}
                  onDone={() => setExpandedField(null)}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
