import type { LocationType, ProblemArea, UserRole, ValueProfile } from "@/types/world2046";

export const SESSION_DILEMMA_COUNT = 5;

export const userRoles: UserRole[] = [
  "Ung",
  "Forælder",
  "Lærer / pædagog",
  "Fagperson",
  "Arbejdsgiver",
  "Medarbejder",
  "For alle",
  "Borger",
  "Beslutningstager",
];

export const problemAreas: ProblemArea[] = [
  "Uddannelse og læring",
  "Arbejde og arbejdsliv",
  "Sundhed og omsorg",
  "Mobilitet, byliv og bolig",
  "Klima, energi og resiliens",
  "Mad, vand og forsyning",
  "Digital tillid, rettigheder og styring",
];

export const problemAreaLabelsByLanguage = {
  da: Object.fromEntries(problemAreas.map((area) => [area, area])) as Record<ProblemArea, string>,
  en: {
    "Uddannelse og læring": "Education and learning",
    "Arbejde og arbejdsliv": "Work and working life",
    "Sundhed og omsorg": "Health and care",
    "Mobilitet, byliv og bolig": "Mobility, city life and housing",
    "Klima, energi og resiliens": "Climate, energy and resilience",
    "Mad, vand og forsyning": "Food, water and supply",
    "Digital tillid, rettigheder og styring": "Digital trust, rights and governance",
  },
} satisfies Record<"da" | "en", Record<ProblemArea, string>>;

export const locationTypesByProblemArea: Record<ProblemArea, LocationType[]> = {
  "Uddannelse og læring": ["folkeskole", "gymnasium", "universitet", "bibliotek", "fritidsklub", "online læringsplatform"],
  "Arbejde og arbejdsliv": ["kontor", "fabrik", "lager", "platformarbejdsplads", "kommune", "hjemmearbejdsplads"],
  "Sundhed og omsorg": ["hospital", "sundhedsklinik", "plejehjem", "hjemmet", "apotek", "mental health center"],
  "Mobilitet, byliv og bolig": ["vej", "bymidte", "lufthavn", "togstation", "havn", "cykelkryds", "boligområde"],
  "Klima, energi og resiliens": ["energinet", "kystby", "boligområde", "landbrug", "datacenter", "kommune"],
  "Mad, vand og forsyning": ["gård", "supermarked", "havn", "vandværk", "lager", "distributionscenter"],
  "Digital tillid, rettigheder og styring": ["retsbygning", "rådhus", "social platform", "bank", "grænsekontrol", "digital borgerservice"],
};

export const emptyValueProfile: ValueProfile = {
  trust: 0,
  freedom: 0,
  equality: 0,
  efficiency: 0,
  humanContact: 0,
  safety: 0,
  innovation: 0,
  sustainability: 0,
  localControl: 0,
  transparency: 0,
};

export const valueLabels: Record<keyof ValueProfile, string> = {
  trust: "Tillid",
  freedom: "Frihed",
  equality: "Lighed",
  efficiency: "Effektivitet",
  humanContact: "Menneskelig kontakt",
  safety: "Tryghed",
  innovation: "Innovation",
  sustainability: "Bæredygtighed",
  localControl: "Lokal kontrol",
  transparency: "Gennemsigtighed",
};

export const valueLabelsByLanguage = {
  da: valueLabels,
  en: {
    trust: "Trust",
    freedom: "Freedom",
    equality: "Equality",
    efficiency: "Efficiency",
    humanContact: "Human contact",
    safety: "Safety",
    innovation: "Innovation",
    sustainability: "Sustainability",
    localControl: "Local control",
    transparency: "Transparency",
  },
} satisfies Record<"da" | "en", Record<keyof ValueProfile, string>>;
