import type { Persona, PersonaAnswers, UserRole } from "@/types/world2046";

export const rolePersonaText: Record<UserRole, string> = {
  Ung: "Du er ung i 2046 og prøver at finde ud af, hvor meget af din hverdag du vil lade intelligente systemer forme.",
  Forælder: "Du er forælder i 2046 og balancerer omsorg, frihed og teknologiens løfter om at gøre hverdagen lettere.",
  "Lærer / pædagog": "Du arbejder med børn og unge i 2046, nysgerrig på nye værktøjer, men opmærksom på det menneskelige blik.",
  Arbejdsgiver: "Du leder mennesker i 2046 og skal vælge, hvor grænsen går mellem effektiv drift og ansvarlig teknologi.",
  Medarbejder: "Du er medarbejder i 2046 og mærker, hvordan automatisering både kan give ro og flytte magt væk fra mennesker.",
  Borger: "Du er borger i 2046 og møder en offentlig hverdag, hvor digitale systemer ofte er med i beslutningerne.",
  Beslutningstager: "Du er beslutningstager i 2046 og skal forme rammer, som både kan beskytte mennesker og åbne nye muligheder.",
  "For alle": "Du træder ind i 2046 som dig selv og skal mærke, hvilke fremtider du kan stå inde for.",
};

const roleTitleWord: Record<UserRole, string> = {
  Ung: "unge",
  Forælder: "forælder",
  "Lærer / pædagog": "underviser",
  Arbejdsgiver: "leder",
  Medarbejder: "medarbejder",
  Borger: "borger",
  Beslutningstager: "beslutningstager",
  "For alle": "rejsende",
};

const traitKeywords: { pattern: RegExp; trait: string }[] = [
  { pattern: /menneske|kontakt|nærvær|fællesskab/i, trait: "Menneskelig" },
  { pattern: /frihed|vælge|selv|uafhængig/i, trait: "Frihedssøgende" },
  { pattern: /tryg|sikker|familie|beskytt/i, trait: "Omsorgsfuld" },
  { pattern: /tillid|stole|ærlig|gennemsigtig/i, trait: "Tillidsfuld" },
  { pattern: /retfærdig|lighed|fair/i, trait: "Retfærdighedssøgende" },
  { pattern: /natur|klima|bæredygtig|miljø/i, trait: "Bæredygtig" },
  { pattern: /teknologi|ai|robot|digital/i, trait: "Teknologinysgerrig" },
  { pattern: /magt|kontrol|styr/i, trait: "Kontrolbevidst" },
  { pattern: /privatliv|data|overvåg/i, trait: "Privatlivsbevidst" },
];

function pickTraits(text: string, fallback: string[]): string[] {
  const matches = traitKeywords.filter((entry) => entry.pattern.test(text)).map((entry) => entry.trait);
  const combined = [...new Set([...matches, ...fallback])];
  return combined.slice(0, 3);
}

export function buildLocalPersona(answers: PersonaAnswers): Persona {
  const base = rolePersonaText[answers.role];
  const roleWord = roleTitleWord[answers.role];
  const matters = answers.matters.trim();
  const hopeFear = answers.hopeFear.trim();

  const mattersSentence = matters
    ? ` For dig betyder det mest, at "${matters}".`
    : "";
  const hopeFearSentence = hopeFear
    ? ` Du bærer på tanken om, at "${hopeFear}".`
    : "";

  const text = `${base}${mattersSentence}${hopeFearSentence}`.trim();
  const traits = pickTraits(`${matters} ${hopeFear}`, ["Nysgerrig", "Eftertænksom"]);
  const title = `Den ${traits[0]?.toLowerCase() ?? "nysgerrige"} ${roleWord}`;

  return {
    role: answers.role,
    title,
    text,
    traits,
    answers,
    source: "fallback",
  };
}
