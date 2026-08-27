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

const CHILD_DILEMMA_RULES = `
SÆRLIGE REGLER FOR BØRN 7-11 ÅR
- Scenen skal være noget, et barn selv oplever i dag: skole, venner, spil, sport, transport, mad eller hjem.
- Fremtiden må kun bestå af én synlig ændring. Enten gør en computer, robot eller smart ting noget nyt, eller også ændrer varme, regn, vand, strøm, mad eller natur dagens plan. Bland ikke flere fremtidssystemer sammen.
- Vis teknologien gennem dens handling. Skriv fx "skolens computer vælger grupper" — ikke AI, algoritme, model, data eller system.
- Barnet må kun vælge sin egen næste handling. Barnet må ikke styre en skole, by, butik, behandling, fordeling eller offentlig ordning.
- Den konkrete scene skal stadig åbne et stort spørgsmål om fx selvbestemmelse, venskab, retfærdighed, sandhed eller hvilken fremtid barnet ønsker. Enkel er ikke det samme som ligegyldig.
- Brug højst to navngivne personer ud over barnet. Ingen ukendte voksne eller institutioner må pludselig blive en del af valget.
- landingScene: præcis to meget korte sætninger. scenePrompt: højst tre korte sætninger. Hver sætning skal kun forklare én ting.
- title: højst 8 ord. question: højst 9 ord. choice.label: højst 5 ord. choice.description og consequence: højst 24 ord hver.
- Spørgsmålet skal kunne besvares uden at forstå ord som regler, adgang, samtykke, kapacitet, ressourcer, prioritering eller rettigheder.
- De fire svar er fire enkle ting, barnet kan gøre nu. Beskriv den konkrete pris med "men". Skriv ikke, hvilke værdier svaret viser.

GOD FORM: "Skolens computer har lavet jeres grupper. Din ven står alene, men din gruppe er næsten færdig. Hvad gør du?"
DÅRLIG FORM: "Hvordan bør skolen balancere algoritmisk effektivitet og social inklusion?"
`;

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
  const childRules = audience.id === "child" ? CHILD_DILEMMA_RULES : "";
  const rolePerspective = `
- Realistisk agency: ${audience.agencyExamples.join("; ")}.
- Nære relationer: ${audience.relationshipTypes.join("; ")}.
- Konkrete stakes: ${audience.relevantStakes.join("; ")}.
- Naturlige kontekster: ${audience.naturalContexts.join("; ")}.
- Ansvar rollen ikke har: ${audience.forbiddenResponsibilities.join("; ")}.
- Sprog: ${audience.complexityGuidance}`;

  return `Skab ét stærkt, menneskeligt World 2046-dilemma på ${languageName}.

WORLD 2046-LØFTET
Deltageren møder en væsentlig fremtidsudvikling inden for kunstig intelligens, robotter og automatisering, klima og ressourcer, sundhed og bioteknologi, data og identitet eller tillid og autenticitet. Situationen skal få spilleren til at tænke: "Hvis verden faktisk bliver sådan her i 2046, hvad synes jeg så om det, og hvad ville jeg selv vælge?"

Byg altid i denne retning:
STOR FREMTIDSUDVIKLING → NY NORMAL I 2046 → PERSONLIG KONSEKVENS → SVÆRT MENNESKELIGT VALG.

Byg aldrig i denne retning:
LILLE HVERDAGSHÆNDELSE → FUTURISTISK GADGET → PRAKTISK IRRITATION → FIRE LØSNINGSFORSLAG.

RÅMATERIALE FRA FREMTIDEN
- Pres frem mod 2046: ${plan.pressure.pressure}
- En samfundsløsning, der er blevet normal i 2046: ${plan.response}
- Vælg ét problemområde: ${plan.problemAreas.join(", ")}
- ${geography}

Råmaterialet er retning, ikke færdig tekst. Find den store mulighed eller udfordring inde i det. Den nye normal skal have en reel gevinst, som forklarer, hvorfor mennesker accepterede den. Den samme gevinst skal skabe en ny menneskelig pris eller grænse: "Vi løste X — men løsningen gjorde Y svært." Ingen ond eller defekt teknologi som genvej til konflikt.

Hvis dilemmaet næsten kunne ske på samme måde i 2026, er idéen ugyldig. Hvis fremtidsteknologien blot er et redskab, der skal bruges korrekt, er idéen ugyldig. Spilleren skal tage stilling til konsekvensen af, at teknologien eller samfundsændringen findes og er blevet normal.

ARBEJDSRÆKKEFØLGE — TÆNK DETTE I STILHED FØR DU SKRIVER JSON

1. FIND DET STORE SPØRGSMÅL
Formulér for dig selv ét interessant spørgsmål om, hvilken fremtid mennesker ønsker. Eksempler på den rette størrelse er: Hvad mister vi, hvis anonymitet forsvinder for at stoppe deepfakes? Hvornår bliver et længere og tryggere liv købt med for meget overvågning? Hvad accepterer vi, når automatiske systemer prioriterer menneskers behov? Kopiér ikke eksemplerne.

Test spørgsmålet: Hvis navnene, byen og dagens hændelse fjernes, er der så stadig et interessant og diskuterbart spørgsmål om livet i 2046? Hvis nej, kassér idéen.

2. FIND KONFLIKTENS KERNE FØR SCENEN
Definér privat:
- wantA: noget spilleren oprigtigt ønsker.
- wantB: noget spilleren samtidig oprigtigt ønsker.
- costOfA: hvad eller hvem spilleren risikerer at miste ved at vælge A.
- costOfB: hvad eller hvem spilleren risikerer at miste ved at vælge B.
- whyNow: hvorfor et valg er nødvendigt nu.
- whyCannotHaveBoth: den konkrete og troværdige grund til, at spilleren ikke kan få begge ønsker.

Begge ønsker skal være menneskeligt attraktive. Begge omkostninger skal kunne mærkes af spilleren eller en allerede introduceret relation. Konflikten må ikke være et kunstigt problem om hylder, reservedele, kapacitet, adgangstrin, samtykkeformularer eller korrekt procedure.

KONFLIKTEN SKAL VÆRE NATURLIG — INGEN GAME MECHANICS
whyNow må forklare, hvorfor situationen er personligt nærværende nu, men må ikke være en kunstig nedtælling. whyCannotHaveBoth skal komme direkte fra fremtidsudviklingens menneskelige konsekvens: fx at en forudsigelse ændrer synet på et menneske, at overvågning kræver indsigt i privatlivet, at robotomsorg erstatter tid med et menneske, eller at et ubeboeligt sted ikke samtidig kan bevares som hjem.

Opfind aldrig en regel blot for at gøre valgene gensidigt udelukkende. Ingen reserveret plads, der bortfalder; intet tilbud, der udløber ved midnat; ingen point, liv, tokens, kvoter eller vilkårlig kø; ingen "vælg inden ti minutter"; ingen bindende systemregel uden en selvstændig og troværdig grund i verden. En deadline er kun gyldig, hvis den følger naturligt af hændelsen — fx at vandet allerede stiger eller en operation faktisk begynder — ikke fordi et system kræver et hurtigt svar.

Fjern den opfundne mekanisme som test. Hvis konflikten så forsvinder, var dilemmaet konstrueret og skal kasseres. Spørg derefter: Ville virkelige mennesker stadig opleve, at gevinst A naturligt medfører pris B, også uden en fortæller, der låser mulighederne? Hvis nej, find en anden konflikt.

Kassér idéen, hvis konflikten kan opløses ved at vente, hente mere information, spørge en voksen eller ekspert, slå systemet fra, vælge en manuel løsning, gøre lidt af begge dele eller lade en anden beslutte. Kassér også idéen, hvis kompromiset er det åbenlyst bedste svar.

3. TRANSFORMÉR FØRST NU KERNEN GENNEM ROLLEN
Det store spørgsmål og den grundlæggende konflikt er allerede valgt. Find nu ud af, hvordan præcis rollen ${input.role} møder den. Rollen bestemmer perspektiv, relationer, stakes, kontekst, sprog og realistiske handlinger — aldrig dilemmaets betydning.

${audience.promptContext}
${rolePerspective}
${childRules}

Brug profilen som perspektiv, ikke som en liste over historier, der skal kopieres. Vælg kun de elementer, der naturligt passer til den allerede valgte konflikt. Et barn må møde lige så store spørgsmål om AI-forudsigelser, overvågning, klima, sundhed, identitet og autonomi som en voksen; spørgsmålet rammer blot gennem barnets eget liv og egen handlekraft.

Lav transformationstesten i stilhed: Forestil dig den samme konflikt for mindst to andre roller. Hvis scenen, relationen, det mulige tab og handlingerne næsten ville være de samme, er rolle-fit for svagt. Hvis det store fremtidsspørgsmål blev mindre, fordi rollen er et barn eller en almindelig borger, er idéen ugyldig.

Spilleren oplever konsekvensen af den nye normal og vælger som sig selv. Medmindre rollen udtrykkeligt har myndighed, er spilleren ikke minister, direktør, systemadministrator eller den, der designer samfundets løsning. Spilleren skal ikke løse hele problemet, men tage personlig stilling til, hvad løsningen kræver af dem.

4. BYG DEN PERSONLIGE SCENE
Gør først nu konflikten konkret på en virkelig lokation. Stedet og en nær relation skal gøre prisen synlig, men lokationen må ikke blive pointen. En station handler ikke om en forsinkelse, men kan vise, hvad det betyder, at et automatisk system prioriterer menneskers rejser. Et hospital handler ikke om at finde den rigtige medarbejder, men kan vise prisen ved tidlig diagnose eller maskinel omsorg.

Stedet skal kunne mærkes i handlingen og exactPlace skal være en virkelig institution, som kan findes på et kort. Hvis scenen kan flyttes til et tilfældigt kontor uden at ændre konflikten, er stedet forkert.

Spilleren skal selv kunne udføre valget nu. Spørg fx "Hvad gør du?", "Hvad vælger du?", "Hvad accepterer du?", "Hvad siger du ja til?" eller "Hvad giver du afkald på?" Spørg aldrig, hvordan samfundet, kommunen eller teknologien bør indrettes.

5. FASTLÅS BESLUTNINGSAKSEN OG SKRIV FIRE REELLE POSITIONER
Formulér privat decisionAxis som én sætning: "I dette øjeblik skal spilleren beslutte ___." Den skal beskrive, hvad spilleren tager stilling til under de eksisterende vilkår — ikke hvordan situationen kan ændres. Alle fire choices skal udfylde præcis det samme tomrum på fire forskellige måder. Hvis et choice besvarer et andet spørgsmål, er hele sættet ugyldigt.

Alle fire choices skal være forskellige, forståelige positioner i præcis den samme konflikt. Hver position skal kunne opsummeres: "Jeg får eller beskytter ___, men risikerer eller opgiver ___."

- Hver handling begynder med et konkret udsagnsord og gør én ting nu.
- description er én naturlig sætning med både gevinst og pris, forbundet med "men" på dansk eller "but" på engelsk.
- consequence viser, hvad valget betyder for de mennesker, scenen allerede har introduceret. Tilføj ingen nye personer, regler eller problemer.
- Ingen choice må være åbenlyst moralsk rigtig, en nødudgang eller blot "spørg nogen".
- Ingen choice må forsøge at få systemet til at ombestemme sig, få en ny vurdering, hente mere information, bygge en teknisk løsning, bevare begge centrale gevinster, flytte beslutningen til en tredjepart, vente, prøve noget først, omgå systemet eller ændre reglerne.
- Skriv ikke fire grader af deling, kontrol eller accept. Skriv ikke fire forskellige problemer.
- Test alle seks par. Hvis A kan vælges og B straks bagefter uden at miste A's gevinst, er de ikke konkurrerende alternativer.
- Mindst to choices skal føles oprigtigt attraktive, selv efter deres pris er tydelig.

Skriv først de menneskelige handlinger. Beregn derefter valueImpacts som skjult analyse. Ord som freedom, trust, safety, equality og transparency må aldrig styre eller optræde som abstrakt ordlyd i den synlige konflikt.

6. INTERN KVALITETSKONTROL
Vurdér det færdige udkast fra 1 til 5 på hvert punkt:
- Future relevance: Det kunne ikke næsten lige så godt være 2026.
- Personal stakes: Valget betyder noget personligt.
- Trade-off: Spilleren mister noget ved alle fire valg.
- Ambiguity: Mindst to valg er oprigtigt attraktive.
- Bigger question: Scenen åbner et større spørgsmål om den fremtid, vi ønsker.
- Agency: Rollen kan selv træffe og udføre valget.
- Memorability: Situationen er værd at diskutere bagefter.
- Role fit: Agency, relation, stakes, kontekst og sprog er naturlige for rollen; en anden rolle ville ændre oplevelsen markant uden at ændre spørgsmålets størrelse.
- Natural conflict: Trade-offet følger naturligt af fremtidsudviklingen og relationen; det ville bestå uden en opfundet plads, deadline, knaphedsregel eller anden game mechanic.
- No workaround: Alle fire choices accepterer konfliktens grundvilkår og betaler en reel pris frem for at løse, omgå eller udskyde konflikten.

Hvis Future relevance, Personal stakes, Trade-off, Ambiguity, Bigger question, Agency, Memorability, Role fit eller Natural conflict er under 4, kassér hele idéens kerne og begynd igen. Hvis No workaround er under 5, behold scenens kerne, kassér alle fire choices og generér et nyt choice-sæt langs den samme decisionAxis. Returnér ikke scorerne og påstå ikke bare, at kravene er opfyldt.

JSON-FELTERNES INDHOLD
- coreTension.want og coreTension.butAlsoWant er de to konkrete menneskelige ønsker. coreTension.whyCannotHaveBoth er den uomgængelige begrænsning. Brug ikke abstrakte værdiord.
- logic.rule: Den nye praksis, som er normal på stedet i 2046.
- logic.benefit: Det store problem praksissen faktisk løser eller mindsker.
- logic.trigger: Dagens personlige hændelse, hvor løsningens pris bliver tydelig.
- logic.decision: Skriv den fastlåste decisionAxis: den ene beslutning alle fire choices besvarer.
- logic.choiceConstraint: Den naturlige menneskelige eller fysiske konsekvens, som gør positionerne uforenelige. Det må aldrig være en opfundet bortfaldsregel, deadline eller knaphedsmekanisme.
- normalized2046 beskriver præcist den nye normal, ikke blot at teknologi er blevet mere udbredt.
- landingScene er to korte sætninger: spilleren ankommer eller handler, og konflikten rammer.
- scenePrompt forklarer i almindeligt menneskesprog den nye normal, dens reelle gevinst og dens personlige pris i dag.
- stake siger konkret, hvem der får eller mister hvad. Ting og systemer er ikke hovedpersoner.
- question er direkte, personligt og neutralt.

SPROG OG FORMAT
- Skriv kort, mundret, sanseligt og konkret. Brug "du" eller "I" konsekvent.
- Nævn ikke målgruppen som en etiket og forklar ikke dilemmaets moralske tema.
- Skriv som et menneske på stedet ville fortælle situationen til en ven — ikke som en rapport, strategi, manual eller konsulent.
- title må gerne være et spørgsmål, men må ikke navngive den abstrakte værdikonflikt.
- title højst 52 tegn; landingScene og scenePrompt højst 280 tegn; stake højst 150 tegn; question højst 150 tegn.
- choice.label højst 6 ord; description højst 120 tegn; consequence højst 180 tegn.
- exactPlace.name og address skal tilhøre en virkelig institution på det valgte sted.

TIDLIGERE STOP, SOM IKKE MÅ GENTAGES I EMNE, LAND ELLER KONFLIKT
${previous}

TEKNISKE JSON-KRAV
- Returnér præcis den krævede JSON-struktur og ingen tekst uden for JSON.
- futurePressureId er præcis "${plan.pressure.id}".
- severity er præcis "${plan.severity}".
- problemArea er ét af de angivne områder, og locationType er tilladt for netop det område.
- Hvert choice.valueImpacts har alle ti værdinøgler; kun 3-5 er forskellige fra 0. Skriv 0 for resten.
- Tilladte lokationstyper pr. område: ${JSON.stringify(allowedLocationsByArea)}
- Tilladte teknologier: ${options.technologies.join(", ")}
- Værdinøgler: ${valueKeys.join(", ")}

Returnér kun JSON.`;
}
