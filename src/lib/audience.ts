import type { LocationType, ProblemArea, TargetGroup, UserRole } from "@/types/world2046";

export type AudienceId = "child" | "youth" | "professional" | "public";

export type AudienceProfile = {
  id: AudienceId;
  label: string;
  promptContext: string;
  preferredProblemAreas: ProblemArea[];
  preferredLocationTypes: LocationType[];
  targetGroups: TargetGroup[];
  agencyExamples: string[];
  relationshipTypes: string[];
  relevantStakes: string[];
  naturalContexts: string[];
  forbiddenResponsibilities: string[];
  complexityGuidance: string;
};

type BaseAudienceProfile = Omit<AudienceProfile,
  "agencyExamples" | "relationshipTypes" | "relevantStakes" | "naturalContexts" |
  "forbiddenResponsibilities" | "complexityGuidance"
>;

type RolePerspective = Pick<AudienceProfile,
  "agencyExamples" | "relationshipTypes" | "relevantStakes" | "naturalContexts" |
  "forbiddenResponsibilities" | "complexityGuidance"
>;

const audienceProfiles: Record<AudienceId, BaseAudienceProfile> = {
  child: {
    id: "child",
    label: "Børn: konkrete hverdagsvalg i øjenhøjde",
    promptContext:
      "Målgruppen er børn ca. 7-11 år. Barnet skal forstå hele situationen ved første gennemlæsning. Brug kun en hverdag, barnet selv kender: en skoletime, en ven, en leg, en fritidsaktivitet, en tur, aftensmad eller noget der sker hjemme. Lad en computer, robot eller smart ting gøre én tydelig ting, eller lad ændret vejr, varme, vand, strøm, mad eller natur ændre dagens plan. Vis fremtiden gennem det, barnet ser ske; forklar ikke systemet bag. Barnet vælger kun, hvad det selv gør eller siger lige nu. Korte ord. Korte sætninger. Ét problem. Ingen myndigheder, sygdomsbehandling, budgetter, adgangsordninger, voksent ansvar, fagord, engelske termer eller skræmmende scenarier.",
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

const rolePerspectives: Record<UserRole, RolePerspective> = {
  Barn: {
    agencyExamples: ["sige ja eller nej", "fortælle eller holde noget tilbage", "bruge eller afvise noget", "tage imod eller afvise hjælp", "holde eller bryde et løfte"],
    relationshipTypes: ["ven", "søskende", "forælder", "lærer eller pædagog"],
    relevantStakes: ["et venskab", "egen krop og private oplysninger", "muligheden for selv at vælge", "en fremtidig mulighed", "at høre til i en gruppe", "tillid fra en anden"],
    naturalContexts: ["skole", "hjem", "fritidsaktivitet", "transport", "online fællesskab", "egen sundhed"],
    forbiddenResponsibilities: ["ændre skolens regler", "fordele offentlige midler", "bestemme over andre børn", "vælge andres behandling", "regulere en virksomhed"],
    complexityGuidance: "Brug korte, kendte ord og én årsag pr. sætning. Bevar det store spørgsmål om autonomi, klima, identitet, sundhed eller retfærdighed.",
  },
  Ung: {
    agencyExamples: ["acceptere eller afvise et tilbud", "dele eller beskytte egne oplysninger", "stå ved eller skjule en handling", "vælge en uddannelses- eller fællesskabsvej"],
    relationshipTypes: ["ven", "klassekammerat", "kæreste", "søskende", "forælder", "underviser"],
    relevantStakes: ["identitet", "privatliv", "venskab", "uddannelsesmulighed", "selvstændighed", "tillid og omdømme"],
    naturalContexts: ["uddannelse", "fritidsliv", "online liv", "familie", "transport", "første job"],
    forbiddenResponsibilities: ["fastsætte institutionens regler", "beslutte andres fremtid", "optræde som myndighed eller behandler"],
    complexityGuidance: "Skriv direkte og konkret uden voksensprog; respekter at den unge kan forstå store konflikter og træffe selvstændige valg.",
  },
  Forælder: {
    agencyExamples: ["give eller nægte samtykke på familiens vegne", "acceptere en risiko for sit barn", "beskytte barnet eller åbne en mulighed", "vælge familiens deltagelse"],
    relationshipTypes: ["barn", "partner", "anden forælder", "lærer", "andre familier"],
    relevantStakes: ["barnets fremtid", "barnets privatliv", "familiens hjem", "tillid i familien", "sikkerhed", "lige muligheder"],
    naturalContexts: ["hjem", "skole", "sundhedstilbud", "boligområde", "transport", "familieliv online"],
    forbiddenResponsibilities: ["bestemme for alle familier", "ændre kommunens eller skolens regler", "vælge behandling for andres børn"],
    complexityGuidance: "Brug almindeligt voksensprog og gør spændingen mellem omsorg, barnets autonomi og fremtidige muligheder konkret.",
  },
  "Lærer / pædagog": {
    agencyExamples: ["handle i mødet med et konkret barn eller en klasse", "bruge eller afvise en anbefaling", "stå ved en faglig vurdering", "beskytte en relation på bekostning af en systemgevinst"],
    relationshipTypes: ["elev", "klasse", "kollega", "forælder", "barn i en gruppe"],
    relevantStakes: ["et barns mulighed", "tilliden til den voksne", "klassens fællesskab", "fagligt ansvar", "tid til nærvær"],
    naturalContexts: ["klasseværelse", "fritidstilbud", "skole-hjem-samtale", "personalerum", "online undervisning"],
    forbiddenResponsibilities: ["ændre national lovgivning", "fordele hele skolens budget", "beslutte som skoleleder uden at have rollen"],
    complexityGuidance: "Tillad faglig nuance, men hold konflikten menneskelig og synlig i relationen frem for i procedure og drift.",
  },
  Fagperson: {
    agencyExamples: ["følge eller tilsidesætte en anbefaling i en konkret sag", "tage fagligt ansvar", "fortælle en borger om en usikkerhed", "acceptere eller afvise en ny praksis i eget arbejde"],
    relationshipTypes: ["borger", "patient", "bruger", "kollega", "pårørende"],
    relevantStakes: ["faglig integritet", "et menneskes behandling eller adgang", "tillid", "ansvar ved fejl", "tid til menneskelig kontakt"],
    naturalContexts: ["hospital", "kommune", "rådgivning", "borgerservice", "faglig arbejdsplads"],
    forbiddenResponsibilities: ["ændre lovgivningen alene", "beslutte som øverste ledelse", "løse konflikten gennem en ny projektplan"],
    complexityGuidance: "Brug substans og præcision, men undgå at gøre dilemmaet til implementering, proces eller korrekt faglig procedure.",
  },
  Arbejdsgiver: {
    agencyExamples: ["anvende eller afvise en konkret forudsigelse", "beskytte en medarbejder eller en fælles leverance", "tage ansvar for en konkret beslutning om arbejde"],
    relationshipTypes: ["medarbejder", "team", "kunde", "tillidsrepræsentant", "familie afhængig af arbejdet"],
    relevantStakes: ["en medarbejders fremtid", "arbejdspladsens overlevelse", "tillid", "retfærdig behandling", "ansvar for skade"],
    naturalContexts: ["arbejdsplads", "ansættelsessamtale", "produktion", "vagtplan", "kundemøde"],
    forbiddenResponsibilities: ["regulere hele branchen", "ændre samfundets arbejdsmarked", "gemme konflikten i en ny proces"],
    complexityGuidance: "Giv plads til organisatorisk ansvar, men bind valget til navngivne mennesker og en konkret irreversibel pris.",
  },
  Medarbejder: {
    agencyExamples: ["acceptere eller afvise overvågning eller støtte", "følge eller modsætte sig en automatisk beslutning om eget arbejde", "beskytte en kollega eller egen mulighed"],
    relationshipTypes: ["kollega", "leder", "kunde", "borger", "partner eller familie"],
    relevantStakes: ["job og indkomst", "helbred", "privatliv", "faglig stolthed", "kollegial tillid", "fremtidige muligheder"],
    naturalContexts: ["arbejdsplads", "hjemmearbejde", "transport til arbejde", "kundekontakt", "efteruddannelse"],
    forbiddenResponsibilities: ["ændre virksomhedens regler", "beslutte for hele teamet", "optræde som arbejdsgiver eller myndighed"],
    complexityGuidance: "Skriv konkret om arbejdslivets menneskelige konsekvenser; undgå HR-procedure og abstrakt organisationssprog.",
  },
  "For alle": {
    agencyExamples: ["acceptere eller afvise en personlig konsekvens", "dele eller beskytte noget", "blive eller forlade noget", "stå ved et valg over for en nær relation"],
    relationshipTypes: ["familie", "ven", "nabo", "kollega", "lokalt fællesskab"],
    relevantStakes: ["hjem", "privatliv", "sikkerhed", "tillid", "fællesskab", "muligheden for selv at vælge"],
    naturalContexts: ["hjem", "byrum", "transport", "sundhed", "indkøb", "online liv"],
    forbiddenResponsibilities: ["optræde som ekspert, leder eller myndighed uden at rollen siger det"],
    complexityGuidance: "Skriv levende og alment forståeligt uden at gøre det store fremtidsspørgsmål overfladisk.",
  },
  Borger: {
    agencyExamples: ["acceptere en offentlig løsnings konsekvens i eget liv", "deltage eller stå udenfor", "dele eller beskytte egne oplysninger", "blive i eller forlade et lokalsamfund"],
    relationshipTypes: ["familie", "nabo", "lokalsamfund", "anden borger", "frontmedarbejder"],
    relevantStakes: ["retten til at høre til", "hjem", "privatliv", "lige behandling", "tillid til fælles løsninger", "sikkerhed"],
    naturalContexts: ["boligområde", "borgerservice", "transport", "lokalt møde", "sundhedstilbud", "digital identitet"],
    forbiddenResponsibilities: ["træffe kommunens beslutning", "ændre reglerne", "fordele ressourcer på andres vegne"],
    complexityGuidance: "Gør samfundsvirkningen personlig og konkret uden at gøre borgeren til politiker eller sagsbehandler.",
  },
  Beslutningstager: {
    agencyExamples: ["tage ansvar for en konkret bindende prioritering", "godkende eller afvise en praksis", "acceptere en kendt menneskelig pris for en samfundsgevinst"],
    relationshipTypes: ["berørt borger", "frontmedarbejder", "lokalsamfund", "faglig rådgiver", "politisk kollega"],
    relevantStakes: ["konkrete menneskers muligheder", "offentlig tillid", "ansvar ved skade", "lighed", "samfundets handlekraft"],
    naturalContexts: ["rådhus", "kommune", "hospital", "beredskab", "offentlig høring", "kritisk infrastruktur"],
    forbiddenResponsibilities: ["gemme valget i yderligere analyse", "uddelegere den bindende beslutning", "vælge en ufarlig pilot som erstatning for stillingtagen"],
    complexityGuidance: "Tillad strategisk dybde, men vis præcis hvilke mennesker beslutningen hjælper og hvilke den påfører en pris.",
  },
};

export function getAudienceProfile(role: UserRole): AudienceProfile {
  const audience = role === "Barn"
    ? audienceProfiles.child
    : role === "Ung"
      ? audienceProfiles.youth
      : role === "For alle" || role === "Forælder" || role === "Borger"
        ? audienceProfiles.public
        : audienceProfiles.professional;
  return { ...audience, ...rolePerspectives[role] };
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
