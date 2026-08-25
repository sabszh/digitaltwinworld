import type { Choice, GeneratedDilemma, LocationType, ProblemArea, TargetGroup, UserRole } from "@/types/world2046";

export type AudienceId = "school" | "professional" | "public";

export type AudienceProfile = {
  id: AudienceId;
  day: string;
  label: string;
  promptContext: string;
  preferredProblemAreas: ProblemArea[];
  preferredLocationTypes: LocationType[];
  targetGroups: TargetGroup[];
};

const audienceProfiles: Record<AudienceId, AudienceProfile> = {
  school: {
    id: "school",
    day: "Torsdag 27. august",
    label: "Skolefokus: 4.-6. klasse, workshops og rundvisninger",
    promptContext:
      "Målgruppen er elever på 10-13 år og voksne omkring dem. Skriv konkret, nysgerrigt og trygt. Brug hverdagsord, korte sætninger, klasseværelse, frikvarter, gruppeopgaver, lærere, venskaber og følelsen af at være barn i en teknologisk hverdag. Undgå myndighedssprog, tunge abstraktioner, engelske termer og skræmmende scenarier. Brug ikke ord som triage, digital tvilling, mental health companion, companion, algoritme, infrastruktur, datadeling, resiliens, implementering, optimering, kvalitetssikret, ledsager eller dynamisk uden at omskrive dem til børnesprog.",
    preferredProblemAreas: ["Uddannelse og læring", "Digital tillid, rettigheder og styring", "Sundhed og omsorg", "Klima, energi og resiliens"],
    preferredLocationTypes: ["folkeskole", "bibliotek", "fritidsklub", "online læringsplatform", "bymidte", "hjemmet"],
    targetGroups: ["unge", "lærere", "familier"],
  },
  professional: {
    id: "professional",
    day: "Fredag 28. august",
    label: "Fagprofessionelle: offentlig digitalisering, kommuner, regioner, stat, sundhed og velfærd",
    promptContext:
      "Målgruppen er fagprofessionelle, beslutningstagere og udstillere med fokus på teknologi i offentlig sektor. Skriv med mere substans om drift, ansvar, borgere, medarbejdere, dataspor, implementering, tillid, rettigheder og velfærd. Gør dilemmaet konkret nok til en samtale mellem kommune, region, stat, leverandør og frontpersonale.",
    preferredProblemAreas: ["Sundhed og omsorg", "Digital tillid, rettigheder og styring", "Arbejde og arbejdsliv", "Mobilitet, byliv og bolig", "Klima, energi og resiliens"],
    preferredLocationTypes: ["kommune", "rådhus", "digital borgerservice", "hospital", "sundhedsklinik", "plejehjem", "kontor", "datacenter"],
    targetGroups: ["medarbejdere", "ledere", "borgere", "beslutningstagere", "ældre"],
  },
  public: {
    id: "public",
    day: "Lørdag 29. august",
    label: "For alle: børn, unge og voksne med interesse for teknologi i hverdagen",
    promptContext:
      "Målgruppen er den brede offentlighed. Skriv levende, sanseligt og let at gå til. Dilemmaet må gerne vække fascination, leg og nysgerrighed, men skal stadig føles relevant i hverdagen. Brug konkrete detaljer, som familier, børn, unge og voksne kan genkende.",
    preferredProblemAreas: ["Mobilitet, byliv og bolig", "Mad, vand og forsyning", "Digital tillid, rettigheder og styring", "Klima, energi og resiliens", "Sundhed og omsorg"],
    preferredLocationTypes: ["bymidte", "bibliotek", "supermarked", "boligområde", "togstation", "hjemmet", "social platform", "apotek"],
    targetGroups: ["borgere", "familier", "unge"],
  },
};

export function getAudienceProfile(role: UserRole): AudienceProfile {
  if (role === "Ung" || role === "Lærer / pædagog") return audienceProfiles.school;
  if (role === "For alle" || role === "Forælder") return audienceProfiles.public;
  return audienceProfiles.professional;
}

const schoolProblemLabels: Partial<Record<ProblemArea, string>> = {
  "Uddannelse og læring": "Skole og læring",
  "Sundhed og omsorg": "Sundhed og hjælp",
  "Mobilitet, byliv og bolig": "Byen og hverdagen",
  "Klima, energi og resiliens": "Klima og energi",
  "Mad, vand og forsyning": "Mad og vand",
  "Digital tillid, rettigheder og styring": "Tryghed på nettet",
};

const publicProblemLabels: Partial<Record<ProblemArea, string>> = {
  "Digital tillid, rettigheder og styring": "Digital tillid",
  "Klima, energi og resiliens": "Klima og energi",
  "Mad, vand og forsyning": "Mad og vand",
};

const danishTermRules: Array<[RegExp, string]> = [
  [/\bmental health companion(?:s)?\b/gi, "computer man kan tale med"],
  [/\bcompanion(?:s)?\b/gi, "computerhjælper"],
  [/\bmental health center\b/gi, "sundhedsklinik"],
];

