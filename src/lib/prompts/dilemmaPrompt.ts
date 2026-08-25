import { locationTypesByProblemArea } from "@/data/taxonomies";
import { planRound } from "@/lib/roundPlan";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { FutureTechnology, LocationType, ValueProfile } from "@/types/world2046";

export const valueKeys = [
  "trust", "freedom", "equality", "efficiency", "humanContact", "safety",
  "innovation", "sustainability", "localControl", "transparency",
] as const satisfies Array<keyof ValueProfile>;

const DANISH_TOWNS = [
  "København", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding",
  "Horsens", "Vejle", "Roskilde", "Herning", "Silkeborg", "Næstved", "Viborg",
] as const;

const WORLD_REGIONS = [
  "Norden", "Europa", "Nordamerika", "Sydamerika", "Afrika", "Asien", "Mellemøsten", "Oceanien",
] as const;

type BuildDilemmaPromptOptions = {
  technologies: FutureTechnology[];
  locationTypes: LocationType[];
};

export function buildDilemmaPrompt(input: DilemmaGenerationRequest, options: BuildDilemmaPromptOptions) {
  const plan = input.generationPlan ?? planRound(input.previousDilemmas);
  const round = input.previousDilemmas.length;
  const usedCountries = [...new Set(input.previousDilemmas.map((item) => item.country))];
  const usedRegions = new Set(input.previousDilemmas.map((item) => item.region));
  const openRegions = WORLD_REGIONS.filter((region) => !usedRegions.has(region));
  const geography = round === 0
    ? `Brug Danmark, region Norden og byen ${DANISH_TOWNS[Math.floor(Math.random() * DANISH_TOWNS.length)]}.`
    : `Brug ikke Danmark eller tidligere lande (${usedCountries.join(", ")}). Vælg helst en ubrugt region: ${(openRegions.length ? openRegions : WORLD_REGIONS).join(", ")}.`;
  const previous = input.previousDilemmas.length
    ? input.previousDilemmas.map((item) => `${item.city}: ${item.problemArea} — ${item.question}`).join("\n")
    : "Ingen.";
  const languageName = input.language === "da" ? "dansk" : "English";

  return `Skriv ét World 2046-dilemma. Start med stedet — ikke med en abstrakt regel.

DET VIGTIGSTE
Vælg et virkeligt sted, som kan findes på et kort, og forstå hvad mennesker faktisk bruger stedet til. Dilemmaet skal vokse ud af den funktion.

Et hospital skal handle om den behandling eller omsorg, der foregår dér. En skole skal handle om undervisning, børn eller skoleliv. En station skal handle om en konkret rejse. Et boligområde skal handle om det at bo der. Vælg aldrig en skole bare fordi hovedpersonen er ung, og vælg aldrig et rådhus bare fordi emnet har regler.

Hvis exactPlace blev udskiftet med en tilfældig bygning, skal scenen holde op med at give mening. Hvis by og land blev udskiftet, skal mindst én vigtig hverdagsdetalje ændre sig. Brug lokal hverdag uden stereotyper og uden at opfinde præcise lokale love.
Personerne skal have en naturlig grund til at være der. En nabo eller familie står ikke inde på et vandværk, datacenter eller elnet-anlæg; vis i stedet hjemmet, kvarteret eller det offentlige sted, hvor konsekvensen mærkes. Brug kun et lukket driftssted, hvis brugeren naturligt arbejder dér.

FREMTIDEN, SOM STEDET SKAL FORTOLKE
- Pres frem mod 2046: ${plan.pressure.pressure}
- En mulig samfundsløsning, som nu er hverdag: ${plan.response}
- Problemområdet skal være ét af: ${plan.problemAreas.join(", ")}
- ${geography}

Gør løsningen konkret for det valgte sted. Tilføj ikke en identitetsbrik, personlig agent, tablet eller algoritme bare for at signalere fremtid. En fremtidsgenstand må kun være med, hvis dilemmaet kollapser uden den.

EN DILEMMAFORKLARING, MAN KAN TAGE STILLING TIL
Et dilemma er ikke bare "teknologi har en ulempe". Det er en ny ordning, der løser et reelt problem og derfor er svær at afvise — men som i denne konkrete situation flytter en byrde over på nogen eller noget andet.

Giv spilleren fire ting, i denne rækkefølge:
1. Hvad er blevet normalt i 2046 på dette sted? Nævn systemet eller praksissen konkret.
2. Hvorfor findes det? Vis den faktiske gevinst og den knaphed eller risiko, det skulle løse.
3. Hvad koster det her og nu? Giv én sanselig hverdagsdetalje og én konkret konsekvens for et navngivet menneske, en gruppe eller stedet.
4. Hvad kan brugeren vælge nu? Det skal være et valg mellem troværdige handlinger, ikke en holdning til fremtiden.

Eksempel på formen, ikke en historie der skal genbruges: Et kvarter får stabil strøm og fjernvarme fra et datacenter, der træner nye AI-modeller. På varme dage bruger kølingen dog af byens rensede vandreserve, som også skal række til boliger og et hospital. En lokal beboer ser vandbudgettet falde netop den uge, hvor familien ikke kan flytte deres behandling. Valget handler om datacenterets vilkår, prioritet eller gennemsigtighed — ikke om "AI er godt eller dårligt".

Andre troværdige retninger er overvågning, der forebygger noget reelt men registrerer hverdagsliv; sundheds-AI, der finder risiko tidligere men ændrer hvem der får opmærksomhed; eller digitale beviser, der dæmmer op for deepfakes men gør anonym deltagelse sværere. Gør dem altid stedbundne og menneskelige.

Udfyld logic som en kort intern skitse af de samme fire ting:
- rule: Den praksis, som er normal på stedet i 2046.
- benefit: Den konkrete gevinst eller risiko, praksissen håndterer.
- trigger: Dagens hændelse, hvor prisen bliver tydelig.
- decision: Det konkrete valg, brugeren selv kan træffe nu.

landingScene er to sætninger: et menneske gør noget forståeligt på stedet; så opstår dagens problem. scenePrompt forklarer systemet, gevinsten og den relevante begrænsning i 2-4 korte sætninger. stake siger præcist, hvem eller hvad der taber noget, hvis valget går den ene vej. question spørger direkte, hvad brugeren gør. Alle fire valg skal svare på samme situation.

DE FIRE SVAR
Skriv fire forskellige, realistiske handlinger på det samme valg. Hver description skal vise både en konkret gevinst og en konkret pris. Ingen svar er facit, og ingen er absurd. Undgå fire grader af den samme handling, fire myndighedsniveauer og “mennesket bestemmer” over for “systemet bestemmer”.

axisPosition 1-4 bruges én gang hver. Vælg to forskellige coreTension-værdier; valueA falder og valueB stiger gennem positionerne. Brug ikke værdiernes navne i den synlige tekst.

SPROG OG FORMAT
- Skriv alt brugervendt på ${languageName} i korte, konkrete sætninger.
- Skriv til rollen ${input.role} i almindeligt hverdagssprog.
- Vælg selv en userRelation, der passer naturligt til rollen, stedet og beslutningen.
- Skriv userRelation som 2-5 ord, fx "Jonas' forælder" eller "sygeplejerske på vagten".
- title er ikke et spørgsmål. question og decisionAxis er neutrale og låser ikke en del af svaret på forhånd.
- title højst 52 tegn; landingScene og scenePrompt højst 320 tegn; question højst 150 tegn.
- choice.label højst 6 ord; description højst 120 tegn; consequence højst 180 tegn.
- exactPlace.name og address skal tilhøre en virkelig institution på det valgte sted.

Tidligere stop, som ikke må gentages:
${previous}

JSON-KRAV
- futurePressureId er præcis "${plan.pressure.id}".
- severity er "${plan.stage.severity}".
- Tilladte lokationstyper pr. område: ${JSON.stringify(locationTypesByProblemArea)}
- Tilladte lokationstyper samlet: ${options.locationTypes.join(", ")}
- Tilladte teknologier: ${options.technologies.join(", ")}
- Værdinøgler: ${valueKeys.join(", ")}

Returnér kun JSON.`;
}
