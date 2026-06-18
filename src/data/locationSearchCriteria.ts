import type { LocationType, ProblemArea } from "@/types/world2046";

export type LocationSearchDomain =
  | "schools"
  | "healthcare"
  | "public-sector"
  | "mobility"
  | "food-supply"
  | "workplaces"
  | "climate-infrastructure";

export type LocationSearchCriterion = {
  domain: LocationSearchDomain;
  problemAreas: ProblemArea[];
  locationTypes: LocationType[];
  exampleQueries: string[];
};

export const locationSearchCriteria: LocationSearchCriterion[] = [
  {
    domain: "schools",
    problemAreas: ["Uddannelse og læring"],
    locationTypes: ["folkeskole", "gymnasium", "universitet", "bibliotek", "fritidsklub"],
    exampleQueries: ["primary school", "public school", "library", "learning center"],
  },
  {
    domain: "healthcare",
    problemAreas: ["Sundhed og omsorg"],
    locationTypes: ["hospital", "sundhedsklinik", "plejehjem", "apotek", "mental health center"],
    exampleQueries: ["hospital", "health clinic", "care home", "pharmacy"],
  },
  {
    domain: "mobility",
    problemAreas: ["Mobilitet, byliv og bolig"],
    locationTypes: ["togstation", "lufthavn", "havn", "cykelkryds", "bymidte", "vej"],
    exampleQueries: ["train station", "airport", "harbor", "bike intersection"],
  },
  {
    domain: "food-supply",
    problemAreas: ["Mad, vand og forsyning"],
    locationTypes: ["supermarked", "gård", "vandværk", "lager", "distributionscenter", "havn"],
    exampleQueries: ["supermarket", "market", "waterworks", "distribution center"],
  },
  {
    domain: "public-sector",
    problemAreas: ["Digital tillid, rettigheder og styring", "Klima, energi og resiliens", "Arbejde og arbejdsliv"],
    locationTypes: ["rådhus", "kommune", "digital borgerservice", "retsbygning", "kontor"],
    exampleQueries: ["city hall", "municipal office", "public service center"],
  },
  {
    domain: "workplaces",
    problemAreas: ["Arbejde og arbejdsliv"],
    locationTypes: ["kontor", "fabrik", "lager", "platformarbejdsplads", "hjemmearbejdsplads"],
    exampleQueries: ["office", "factory", "warehouse", "coworking"],
  },
  {
    domain: "climate-infrastructure",
    problemAreas: ["Klima, energi og resiliens"],
    locationTypes: ["energinet", "datacenter", "kystby", "landbrug", "kommune"],
    exampleQueries: ["substation", "data center", "coastal city", "municipality"],
  },
];

export function getSearchCriteria(problemArea: ProblemArea, locationType: LocationType) {
  return locationSearchCriteria.find(
    (criterion) => criterion.problemAreas.includes(problemArea) && criterion.locationTypes.includes(locationType),
  );
}
