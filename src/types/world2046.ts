export type AppPhase = "intro" | "role-selection" | "traveling" | "dilemma" | "consequence" | "report";

export type UserRole =
  | "Ung"
  | "Forælder"
  | "Lærer / pædagog"
  | "Arbejdsgiver"
  | "Medarbejder"
  | "For alle"
  | "Borger"
  | "Beslutningstager";

export type ProblemArea =
  | "Uddannelse og læring"
  | "Arbejde og arbejdsliv"
  | "Sundhed og omsorg"
  | "Mobilitet, byliv og bolig"
  | "Klima, energi og resiliens"
  | "Mad, vand og forsyning"
  | "Digital tillid, rettigheder og styring";

export type LocationType =
  | "folkeskole" | "gymnasium" | "universitet" | "bibliotek" | "fritidsklub" | "online læringsplatform"
  | "vej" | "bymidte" | "lufthavn" | "togstation" | "havn" | "cykelkryds" | "boligområde"
  | "hospital" | "sundhedsklinik" | "plejehjem" | "hjemmet" | "apotek" | "mental health center"
  | "kontor" | "fabrik" | "lager" | "platformarbejdsplads" | "kommune" | "hjemmearbejdsplads"
  | "energinet" | "kystby" | "landbrug" | "datacenter"
  | "gård" | "supermarked" | "vandværk" | "distributionscenter"
  | "retsbygning" | "rådhus" | "social platform" | "bank" | "grænsekontrol" | "digital borgerservice";

export type TargetGroup = "unge" | "familier" | "lærere" | "medarbejdere" | "ledere" | "borgere" | "beslutningstagere" | "ældre";

export type FutureTechnology =
  | "AI-tutor" | "personlig læringsassistent" | "automatisk feedback" | "trivselsdata" | "social robot"
  | "algoritmisk planlægning" | "robotkollega" | "AI-ledelse" | "automation" | "omskolings-AI"
  | "AI-triage" | "omsorgsrobot" | "AI-samtaleven" | "sundhedsdata" | "hjemmediagnostik"
  | "selvkørende systemer" | "dynamisk infrastruktur" | "leveringsdroner" | "sensorbolig" | "robotbus"
  | "AI-styret elnet" | "datacenter-varme" | "klimatvilling" | "energi-AI" | "bydigital tvilling"
  | "robotlandbrug" | "vandbudgettering" | "klimapris-AI" | "vertikale farme" | "forsynings-AI"
  | "deepfake-detektion" | "AI i retten" | "digital ID-wallet" | "kommunal beslutnings-AI" | "personlig data-agent";

export type ValueProfile = {
  trust: number;
  freedom: number;
  equality: number;
  efficiency: number;
  humanContact: number;
  safety: number;
  innovation: number;
  sustainability: number;
  localControl: number;
  transparency: number;
};

export type Choice = {
  id: string;
  label: string;
  description?: string;
  consequence?: string;
  valueImpacts: Partial<ValueProfile>;
};

export type LocationNode = {
  id: string;
  region: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  validLocationTypes: LocationType[];
  validProblemAreas: ProblemArea[];
};

export type ExactPlace = {
  id: string;
  name: string;
  address?: string;
  searchDomain?: string;
  region: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  locationType: LocationType;
  problemAreas: ProblemArea[];
};

export type DilemmaTemplate = {
  id: string;
  problemArea: ProblemArea;
  validLocationTypes: LocationType[];
  targetGroups: TargetGroup[];
  technologies: FutureTechnology[];
  severity: "low" | "medium";
  title: string;
  scenePrompt: string;
  question: string;
  choices: Choice[];
  tags: string[];
};

export type GeneratedDilemma = DilemmaTemplate & {
  country: string;
  city: string;
  region: string;
  locationType: LocationType;
  technology: FutureTechnology;
  role: UserRole;
  marker: { lat: number; lng: number };
  exactPlace?: ExactPlace;
};

export type CompletedDilemma = {
  dilemmaId: string;
  problemArea: ProblemArea;
  region: string;
  country: string;
  city: string;
  exactPlaceName?: string;
  locationType: LocationType;
  technology: FutureTechnology;
  question: string;
  selectedChoiceId: string;
  selectedChoiceLabel: string;
  customAnswer?: string;
  valueImpacts: ValueProfile;
};

export type SessionResult = {
  sessionId: string;
  createdAt: string;
  year: 2046;
  role: UserRole;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  generatedSummary: string;
};
