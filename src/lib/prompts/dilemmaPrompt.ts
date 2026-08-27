import { locationTypesByProblemArea } from "@/data/taxonomies";
import { getAudienceProfile } from "@/lib/audience";
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
  const audience = getAudienceProfile(input.role);
  const plan = input.generationPlan ?? planRound(input.previousDilemmas, undefined, undefined, audience.preferredProblemAreas);
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
  const allowedLocationsByArea = Object.fromEntries(
    plan.problemAreas.map((area) => {
      const audienceLocations = locationTypesByProblemArea[area].filter((location) =>
        audience.preferredLocationTypes.includes(location),
      );
      return [area, audienceLocations.length ? audienceLocations : locationTypesByProblemArea[area]];
    }),
  );

  return `Skriv ét menneskeligt World 2046-dilemma på ${languageName}.

DU FÅR KUN FIRE BYGGESTEN
- En virkelig lokation, der kan findes på et kort.
- En spiller i rollen ${input.role}.
- Én ny hverdagsting, som er normal i 2046.
- Ét valg, spilleren selv skal træffe nu.

Målgruppen er: ${input.role}. ${audience.promptContext}

Begynd med dette enkle øjeblik: "Du er [en almindelig rolle] på [stedet]. Du prøver at [et konkret mål inden for de næste ti minutter]. I 2046 er [én ny ordning eller teknologi] blevet normal. Nu rammer den dig og [en anden person] på hver sin måde." Skriv ikke denne skabelon ordret i svaret; brug den til at finde scenen.

Stedet skal kunne mærkes i handlingen. En skole handler om en time, en ven eller en opgave; et supermarked om noget, man skal købe; en station om en rejse; et hospital om et møde med behandling eller omsorg. Hvis scenen kan flyttes til et tilfældigt kontor uden at ændre sig, er stedet forkert.

Spilleren må kun vælge noget, rollen reelt kan gøre eller sige. Et barn driver ikke en butik, fordeler ikke strøm, bestemmer ikke over en skole og giver ikke andre medicinske råd eller vælger deres behandling. På et hospital kan barnet vælge over eget samtykke, hvem det spørger om hjælp, eller hvad det selv gør. En ung, forælder eller medarbejder bliver heller ikke pludselig leder eller myndighed.

RÅMATERIALE FRA FREMTIDEN
- Pres frem mod 2046: ${plan.pressure.pressure}
- En mulig samfundsløsning, som nu er hverdag: ${plan.response}
- Vælg ét problemområde: ${plan.problemAreas.join(", ")}
- ${geography}

Råmaterialet er baggrund, ikke tekst der skal gentages. Oversæt det til en følge, man kan se eller mærke i hverdagen. 2046-tingen skal både hjælpe og skabe dagens konflikt. Hvis dilemmaet næsten kan ske på samme måde i 2026, skal det skrives om.

Konflikten skal ligge mellem to forståelige menneskelige ønsker. Den må ikke være et kunstigt problem om at fordele hylder, maskiner, reservedele, kapacitet eller "ressourcer", medmindre spillerens almindelige job faktisk er at gøre netop det. For børn og unge skal teknologien ændre noget i et venskab, et løfte, en skoleopgave, privatliv, retfærdighed, tid, familie eller muligheden for selv at vælge.

Udfyld logic som en kort intern skitse af de samme fire ting:
- rule: Den praksis, som er normal på stedet i 2046.
- benefit: Den konkrete gevinst eller risiko, praksissen håndterer.
- trigger: Dagens hændelse, hvor prisen bliver tydelig.
- decision: Det konkrete valg, brugeren selv kan træffe nu.

DEN SYNLIGE TEKST
- landingScene er to korte sætninger: spilleren gør noget genkendeligt, og problemet opstår.
- scenePrompt forklarer med almindelige ord, hvad der er normalt i 2046, hvorfor det hjælper, og hvorfor det giver et svært valg netop i dag.
- stake handler altid om mennesker. Skriv hvem der får eller mister hvad i dag. Ting må ikke være hovedpersoner: skriv aldrig fx "mælken må vente", "reservedelen kan kun bruges ét sted" eller "kapaciteten skal fordeles".
- question spørger direkte "Hvad gør du?", "Hvad vælger du?" eller "Hvad siger du ja til?" — aldrig hvordan samfundet bør indrettes.

Læs den synlige tekst højt. Hvis den lyder som en rapport, en kommunal plan, en manual eller en forklaring fra en konsulent, så skriv den om, som et menneske på stedet ville fortælle den til en ven. Forklar én årsag ad gangen. Brug kendte ord frem for sammensatte fremtidsord.

DE FIRE SVAR
Skriv først den menneskelige scene. Skriv derefter fire forskellige handlinger, der alle svarer direkte på samme spørgsmål. Scor først de færdige handlinger med valueImpacts; værdierne må aldrig forme den synlige tekst.

Hver handling begynder med et konkret udsagnsord og gør én ting nu. description skal være én naturlig sætning med både gevinst og pris, bundet sammen med "men" på dansk eller "but" på engelsk. Et svar uden en tydelig pris bliver afvist. consequence fortæller, hvad valget betyder for de mennesker, scenen allerede har introduceret. Ingen nye regler, personer eller problemer må dukke op i svarene.

Svarene skal konkurrere i øjeblikket. Test alle seks par: Hvis spilleren kan vælge A og straks bagefter også gøre B uden at miste gevinsten ved A, er de to svar ikke alternativer og skal skrives om. Når ét svar er valgt, skal de tre andre reelt være lukket i det konkrete øjeblik. Hvis ét svar er tydeligt bedst uden en reel pris, er det ikke et dilemma. Hvis ét svar bare er "spørg en voksen/medarbejder", og det opløser hele konflikten, skal scenen skrives om. Ingen fire grader af samme handling.

coreTension er want, butAlsoWant og whyCannotHaveBoth med menneskelige ønsker og uden værdiord.

SPROG OG FORMAT
- Skriv kort, mundret og konkret. Brug "du" eller "I" konsekvent.
- Brug målgruppekonteksten ovenfor, men nævn ikke målgruppen som en etiket.
- title må gerne være et spørgsmål, men må ikke navngive en abstrakt værdikonflikt.
- title højst 52 tegn; landingScene og scenePrompt højst 280 tegn; stake højst 150 tegn; question højst 150 tegn.
- choice.label højst 6 ord; description højst 120 tegn; consequence højst 180 tegn.
- exactPlace.name og address skal tilhøre en virkelig institution på det valgte sted.

Tidligere stop, som ikke må gentages:
${previous}

JSON-KRAV
- futurePressureId er præcis "${plan.pressure.id}".
- severity er "${plan.severity}".
- problemArea er ét af de angivne områder, og locationType skal være tilladt for netop det område.
- Hvert choice.valueImpacts skal have alle ti værdinøgler; kun 3-5 må være forskellige fra 0. Skriv 0 for resten.
- Tilladte lokationstyper for det valgte område: ${JSON.stringify(allowedLocationsByArea)}
- Tilladte teknologier: ${options.technologies.join(", ")}
- Værdinøgler: ${valueKeys.join(", ")}

Returnér kun JSON.`;
}
