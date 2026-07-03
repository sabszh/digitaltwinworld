import type { UserRole } from "@/types/world2046";

export type Language = "da" | "en";

export const roleLabels: Record<Language, Record<UserRole, string>> = {
  da: {
    Ung: "Ung",
    Forælder: "Forælder",
    "Lærer / pædagog": "Lærer / pædagog",
    Arbejdsgiver: "Arbejdsgiver",
    Medarbejder: "Medarbejder",
    "For alle": "For alle",
    Borger: "Borger",
    Beslutningstager: "Beslutningstager",
  },
  en: {
    Ung: "Young person",
    Forælder: "Parent",
    "Lærer / pædagog": "Teacher / educator",
    Arbejdsgiver: "Employer",
    Medarbejder: "Employee",
    "For alle": "For everyone",
    Borger: "Citizen",
    Beslutningstager: "Decision-maker",
  },
};

export const uiText = {
  da: {
    introBody:
      "Velkommen til World 2046. Du skal rejse rundt i fremtidens verden og løse dilemmaer, der former, hvordan vi ønsker at leve.",
    startJourney: "Start rejsen",
    introMeta: "5 dilemmaer. 7 minutter. Én fremtidsverden.",
    roleQuestion: "Hvem rejser du som?",
    left: "tilbage",
    finding: "Finder lokation",
    scrollHint: "Scroll for at begynde",
    introSectionTwoLine1: "Fem dilemmaer venter i fremtidens byer, hjem og institutioner.",
    introSectionTwoLine2: "Dine valg former, hvordan World 2046 kommer til at se ud.",
    introSectionThreeLine1: "Du er klar til at rejse.",
    introSectionThreeLine2: "Bliv ved med at scrolle for at lande i 2046.",
    introReadyQuestion: "Er du klar til at rejse?",
    introScrollLabel: "Scroll",
  },
  en: {
    introBody:
      "Welcome to World 2046. Travel through the future world and solve dilemmas that shape how we want to live.",
    startJourney: "Start journey",
    introMeta: "5 dilemmas. 7 minutes. One future world.",
    roleQuestion: "Who are you travelling as?",
    left: "left",
    finding: "Finding location",
    scrollHint: "Scroll to begin",
    introSectionTwoLine1: "Five dilemmas are waiting in the cities, homes and institutions of the future.",
    introSectionTwoLine2: "Your choices shape what World 2046 will look like.",
    introSectionThreeLine1: "You're ready to travel.",
    introSectionThreeLine2: "Keep scrolling to land in 2046.",
    introReadyQuestion: "Are you ready to travel?",
    introScrollLabel: "Scroll",
  },
} satisfies Record<Language, Record<string, string>>;
