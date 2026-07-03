"use client";

import { useState } from "react";
import { CalendarClock, MapPin, Mic, Sparkles, UserRound } from "lucide-react";
import type { Choice, GeneratedDilemma } from "@/types/world2046";

const rolePersona: Record<string, string> = {
  Ung: "Du er ung i 2046 og prøver at finde ud af, hvor meget af din hverdag du vil lade intelligente systemer forme.",
  Forælder: "Du er forælder i 2046 og balancerer omsorg, frihed og teknologiens løfter om at gøre hverdagen lettere.",
  "Lærer / pædagog": "Du arbejder med børn og unge i 2046, nysgerrig på nye værktøjer, men opmærksom på det menneskelige blik.",
  Arbejdsgiver: "Du leder mennesker i 2046 og skal vælge, hvor grænsen går mellem effektiv drift og ansvarlig teknologi.",
  Medarbejder: "Du er medarbejder i 2046 og mærker, hvordan automatisering både kan give ro og flytte magt væk fra mennesker.",
  Borger: "Du er borger i 2046 og møder en offentlig hverdag, hvor digitale systemer ofte er med i beslutningerne.",
  Beslutningstager: "Du er beslutningstager i 2046 og skal forme rammer, som både kan beskytte mennesker og åbne nye muligheder.",
  "For alle": "Du træder ind i 2046 som dig selv og skal mærke, hvilke fremtider du kan stå inde for.",
};

const atmosphereByArea: Record<string, string> = {
  "Uddannelse og læring": "Der er lav summen i rummet, og skærme justerer sig efter menneskene omkring dem.",
  "Arbejde og arbejdsliv": "Bygningen arbejder næsten med; systemer planlægger, måler og foreslår næste skridt.",
  "Sundhed og omsorg": "Luften er rolig, men hvert valg føles tæt på kroppen og menneskene omkring dig.",
  "Mobilitet, byliv og bolig": "Byen bevæger sig under dig, styret af data, vaner og små menneskelige afbrydelser.",
  "Klima, energi og resiliens": "Vejret ligger tungt over stedet, mens infrastrukturen forsøger at forudsige det næste pres.",
  "Mad, vand og forsyning": "Forsyningskæderne summer i baggrunden, usynlige indtil noget mangler.",
  "Digital tillid, rettigheder og styring": "Tillid er blevet noget, der designes, forhandles og testes i realtid.",
};

function formatPlace(dilemma: GeneratedDilemma) {
  return dilemma.exactPlace?.name ?? dilemma.city;
}

function buildActionQuestion(dilemma: GeneratedDilemma) {
  const actor = dilemma.role === "For alle" ? "vi" : `jeg som ${dilemma.role.toLowerCase()}`;
  return `Hvordan vil ${actor} handle i den fremtid, der tager form her?`;
}

export function ChoiceButton({ choice, index, onChoose }: { choice: Choice; index: number; onChoose: (choice: Choice) => void }) {
  return (
    <button
      onClick={() => onChoose(choice)}
      className="surface-control group grid grid-cols-[2.25rem_1fr] items-start gap-x-3.5 rounded-2xl px-3.5 py-3 text-left hover:-translate-y-0.5"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/18 bg-white/[0.06] text-sm text-[var(--muted)] transition group-hover:border-[var(--accent)] group-hover:text-[var(--text)]">
        {index + 1}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-5 text-[var(--text)]">{choice.label}</span>
        {choice.description && <span className="mt-1 block text-[13px] font-normal leading-5 text-[var(--muted)]">{choice.description}</span>}
      </span>
    </button>
  );
}

export function CustomAnswerInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="surface-card rounded-2xl p-3.5">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={1}
        placeholder="Skriv egen løsning..."
        className="w-full resize-none bg-transparent text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--faint)]"
      />
      {text.trim() && (
        <button
          onClick={() => onSubmit(text.trim())}
          className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-950/20"
        >
          Brug egen løsning
        </button>
      )}
    </div>
  );
}

export function DilemmaCard({ dilemma, onAnswer }: { dilemma: GeneratedDilemma; onAnswer: (choice: Choice, customAnswer?: string) => void }) {
  const customChoice: Choice = { id: "custom", label: "Egen løsning", valueImpacts: { trust: 1, localControl: 1, transparency: 1 } };
  const place = formatPlace(dilemma);
  const atmosphere = atmosphereByArea[dilemma.problemArea] ?? "Stedet føles både genkendeligt og fremmed, som om nutiden er blevet skruet en anelse frem.";
  const actionQuestion = buildActionQuestion(dilemma);

  return (
    <section className="relative z-20 flex h-dvh items-end justify-center px-4 py-4 pt-20 md:items-center md:justify-end md:px-8 md:py-5">
      <div className="surface-panel flex max-h-full w-full max-w-[min(560px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl p-5 md:p-5">
        <div className="min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-gutter:stable]">
          <div className="flex items-start gap-3">
            <div className="surface-card flex min-w-0 flex-1 items-start gap-3 rounded-2xl p-3.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-[var(--text)]">{place}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                  {dilemma.exactPlace?.address ?? `${dilemma.city}, ${dilemma.country}`}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[rgba(143,199,232,0.28)] bg-[rgba(143,199,232,0.1)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
              {dilemma.problemArea.split(" og ")[0]}
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/15 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                <CalendarClock className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
                2046
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/15 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                <UserRound className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
                {dilemma.role}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/15 px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
                Landing
              </span>
            </div>
            <p className="mt-4 text-[17px] font-semibold leading-6 text-[var(--text)]">Du lander i {place}, 2046.</p>
            <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">{atmosphere}</p>
            <p className="mt-3 border-l border-[var(--accent)]/50 pl-3 text-[13px] leading-5 text-[var(--muted)]">
              {rolePersona[dilemma.role]}
            </p>
          </div>

          <h2 className="mt-5 text-[26px] font-semibold leading-tight text-[var(--text)] md:text-[32px]">{dilemma.title}</h2>

          <p className="mt-4 text-[15px] font-normal leading-6 text-[var(--muted)]">{dilemma.scenePrompt}</p>

          <div className="mt-5 pb-1">
            <p className="text-[18px] font-semibold leading-6 text-[var(--text)]">{actionQuestion}</p>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-2 text-xs text-[var(--muted)]">
              <Mic className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
              <span>Vælg en vej, eller skriv med dine egne ord.</span>
            </div>
            <div className="mt-3 grid gap-2.5">
              {dilemma.choices.map((choice, index) => (
                <ChoiceButton key={choice.id} choice={choice} index={index} onChoose={onAnswer} />
              ))}
              <CustomAnswerInput onSubmit={(text) => onAnswer(customChoice, text)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
