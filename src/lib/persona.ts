import type { Persona, PersonaAnswers, UserRole } from "@/types/world2046";
import type { Language } from "@/lib/i18n";

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

const roleLabelsEnglish: Record<UserRole, string> = {
  Ung: "young traveller",
  Forælder: "parent",
  "Lærer / pædagog": "educator",
  Arbejdsgiver: "employer",
  Medarbejder: "employee",
  Borger: "citizen",
  Beslutningstager: "decision-maker",
  "For alle": "traveller",
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

export function buildLocalPersona(answers: PersonaAnswers, language: Language = "da"): Persona {
  const base = rolePersonaText[answers.role];
  const roleWord = roleTitleWord[answers.role];
  const matters = answers.matters.trim();
  const hopeFear = answers.hopeFear.trim();

  const mattersSentence = matters
    ? language === "da" ? ` Det, du vil beskytte, er konkret: ${matters}.` : ` What you want to protect is concrete: ${matters}.`
    : "";
  const hopeFearSentence = hopeFear
    ? language === "da" ? ` På rejsen holder du samtidig øje med ${hopeFear}.` : ` Along the way, you are also watching for ${hopeFear}.`
    : "";

  const englishBase: Record<UserRole, string> = {
    Ung: "You arrive in 2046 as a young person living with decisions adults made before you had a say.",
    Forælder: "You arrive as a parent weighing convenience against the moments your family cannot get back.",
    "Lærer / pædagog": "You arrive as an educator who notices both what tools reveal and what they miss in a room full of young people.",
    Arbejdsgiver: "You arrive as an employer responsible for the people behind every efficiency gain.",
    Medarbejder: "You arrive as an employee who feels where automation removes strain—and where it moves power.",
    Borger: "You arrive as a citizen meeting public decisions in streets, clinics and screens.",
    Beslutningstager: "You arrive as a decision-maker whose rules will become somebody else's ordinary Tuesday.",
    "For alle": "You arrive as yourself, close enough to the future to notice which parts you could live with.",
  };
  const text = `${language === "da" ? base : englishBase[answers.role]}${mattersSentence}${hopeFearSentence}`.trim();
  const traits = language === "da"
    ? pickTraits(`${matters} ${hopeFear}`, ["Nysgerrig", "Eftertænksom"])
    : ["Attentive", "Reflective", "Curious"];
  const title = language === "da"
    ? `Den ${traits[0]?.toLowerCase() ?? "nysgerrige"} ${roleWord}`
    : `The attentive ${roleLabelsEnglish[answers.role]}`;

  return {
    role: answers.role,
    title,
    text,
    traits,
    answers,
    source: "fallback",
  };
}
