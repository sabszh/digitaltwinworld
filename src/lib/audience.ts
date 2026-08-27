import type { LocationType, ProblemArea, TargetGroup, UserRole } from "@/types/world2046";

export type AudienceId = "child" | "youth" | "professional" | "public";

export type AudienceProfile = {
  id: AudienceId;
  label: string;
  promptContext: string;
  preferredProblemAreas: ProblemArea[];
  preferredLocationTypes: LocationType[];
  targetGroups: TargetGroup[];
};

const audienceProfiles: Record<AudienceId, AudienceProfile> = {
  child: {
    id: "child",
    label: "Børn: konkrete hverdagsvalg i øjenhøjde",
    promptContext:
      "Målgruppen er børn ca. 7-11 år. Skriv varmt, meget konkret og trygt med korte sætninger. Brug skole, venner, familie, lege, fritid og ting, man kan se, høre eller mærke. Forklar teknologien gennem en hverdagsfølge: hvem der får varme, hvem der venter, hvad der slukker, eller hvem der får hjælp. Brug aldrig abstrakte formuleringer som 'konstant beregning', 'kvartersniveau' eller 'driftsspørgsmål'. Undgå myndighedssprog, fagord, engelske termer og skræmmende scenarier.",
    preferredProblemAreas: ["Uddannelse og læring", "Digital tillid, rettigheder og styring", "Sundhed og omsorg", "Klima, energi og resiliens", "Mobilitet, byliv og bolig", "Mad, vand og forsyning"],
    preferredLocationTypes: ["folkeskole", "bibliotek", "fritidsklub", "online læringsplatform", "bymidte", "hjemmet", "boligområde", "hospital", "sundhedsklinik", "apotek", "social platform", "togstation", "supermarked", "gård"],
    targetGroups: ["unge", "lærere", "familier"],
  },
  youth: {
    id: "youth",
    label: "Unge: konkrete valg med plads til selvstændighed",
    promptContext:
      "Målgruppen er unge ca. 12-17 år. Skriv direkte og konkret med respekt for deres selvstændighed. Brug skole, venner, fritid, familie, transport og online liv. Forklar teknologi gennem det, man faktisk mærker i hverdagen, og undgå bureaukratiske ord og abstrakte policy-spørgsmål.",
    preferredProblemAreas: ["Uddannelse og læring", "Digital tillid, rettigheder og styring", "Sundhed og omsorg", "Klima, energi og resiliens", "Mobilitet, byliv og bolig", "Arbejde og arbejdsliv"],
    preferredLocationTypes: ["folkeskole", "gymnasium", "bibliotek", "fritidsklub", "bymidte", "hjemmet", "boligområde", "togstation", "social platform", "kontor", "platformarbejdsplads"],
    targetGroups: ["unge", "lærere", "familier"],
  },
  professional: {
    id: "professional",
    label: "Fagprofessionelle: offentlig digitalisering, kommuner, regioner, stat, sundhed og velfærd",
    promptContext:
      "Målgruppen er fagprofessionelle, beslutningstagere og udstillere med fokus på teknologi i offentlig sektor. Skriv med mere substans om drift, ansvar, borgere, medarbejdere, dataspor, implementering, tillid, rettigheder og velfærd. Gør dilemmaet konkret nok til en samtale mellem kommune, region, stat, leverandør og frontpersonale.",
    preferredProblemAreas: ["Sundhed og omsorg", "Digital tillid, rettigheder og styring", "Arbejde og arbejdsliv", "Mobilitet, byliv og bolig", "Klima, energi og resiliens"],
    preferredLocationTypes: ["kommune", "rådhus", "digital borgerservice", "hospital", "sundhedsklinik", "plejehjem", "kontor", "datacenter"],
    targetGroups: ["medarbejdere", "ledere", "borgere", "beslutningstagere", "ældre"],
  },
  public: {
    id: "public",
    label: "For alle: børn, unge og voksne med interesse for teknologi i hverdagen",
    promptContext:
      "Målgruppen er den brede offentlighed. Skriv levende, sanseligt og let at gå til. Dilemmaet må gerne vække fascination, leg og nysgerrighed, men skal stadig føles relevant i hverdagen. Brug konkrete detaljer, som familier, børn, unge og voksne kan genkende.",
    preferredProblemAreas: ["Mobilitet, byliv og bolig", "Mad, vand og forsyning", "Digital tillid, rettigheder og styring", "Klima, energi og resiliens", "Sundhed og omsorg"],
    preferredLocationTypes: ["bymidte", "bibliotek", "supermarked", "boligområde", "togstation", "hjemmet", "social platform", "apotek"],
    targetGroups: ["borgere", "familier", "unge"],
  },
};

export function getAudienceProfile(role: UserRole): AudienceProfile {
  if (role === "Barn") return audienceProfiles.child;
  if (role === "Ung") return audienceProfiles.youth;
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

export function getAudienceProblemLabel(role: UserRole, problemArea: ProblemArea) {
  const audience = getAudienceProfile(role);
  if (audience.id === "child" || audience.id === "youth") return schoolProblemLabels[problemArea] ?? problemArea;
  if (audience.id === "public") return publicProblemLabels[problemArea] ?? problemArea;
  return problemArea;
}
