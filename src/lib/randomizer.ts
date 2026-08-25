import { dilemmaTemplates } from "@/data/dilemmaTemplates";
import { exactPlaces } from "@/data/exactPlaces";
import { locations } from "@/data/locations";
import { problemAreas } from "@/data/taxonomies";
import { getAudienceProfile, tailorDilemmaCopyForAudience } from "@/lib/audience";
import type { CompletedDilemma, GeneratedDilemma, LocationType, ProblemArea, UserRole } from "@/types/world2046";

const pick = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

const compatibleLocationTypes: Partial<Record<LocationType, LocationType[]>> = {
  kommune: ["kommune", "rådhus", "digital borgerservice"],
  rådhus: ["rådhus", "kommune", "digital borgerservice"],
  "digital borgerservice": ["digital borgerservice", "rådhus", "kommune"],
  bymidte: ["bymidte", "rådhus", "togstation", "supermarked"],
  vej: ["vej", "bymidte", "togstation"],
};

function matchesAnyLocationType(placeType: LocationType, validTypes: LocationType[]) {
  return validTypes.some((type) => (compatibleLocationTypes[type] ?? [type]).includes(placeType));
}

function interpolate(text: string, values: Record<string, string>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), text);
}

const englishDocumentaryCopy: Record<ProblemArea, {
  title: string;
  scene: (place: string, technology: string) => string;
  question: string;
  choices: Array<[string, string, string]>;
}> = {
  "Uddannelse og læring": {
    title: "The lesson that knows you",
    scene: (place, technology) => `At ${place}, ${technology} changes each pupil's lesson before the teacher reaches their desk. One child moves ahead; another quietly waits for a person to notice why they stopped.`,
    question: "How should I divide attention between personal software and a shared classroom?",
    choices: [
      ["Protect time without prediction", "Keep parts of the school day free from personal models.", "Teachers see more unfinished thinking, but some pupils lose support that helped them participate."],
      ["Let each pupil set the pace", "Use the tool wherever it helps a pupil continue.", "More pupils move at their own speed, while the class has fewer experiences in common."],
      ["Put the teacher at every handover", "The tool can suggest; a teacher decides when the path changes.", "Decisions stay human, but teachers carry more interruptions and responsibility."],
      ["Show pupils what the tool noticed", "Make every adaptation visible and open to challenge.", "Pupils gain insight, while explanations take time away from the lesson itself."],
    ],
  },
  "Arbejde og arbejdsliv": {
    title: "Who carries the efficient day?",
    scene: (place, technology) => `At ${place}, ${technology} has rearranged today's work before the first shift begins. The numbers look cleaner; two colleagues are comparing what the new plan asks them to give up.`,
    question: "How should I share the gains and disruptions created by this change?",
    choices: [
      ["Give workers firm boundaries", "Let people lock time and tasks the tool cannot move.", "Daily life becomes more predictable, while the workplace loses some flexibility."],
      ["Optimise the whole operation", "Let the model coordinate work across the site.", "Queues shrink, but fewer people can explain why their own day changed."],
      ["Let teams revise the plan", "Use the model as a draft that colleagues negotiate together.", "Local knowledge shapes the day, at the cost of slower decisions."],
      ["Publish who gains and loses", "Show the effects of each automated change.", "Trade-offs become visible, including uncomfortable differences the workplace must address."],
    ],
  },
  "Sundhed og omsorg": {
    title: "Before a person enters the room",
    scene: (place, technology) => `At ${place}, ${technology} has already marked the next patient file. A nurse reads the alert while the patient watches their face for a clue.`,
    question: "How should I use an early warning without letting it become the whole story?",
    choices: [
      ["Begin with a conversation", "Let a person hear the patient before opening the prediction.", "Patients are met as people first, while urgent signals may wait a little longer."],
      ["Act on the earliest signal", "Use the model to move people through care quickly.", "Some deterioration is caught sooner, but false alarms reshape more lives."],
      ["Require two kinds of evidence", "Combine the model's warning with a professional assessment.", "Critical decisions gain a safeguard, while staff time becomes the bottleneck."],
      ["Let patients see and challenge it", "Show the data, uncertainty and route to appeal.", "Patients gain agency, but must absorb difficult probabilities while seeking care."],
    ],
  },
  "Mobilitet, byliv og bolig": {
    title: "A street that changes its mind",
    scene: (place, technology) => `Around ${place}, ${technology} changes how space is used from hour to hour. A delivery rider, a parent and an older pedestrian arrive at the same crossing with different needs.`,
    question: "How should I decide whose everyday journey the city protects first?",
    choices: [
      ["Guarantee space for the vulnerable", "Set a minimum that optimisation cannot remove.", "Walking feels safer, while traffic backs up elsewhere."],
      ["Follow demand minute by minute", "Let live movement determine how space is shared.", "More journeys flow smoothly, but the street becomes harder to predict."],
      ["Let neighbourhoods set the rhythm", "Give local residents control over key hours.", "The street reflects local life, while people passing through get less influence."],
      ["Make every change legible", "Show what changed, why, and for how long.", "People can plan and object, but the city must maintain a constant public explanation."],
    ],
  },
  "Klima, energi og resiliens": {
    title: "When there is not enough for everyone",
    scene: (place, technology) => `At ${place}, ${technology} is balancing today's heat, power and water. On one screen, a care home and a workshop are both marked urgent.`,
    question: "How should I decide what is protected when climate pressure reaches daily life?",
    choices: [
      ["Protect essential needs first", "Reserve capacity for health, homes and basic services.", "Vulnerable people gain certainty, while some workplaces carry more disruption."],
      ["Let the model minimise total loss", "Choose the allocation with the smallest measured impact.", "Resources go further, but values hidden in the calculation become public policy."],
      ["Give local groups a say", "Let affected communities revise priorities together.", "Decisions gain local knowledge, while action takes longer during pressure."],
      ["Publish every trade-off", "Show forecasts, uncertainty and who receives less.", "The choice becomes accountable, but visible sacrifice may sharpen conflict."],
    ],
  },
  "Mad, vand og forsyning": {
    title: "The last delivery on the board",
    scene: (place, technology) => `At ${place}, ${technology} has found a shortage before the shelves look empty. A worker holds the final allocation list while three destinations wait.`,
    question: "How should I share a shortage before everyone can feel it?",
    choices: [
      ["Guarantee an equal minimum", "Give every area a protected basic share.", "No community is left empty, while specialised needs receive less."],
      ["Send supplies where impact is greatest", "Use forecasts to prevent the largest disruption.", "More waste is avoided, but smaller communities may repeatedly come last."],
      ["Let local suppliers adapt", "Give nearby producers room to change the plan.", "The response fits local conditions, while prices and availability vary more."],
      ["Show the full allocation", "Let everyone see quantities, reasons and uncertainty.", "Trust can grow through scrutiny, while every contested choice becomes visible."],
    ],
  },
  "Digital tillid, rettigheder og styring": {
    title: "The decision behind the screen",
    scene: (place, technology) => `At ${place}, ${technology} has prepared a recommendation about a real person's access and rights. A caseworker pauses before turning the screen toward them.`,
    question: "How should I keep a digital decision useful without making it final?",
    choices: [
      ["Keep a person responsible", "Require a named professional to own the final decision.", "Responsibility stays visible, while decisions take more staff time."],
      ["Use one rule for everyone", "Let the model apply the same criteria at scale.", "Cases move faster, but unusual lives fit the categories poorly."],
      ["Give people a real appeal", "Make review simple and pause consequences during it.", "People regain leverage, while institutions must fund meaningful human review."],
      ["Open the reasoning", "Show the evidence, rule and uncertainty behind each result.", "Decisions become easier to challenge, while complex explanations may still exclude some people."],
    ],
  },
};

