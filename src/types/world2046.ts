import type { Language } from "@/lib/i18n";

export type AppPhase = "intro" | "persona" | "traveling" | "landing" | "dilemma" | "consequence" | "report" | "consent" | "goodbye";

export type UserRole =
  | "Ung"
  | "Forælder"
  | "Lærer / pædagog"
  | "Fagperson"
  | "For alle"
  // Retired from the picker but kept valid: stored sessions and older links
  // still carry them, and they all resolve to the professional audience.
  | "Arbejdsgiver"
  | "Medarbejder"
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
  /** Where this option sits on the dilemma's single decision axis, 1–4.
   *  Internal: it forces the four options onto one axis at generation time and
   *  is never shown to the player. Optional so the hand-written templates,
   *  which predate it, still type-check. */
  axisPosition?: number;
  valueImpacts: Partial<ValueProfile>;
};

/** The two legitimate values a dilemma is pulled between. Internal metadata:
 *  it exists to make the generator commit to a real trade-off before it writes
 *  the options, and to let validation check the options actually differ. */
export type CoreTension = {
  valueA: keyof ValueProfile;
  valueB: keyof ValueProfile;
  summary: string;
};

/** Internal coherence worksheet produced before the audience-facing copy. */
export type DilemmaLogic = {
  /** The concrete practice that has become normal by 2046. */
  rule: string;
  /** Why people accepted the practice; it must solve something real. */
  benefit: string;
  /** The one event today that makes the otherwise useful rule insufficient. */
  trigger: string;
  /** The exact decision the traveller can make now. */
  decision: string;
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
  landingScene?: string;
  landingDetail?: string;
  /** One sentence naming who is affected and what they stand to lose. Shown to
   *  the player: without it a dilemma reads as an administrative setting rather
   *  than something worth stopping for. */
  stake?: string;
  /** Internal generation metadata — not rendered anywhere in the UI. */
  coreTension?: CoreTension;
  decisionAxis?: string;
  logic?: DilemmaLogic;
  /** Which documented future pressure this stop was built from, so the journey
   *  can send the next round somewhere else in the future space. */
  futurePressureId?: string;
  /** The one thing that is ordinary in 2046 and not in 2026. Internal: it is
   *  what the scene has to make felt without explaining it. */
  normalized2046?: string;
  /** Where the player stands in the situation — passenger, neighbour, patient.
   *  Kept so a journey can avoid making them the administrator five times. */
  userRelation?: string;
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
  /** Carried so the next round can pick a different corner of the future space. */
  futurePressureId?: string;
  /** Carried so the next round knows which values this journey has already
   *  argued about, and can be sent somewhere new. Internal, never displayed. */
  coreTension?: CoreTension;
  selectedChoiceId: string;
  selectedChoiceLabel: string;
  customAnswer?: string;
  answeredByVoice?: boolean;
  reflection?: string;
  reflectionViaVoice?: boolean;
  valueImpacts: ValueProfile;
};

export type PersonaAnswers = {
  role: UserRole;
  hope: string;
  fear: string;
  hopeViaVoice?: boolean;
  fearViaVoice?: boolean;
};

export type FutureProfileReport = {
  headline: string;
  narrative: string;
  quotes: { quote: string; context: string }[];
  patterns: string[];
  reflectionNote: string;
  source: "openai" | "fallback";
};

export type SessionResult = {
  sessionId: string;
  createdAt: string;
  year: 2046;
  role: UserRole;
  /** What the traveller entered at check-in. The consent screen promises these
   *  written answers are kept, so they are stored as given, not summarised. */
  personaAnswers?: PersonaAnswers;
  completedDilemmas: CompletedDilemma[];
  valueProfile: ValueProfile;
  generatedSummary: string;
  futureReport?: FutureProfileReport;
  language: Language;
};

export type ConsentedSessionRecord = {
  schemaVersion: 1;
  consentPolicyVersion: "2026-08-14";
  acceptedAt: string;
  session: SessionResult;
};