const plainLanguageRules: Array<[RegExp, string]> = [
  ...danishTermRules,
  [/\bledsager(?:e|en|ne)?\b/gi, "hjælper"],
  [/\bkvalitetssikrede?\b/gi, "tjekket af voksne"],
  [/\bofficiel(?:le|t)?\b/gi, "fast"],
  [/\btidlige støtte\b/gi, "hjælp tidligt"],
  [/\banbefal(?:e|er|et)? dem bredt\b/gi, "gøre dem nemme at bruge"],
  [/\banbefal(?:e|er|et)?\b/gi, "foreslå"],
  [/\bradikalt tydelig(?:t)?\b/gi, "meget tydelig"],
  [/\bradikalt\b/gi, "meget"],
  [/\bafkode(?:r|t|de)?\b/gi, "lægge mærke til"],
  [/\bmønstre\b/gi, "vaner"],
  [/\btilgængelige\b/gi, "nemme at få fat i"],
  [/\bfællesskaber\b/gi, "andre mennesker"],
  [/\brådgivere\b/gi, "voksne man kan tale med"],
  [/\blevende netværk\b/gi, "rigtige mennesker"],
  [/\bAI-(?:hjælper|assistent|tutor|samtaleven)\b/gi, "computerhjælper"],
  [/\bAI-styret\b/gi, "computerstyret"],
  [/\bAI-ledelse\b/gi, "computerhjælp til ledelse"],
  [/\bAI-triage\b/gi, "smart kø-hjælp"],
  [/\btriage\b/gi, "at finde ud af, hvem der skal have hjælp først"],
  [/\bdigital(?:e|t)? tvilling(?:e|en)?\b/gi, "digital kopi"],
  [/\bbydigital tvilling\b/gi, "digital bykopi"],
  [/\bklimatvilling(?:en)?\b/gi, "digital klimakopi"],
  [/\bdynamisk infrastruktur\b/gi, "veje og signaler, der ændrer sig automatisk"],
  [/\binfrastruktur(?:en)?\b/gi, "byens veje, strøm og systemer"],
  [/\balgoritmisk\b/gi, "styret af en computerregel"],
  [/\balgoritme(?:n|r)?\b/gi, "computerregel"],
  [/\bdatadeling\b/gi, "at dele oplysninger"],
  [/\bdata\b/gi, "oplysninger"],
  [/\bdataspor\b/gi, "spor af oplysninger"],
  [/\bdatabrug\b/gi, "brug af oplysninger"],
  [/\bimplementering(?:en)?\b/gi, "hvordan det skal bruges i praksis"],
  [/\boptimer(?:e|er|ing|et)?\b/gi, "gøre smartere"],
  [/\bresiliens\b/gi, "at kunne klare forandringer"],
  [/\bautomation\b/gi, "automatiske maskiner"],
  [/\bautomatisering\b/gi, "når maskiner gør arbejdet selv"],
  [/\beskaler(?:e|er|es)\b/gi, "sende videre til en voksen"],
  [/\bgranular styring\b/gi, "vælge helt præcist"],
  [/\brealtid\b/gi, "lige nu"],
  [/\bmodel(?:len|ler)?\b/gi, "system"],
  [/\bAI\b/g, "computerhjælp"],
  [/\bsmart computerhjælp-hjælper(?:en)?\b/gi, "computerhjælperen"],
  [/\bcomputerhjælp-hjælper(?:en)?\b/gi, "computerhjælperen"],
  [/\bcomputerhjælp-assistent(?:en)?\b/gi, "computerhjælperen"],
  [/\bcomputerhjælp-tutor(?:en)?\b/gi, "computerhjælperen"],
  [/\bcomputerhjælp'en\b/gi, "computeren"],
  [/\bcomputerhjælp-hjælp(?:en)?\b/gi, "computerhjælp"],
  [/\bcomputerhjælp-samtalevenner\b/gi, "computere man kan tale med"],
  [/\bcomputerhjælp-samtaleven(?:nen|ner)?\b/gi, "computer man kan tale med"],
  [/\bcomputerhjælp-ledsagere\b/gi, "computerhjælpere"],
  [/\bny computerhjælperen\b/gi, "ny computerhjælper"],
];

function applyRules(text: string, rules: Array<[RegExp, string]>) {
  const rewritten = rules.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text);
  // The replacements are written lowercase, so a rule that fires on the first
  // word ("Data deles…" → "oplysninger deles…") silently decapitalises the
  // sentence. Put the original's opening case back.
  const first = text.trimStart().charAt(0);
  if (!first || first !== first.toUpperCase()) return rewritten;
  return rewritten.replace(/\p{L}/u, (letter) => letter.toUpperCase());
}

export function simplifyTextForAudience(role: UserRole, text: string) {
  const audience = getAudienceProfile(role);
  if (audience.id !== "school") return applyRules(text, danishTermRules);
  return applyRules(text, plainLanguageRules);
}

function simplifyChoice(choice: Choice, rules: Array<[RegExp, string]>): Choice {
  return {
    ...choice,
    label: applyRules(choice.label, rules),
    description: choice.description ? applyRules(choice.description, rules) : choice.description,
    consequence: choice.consequence ? applyRules(choice.consequence, rules) : choice.consequence,
  };
}

export function getAudienceProblemLabel(role: UserRole, problemArea: ProblemArea) {
  const audience = getAudienceProfile(role);
  if (audience.id === "school") return schoolProblemLabels[problemArea] ?? problemArea;
  if (audience.id === "public") return publicProblemLabels[problemArea] ?? problemArea;
  return problemArea;
}

export function tailorDilemmaCopyForAudience(dilemma: GeneratedDilemma): GeneratedDilemma {
  const audience = getAudienceProfile(dilemma.role);
  const rules = audience.id === "school" ? plainLanguageRules : danishTermRules;

  return {
    ...dilemma,
    title: applyRules(dilemma.title, rules),
    scenePrompt: applyRules(dilemma.scenePrompt, rules),
    question: applyRules(dilemma.question, rules),
    choices: dilemma.choices.map((choice) => simplifyChoice(choice, rules)),
    landingScene: dilemma.landingScene ? applyRules(dilemma.landingScene, rules) : dilemma.landingScene,
    landingDetail: dilemma.landingDetail ? applyRules(dilemma.landingDetail, rules) : dilemma.landingDetail,
  };
}