function localizeFallbackDilemma(dilemma: GeneratedDilemma): GeneratedDilemma {
  const copy = englishDocumentaryCopy[dilemma.problemArea];
  const place = dilemma.exactPlace?.name ?? dilemma.city;
  return {
    ...dilemma,
    title: copy.title,
    scenePrompt: copy.scene(place, dilemma.technology),
    question: copy.question,
    landingScene: `You arrive at ${place} in 2046. ${copy.scene(place, dilemma.technology)}`,
    landingDetail: "Listen for the ordinary life around the decision.",
    choices: dilemma.choices.map((choice, index) => ({ ...choice, label: copy.choices[index][0], description: copy.choices[index][1], consequence: copy.choices[index][2] })),
  };
}

export function generateDilemma(input: {
  role: UserRole;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
  language?: "da" | "en";
}): GeneratedDilemma {
  const audience = getAudienceProfile(input.role);
  const previous = input.previousDilemmas;
  const last = previous.at(-1);
  const isFirst = previous.length === 0;
  const usedIds = new Set(previous.map((item) => item.dilemmaId));
  const usedExactPlaces = new Set(previous.map((item) => item.exactPlaceName).filter(Boolean));
  const usedCountries = new Set(previous.map((item) => item.country));

  const preferredAreas = audience.preferredProblemAreas.filter((area) => area !== last?.problemArea);
  const allowedAreas = (preferredAreas.length ? preferredAreas : problemAreas).filter((area) => area !== last?.problemArea);
  const underusedAreas = allowedAreas.filter((area) => previous.filter((item) => item.problemArea === area).length < 2);
  const danishPoiAreas = [
    ...new Set(
      exactPlaces
        .filter((place) => place.country === "Danmark")
        .flatMap((place) => place.problemAreas),
    ),
  ].filter((area) => allowedAreas.includes(area));
  const area: ProblemArea = isFirst ? pick(danishPoiAreas.length ? danishPoiAreas : ["Uddannelse og læring"]) : pick(underusedAreas.length ? underusedAreas : allowedAreas);

  const templateCandidates = dilemmaTemplates.filter(
    (template) =>
      template.problemArea === area &&
      template.severity === input.preferredSeverity &&
      !usedIds.has(template.id) &&
      template.targetGroups.some((group) => audience.targetGroups.includes(group)),
  );
  const template = pick(
    templateCandidates.length
      ? templateCandidates
      : dilemmaTemplates.filter((item) => item.problemArea === area && !usedIds.has(item.id)),
  );
  const preferredValidLocationTypes = template.validLocationTypes.filter((type) => audience.preferredLocationTypes.includes(type));
  const validLocationTypes = preferredValidLocationTypes.length ? preferredValidLocationTypes : template.validLocationTypes;
  const exactPlaceCandidates = exactPlaces.filter(
    (place) =>
      matchesAnyLocationType(place.locationType, validLocationTypes) &&
      place.problemAreas.includes(area) &&
      place.country !== last?.country &&
      !usedExactPlaces.has(place.name) &&
      (isFirst ? place.country === "Danmark" : place.country !== "Danmark" && !usedCountries.has(place.country)),
  );
  const exactPlace = exactPlaceCandidates.length ? pick(exactPlaceCandidates) : undefined;
  const type: LocationType = exactPlace?.locationType ?? pick(validLocationTypes);
  const locationCandidates = locations.filter(
    (location) =>
      location.validProblemAreas.includes(area) &&
      location.validLocationTypes.includes(type) &&
      location.country !== last?.country &&
      (isFirst ? location.country === "Danmark" : location.country !== "Danmark" && !usedCountries.has(location.country)),
  );
  const relaxedLocationCandidates = locations.filter(
    (location) =>
      location.validProblemAreas.includes(area) &&
      location.validLocationTypes.includes(type) &&
      location.country !== last?.country &&
      (!isFirst || location.country === "Danmark"),
  );
  const location =
    (exactPlace && locations.find((item) => item.country === exactPlace.country && item.city === exactPlace.city)) ??
    (isFirst
      ? locations.find((item) => item.country === "Danmark" && item.city === "Aarhus") ?? pick(locationCandidates)
      : pick(locationCandidates.length ? locationCandidates : relaxedLocationCandidates));
  const technology = pick(template.technologies);
  const values = {
    role: input.role,
    city: location.city,
    country: location.country,
    locationType: type,
    technology,
  };
  const dilemma = tailorDilemmaCopyForAudience({
    ...template,
    targetGroups: [...new Set([...template.targetGroups, ...audience.targetGroups])],
    scenePrompt: interpolate(template.scenePrompt, values),
    question: interpolate(template.question, values),
    country: exactPlace?.country ?? location.country,
    city: exactPlace?.city ?? location.city,
    region: exactPlace?.region ?? location.region,
    locationType: type,
    technology,
    role: input.role,
    marker: { lat: exactPlace?.lat ?? location.lat, lng: exactPlace?.lng ?? location.lng },
    exactPlace,
    landingScene: `${interpolate(template.scenePrompt, values)}`,
    landingDetail: undefined,
  });
  return input.language === "en" ? localizeFallbackDilemma(dilemma) : dilemma;
}
