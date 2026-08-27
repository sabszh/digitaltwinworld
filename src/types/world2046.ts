import type { Language } from "@/lib/i18n";

export type AppPhase = "intro" | "persona" | "traveling" | "landing" | "dilemma" | "consequence" | "report" | "consent" | "goodbye";

export type UserRole =
  | "Barn"
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

export type FutureTheme =
  | "AI og beslutninger"
  | "Robotter og autonome systemer"
  | "Sundhed og bioteknologi"
  | "Data, identitet og privatliv"
  | "Sandhed og autenticitet"
  | "Uddannelse"
  | "Arbejde"
  | "Klima, energi og ressourcer"
  | "Offentlige systemer og demokrati"
  | "Relationer, familie og hverdagsliv";

export type FutureDevelopment = {
  id: string;
  development: string;
  themes: FutureTheme[];
  suitableRoles?: UserRole[];
  unsuitableRoles?: UserRole[];
  contexts?: string[];
  /** Optional research provenance. Never used as an authoring constraint. */
  pressureIds?: string[];
};

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
  /** Scored after the concrete action has been written. Only a handful of
   * values should normally move; all remaining keys are deliberately zero. */
  valueImpacts: Partial<ValueProfile>;
};

/** The human conflict inside a concrete moment. It gives the generator a way
 * to explain why reasonable people cannot simply choose everything at once,
 * without exposing the value model that scores their choice. */
export type CoreTension = {
  want: string;
  butAlsoWant: string;
  whyCannotHaveBoth: string;
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
  /** Why the four actions compete in this moment rather than being combined. */
  choiceConstraint: string;
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
  logic?: DilemmaLogic;
  /** Development id used for journey variation. The legacy field name is kept
   *  so stored sessions remain compatible. */
  futurePressureId?: string;
  /** The one thing that is ordinary in 2046 and not in 2026. Internal: it is
   *  what the scene has to make felt without explaining it. */
  normalized2046?: string;
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
  /** A faithful snapshot of the participant-facing dilemma. This keeps the
   * collected choice interpretable later: a selected answer without the scene
   * and the competing actions is not useful research data. */
  presented: {
    title: string;
    scene: string;
    stake?: string;
    landingScene?: string;
    landingDetail?: string;
    place?: { name: string; latitude: number; longitude: number };
    choices: Array<Pick<Choice, "id" | "label" | "description">>;
  };
  /** Development id, stored under the legacy name for session compatibility. */
  futurePressureId?: string;
  /** Retained as internal context for the completed dilemma; never displayed. */
  coreTension?: CoreTension;
  /** The four authored actions are retained only when the traveller writes an
   * alternative. Their text can then be matched to an existing action without
   * inventing an axis or a new fixed value stamp. */
  scoringChoices?: Choice[];
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
  /** Optional boarding-pass detail. It is a visual time-travel gimmick only and
   * never influences dilemma generation or the value profile. */
  age?: number;
  hopeViaVoice?: boolean;
  fearViaVoice?: boolean;
};

export type FutureProfileReport = {
  headline: string;
  narrative: string;
  quotes: { quote: string; context: string }[];
  patterns: string[];
  reflectionNote: string;
  source: "openai";
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
  schemaVersion: 2;
  consentPolicyVersion: "2026-08-25";
  acceptedAt: string;
  session: SessionResult;
};
