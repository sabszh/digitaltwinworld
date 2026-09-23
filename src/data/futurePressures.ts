import type { FutureTechnology, ProblemArea } from "@/types/world2046";

/**
 * The stable future space World 2046 is built on.
 *
 * Every dilemma starts from a documented pressure on the world between now and
 * roughly 2050 — the broad directions found across WEF Global Risks, EU
 * Strategic Foresight, UN DESA, WHO, OECD, WMO, IPCC, IPBES, IEA, FAO and World
 * Bank horizon work. Nothing here is a prediction with a number in it: the point
 * is a plausible direction of travel, not a forecast.
 *
 * `responses` is the part that matters most. Each one is a societal answer that
 * has had twenty years to become ordinary — the thing a person in 2046 no longer
 * remarks on. Dilemmas are built from the *response*, not from the pressure, so
 * the player meets the second-order problem a working solution created rather
 * than the crisis itself.
 */
export type PressureFamily =
  | "klima og natur"
  | "mennesker og bevægelse"
  | "sundhed og omsorg"
  | "arbejde og økonomi"
  | "tillid og information"
  | "systemer og forsyning";

export type FuturePressure = {
  id: string;
  family: PressureFamily;
  /** The primary mechanism that makes this pressure tangible in product metadata. */
  technology: FutureTechnology;
  /** The pressure itself. Never the dilemma — only the reason the world looks different. */
  pressure: string;
  /** Twenty years of societal response, already normal by 2046. One of these
   *  (or a close sibling) is what the dilemma actually takes place inside. */
  responses: string[];
  /** Where this pressure tends to surface. Advisory: the model may pick another
   *  area if the situation genuinely belongs there. */
  problemAreas: ProblemArea[];
};

export const futurePressures: FuturePressure[] = [
  {
    id: "extreme-heat",
    family: "klima og natur",
    technology: "klimatvilling",
    pressure: "Flere og længere hedebølger presser byer, boliger og alt udearbejde",
    responses: [
      "arbejdsdagen er delt omkring middagen store dele af året, og skoler og arbejdspladser følger samme rytme",
      "offentlige kølerum står åbne i hvert kvarter, og nogle boligblokke har fælles sovesale på de varmeste nætter",
      "byens træer og skygge er blevet en tildelt ressource, som kvarterer søger om",
    ],
    problemAreas: ["Klima, energi og resiliens", "Mobilitet, byliv og bolig", "Arbejde og arbejdsliv"],
  },
  {
    id: "flooding",
    family: "klima og natur",
    technology: "bydigital tvilling",
    pressure: "Gentagne oversvømmelser og stigende havniveau gør nogle områder svære at forsikre",
    responses: [
      "boliger tæt på vandet kan kun forsikres gennem fælles ordninger, og huslejen afhænger af, hvor tit området lukkes",
      "hele kvarterer er bygget om til at kunne stå under vand nogle uger om året",
      "nogle familier har to adresser: en til den tørre del af året og en til resten",
    ],
    problemAreas: ["Klima, energi og resiliens", "Mobilitet, byliv og bolig"],
  },
  {
    id: "drought",
    family: "klima og natur",
    technology: "vandbudgettering",
    pressure: "Tørke og vandmangel rammer også egne, der før havde vand nok",
    responses: [
      "hver husstand har et vandbudget, der kan flyttes mellem husstande og gemmes fra måned til måned",
      "genbrugsvand er standard i boligbyggeri, og drikkevand er en særskilt, dyrere ting",
      "haver, marker og svømmehaller åbner og lukker efter sæsonens vandbudget",
    ],
    problemAreas: ["Mad, vand og forsyning", "Klima, energi og resiliens"],
  },
  {
    id: "food-systems",
    family: "klima og natur",
    technology: "vertikale farme",
    pressure: "Fødevaresystemerne er pressede af vejr, jord og transportomkostninger",
    responses: [
      "en stor del af grøntsagerne dyrkes inde i byen, og sæsonvarer er blevet dyrere end det, der vokser under lys",
      "supermarkedernes priser følger høsten fra uge til uge i stedet for at være faste",
      "skoler, kantiner og plejehjem køber ind gennem fælles lokale fødevarefællesskaber",
    ],
    problemAreas: ["Mad, vand og forsyning", "Sundhed og omsorg"],
  },
  {
    id: "biodiversity",
    family: "klima og natur",
    technology: "klimatvilling",
    pressure: "Pladsen skal deles mellem natur, energi, boliger og landbrug",
    responses: [
      "store områder er lagt tilbage til natur, og adgangen til dem er begrænset til bestemte dage",
      "nye boliger må kun bygges, hvis der er givet plads til natur et andet sted i kommunen",
      "landmænd får betaling for det, jorden binder, ikke kun for det, den producerer",
    ],
    problemAreas: ["Klima, energi og resiliens", "Mad, vand og forsyning", "Mobilitet, byliv og bolig"],
  },
  {
    id: "climate-migration",
    family: "mennesker og bevægelse",
    technology: "bydigital tvilling",
    pressure: "Klima og ressourcer flytter mennesker — inden for lande og mellem dem",
    responses: [
      "byer har fået nye kvarterer, hvor to og tre sprog er hverdag i skolen og på arbejdspladsen",
      "nogle regioner tager imod efter faste årlige aftaler i stedet for fra sag til sag",
      "det er normalt at bo et sted en del af året og et andet sted resten",
    ],
    problemAreas: ["Mobilitet, byliv og bolig", "Uddannelse og læring", "Arbejde og arbejdsliv"],
  },
  {
    id: "ageing",
    family: "mennesker og bevægelse",
    technology: "sensorbolig",
    pressure: "Mange flere ældre og forholdsvis færre i den arbejdsdygtige alder",
    responses: [
      "de fleste bliver boende hjemme til det sidste, og hjemmet er fyldt med ting, der holder øje",
      "pensionering er blevet en glidende ting over mange år frem for en dato",
      "flere generationer bor sammen igen, ofte i boliger, der er bygget til netop det",
    ],
    problemAreas: ["Sundhed og omsorg", "Arbejde og arbejdsliv", "Mobilitet, byliv og bolig"],
  },
  {
    id: "living-norms",
    family: "mennesker og bevægelse",
    technology: "algoritmisk planlægning",
    pressure: "Normerne for familie, uddannelse og omsorg har flyttet sig",
    responses: [
      "man tager uddannelse i korte stykker hele livet i stedet for i én lang ungdom",
      "omsorg for gamle forældre er noget, kolleger planlægger omkring, ligesom barsel",
      "venner og naboer står formelt registreret som dem, der henter og passer",
    ],
    problemAreas: ["Uddannelse og læring", "Sundhed og omsorg", "Arbejde og arbejdsliv"],
  },
  {
    id: "housing-patterns",
    family: "mennesker og bevægelse",
    technology: "sensorbolig",
    pressure: "Hvor og hvordan folk bor har ændret sig med priser, klima og arbejde",
    responses: [
      "boliger deles i højere grad, og fælles køkkener og værksteder er normale i nybyggeri",
      "det er blevet almindeligt at leje sin bolig hele livet, med lange, arvelige lejekontrakter",
      "kontorbygninger er lavet om til boliger, og bydele skifter funktion fra årti til årti",
    ],
    problemAreas: ["Mobilitet, byliv og bolig", "Arbejde og arbejdsliv"],
  },
  {
    id: "care-workforce",
    family: "sundhed og omsorg",
    technology: "omsorgsrobot",
    pressure: "Der er ikke hænder nok til omsorg, og de findes ikke ved at ansætte flere",
    responses: [
      "en del af omsorgen ligger hos pårørende, der får den skrevet ind i deres arbejdsuge",
      "hjemmet er blevet det sted, hvor det meste behandling foregår, og hospitalet er til det korte",
      "faste besøg er erstattet af besøg, der bestilles, når noget faktisk ændrer sig",
    ],
    problemAreas: ["Sundhed og omsorg", "Arbejde og arbejdsliv"],
  },
  {
    id: "pandemic-readiness",
    family: "sundhed og omsorg",
    technology: "sundhedsdata",
    pressure: "Beredskabet mod smitte er blevet en permanent del af hverdagen",
    responses: [
      "skoler, kontorer og transport skifter mellem normal og forsigtig tilstand nogle uger om året",
      "luften i offentlige rum måles løbende, og tal fra den hænger frit tilgængeligt",
      "man kan arbejde og gå i skole hjemmefra på få timers varsel, og det er ingen sag længere",
    ],
    problemAreas: ["Sundhed og omsorg", "Uddannelse og læring", "Arbejde og arbejdsliv"],
  },
  {
    id: "antibiotic-resistance",
    family: "sundhed og omsorg",
    technology: "AI-triage",
    pressure: "Antibiotika virker ikke længere lige så bredt som før",
    responses: [
      "de virksomme midler er reserveret, og adgangen til dem afgøres et andet sted end på klinikken",
      "små indgreb udskydes eller flyttes til steder med lavere risiko for smitte",
      "det er blevet normalt at blive testet grundigt, før man får noget som helst mod en infektion",
    ],
    problemAreas: ["Sundhed og omsorg", "Digital tillid, rettigheder og styring"],
  },
  {
    id: "automation",
    family: "arbejde og økonomi",
    technology: "automation",
    pressure: "En stor del af det, folk før blev betalt for, gøres nu af systemer",
    responses: [
      "mange job er blevet til at holde øje med, rette op på og tage ansvar for noget, der kører selv",
      "arbejdsuger er kortere i nogle brancher, og lønnen følger ikke længere timerne",
      "omskoling er en tilbagevendende ting, man gør flere gange i sit arbejdsliv",
    ],
    problemAreas: ["Arbejde og arbejdsliv", "Uddannelse og læring"],
  },
  {
    id: "labour-shortage",
    family: "arbejde og økonomi",
    technology: "omskolings-AI",
    pressure: "Der mangler folk til bestemte fag, og det kan ikke løses med løn alene",
    responses: [
      "de samme faglærte deles mellem flere kommuner og virksomheder efter en fælles plan",
      "folk arbejder i to eller tre fag samtidig, og det er blevet den almindelige måde",
      "opgaver, der før krævede en fagperson på stedet, løses nu på afstand fra et andet land",
    ],
    problemAreas: ["Arbejde og arbejdsliv", "Sundhed og omsorg"],
  },
  {
    id: "inequality",
    family: "arbejde og økonomi",
    technology: "kommunal beslutnings-AI",
    pressure: "Forskellen mellem dem, der har, og dem, der ikke har, er blevet mere synlig i hverdagen",
    responses: [
      "de samme tjenester findes i en hurtig og en langsom udgave, og alle kan se hvilken kø de står i",
      "en grundydelse er blevet normal, og diskussionen handler om, hvad man skal gøre for at få den",
      "adgang til køling, vand og transport afhænger mere af, hvor man bor, end af hvad man tjener",
    ],
    problemAreas: ["Arbejde og arbejdsliv", "Mobilitet, byliv og bolig", "Digital tillid, rettigheder og styring"],
  },
  {
    id: "power-concentration",
    family: "arbejde og økonomi",
    technology: "personlig data-agent",
    pressure: "Få aktører sidder på de systemer, data og modeller, alle andre bruger",
    responses: [
      "kommuner og hospitaler lejer de systemer, de er helt afhængige af, og kan ikke flytte dem",
      "nogle regioner har bygget deres egne, langsommere alternativer og holder fast i dem",
      "det er blevet et krav, at man kan tage sine egne oplysninger med sig, når man skifter",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Arbejde og arbejdsliv"],
  },
  {
    id: "new-work-forms",
    family: "arbejde og økonomi",
    technology: "AI-ledelse",
    pressure: "Nye former for arbejde og ejerskab er vokset frem uden for det faste job",
    responses: [
      "folk ejer små andele af det udstyr og de systemer, de arbejder med, i fællesskab",
      "opgaver fordeles gennem fælles puljer, som man selv melder sig ind og ud af",
      "en personlig agent forhandler tider, takster og vilkår på ens vegne, mens man sover",
    ],
    problemAreas: ["Arbejde og arbejdsliv", "Digital tillid, rettigheder og styring"],
  },
  {
    id: "synthetic-media",
    family: "tillid og information",
    technology: "deepfake-detektion",
    pressure: "Billeder, stemmer og video kan laves af hvem som helst og ligner virkeligheden",
    responses: [
      "det er blevet normalt at bede om bevis for, at man taler med et menneske",
      "vigtige samtaler foregår ansigt til ansigt igen, fordi det er den nemmeste form for bevis",
      "optagelser gemmes med spor om, hvor de kommer fra, og spor uden oprindelse tages ikke alvorligt",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Uddannelse og læring"],
  },
  {
    id: "institutional-trust",
    family: "tillid og information",
    technology: "kommunal beslutnings-AI",
    pressure: "Tilliden til institutioner er ujævn og skal genvindes lokalt",
    responses: [
      "afgørelser følges af en åben begrundelse, som alle kan slå op og gå videre med",
      "lokale råd af almindelige mennesker afgør ting, som forvaltningen før afgjorde alene",
      "folk vælger selv, hvilken instans de vil have til at afgøre deres sag",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Sundhed og omsorg"],
  },
  {
    id: "digital-identity",
    family: "tillid og information",
    technology: "digital ID-wallet",
    pressure: "Man skal kunne bevise, hvem man er, og at man er et menneske",
    responses: [
      "en personlig legitimation åbner det meste, fra transport til sundhed til skolens systemer",
      "man kan vise en enkelt egenskab — alder, bopæl, uddannelse — uden at vise resten",
      "børn og unge har deres egen, snævrere legitimation, som forældre kan se dele af",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Uddannelse og læring"],
  },
  {
    id: "surveillance",
    family: "tillid og information",
    technology: "personlig data-agent",
    pressure: "Der findes flere spor efter almindelige mennesker, end nogen kan overskue",
    responses: [
      "det er normalt at kunne se, hvem der har set på ens egne oplysninger, og hvornår",
      "arbejdspladser og skoler måler langt mere, men må kun bruge det til bestemte, aftalte ting",
      "nogle steder er der bevidst indrettet rum og tider, hvor intet registreres",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Arbejde og arbejdsliv"],
  },
  {
    id: "cyber-infrastructure",
    family: "systemer og forsyning",
    technology: "dynamisk infrastruktur",
    pressure: "Angreb på kritiske systemer er en normal driftsrisiko, ikke en undtagelse",
    responses: [
      "vigtige tjenester har en langsom, manuel udgave, der øves fast nogle gange om året",
      "systemer lukkes ned regionsvis efter en fast rækkefølge, når noget er galt",
      "det er blevet almindeligt at kunne betale, rejse og få hjælp uden net i nogle dage",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Klima, energi og resiliens"],
  },
  {
    id: "grid-capacity",
    family: "systemer og forsyning",
    technology: "AI-styret elnet",
    pressure: "Der er strøm nok over året, men ikke altid nok på samme tid",
    responses: [
      "priser og adgang skifter i løbet af dagen, og apparater i hjemmet venter selv på de billige timer",
      "store forbrugere som datacentre og fabrikker skruer ned efter aftale, når nettet er presset",
      "kvarterer har fælles batterier, og hvad de bruges til, afgøres lokalt",
    ],
    problemAreas: ["Klima, energi og resiliens", "Mobilitet, byliv og bolig"],
  },
  {
    id: "ai-infrastructure",
    family: "systemer og forsyning",
    technology: "datacenter-varme",
    pressure: "AI-modeller og de tjenester, de driver, kræver enorme mængder strøm, køling og fysisk infrastruktur",
    responses: [
      "datacentre er koblet til byers varme- og elnet, så deres overskudsvarme er blevet en vigtig del af den lokale forsyning",
      "store modelkørsler flyttes automatisk mellem regioner efter elnet, varmebehov og vandtilgængelighed",
      "kommuner forhandler lokale ressourcevilkår med datacentre, fordi den digitale kapacitet er blevet lige så nødvendig som anden forsyning",
    ],
    problemAreas: ["Klima, energi og resiliens", "Mad, vand og forsyning", "Digital tillid, rettigheder og styring"],
  },
  {
    id: "critical-minerals",
    family: "systemer og forsyning",
    technology: "forsynings-AI",
    pressure: "De materialer, alt elektronik bygger på, er svære at få fat i",
    responses: [
      "apparater skal kunne repareres og skilles ad, og de holder meget længere end før",
      "man lejer sig ind på udstyr i stedet for at eje det, og det skifter hænder mange gange",
      "kommuner og hospitaler venter i kø på udstyr, og køen er blevet en fast del af planlægningen",
    ],
    problemAreas: ["Klima, energi og resiliens", "Sundhed og omsorg", "Mad, vand og forsyning"],
  },
  {
    id: "supply-chains",
    family: "systemer og forsyning",
    technology: "forsynings-AI",
    pressure: "Forsyningskæderne er kortere, dyrere og mere sårbare end i 2020'erne",
    responses: [
      "meget produceres tæt på, i mindre mængder, og udvalget er smallere end før",
      "reservedele printes lokalt, og det er normalt, at en ting ikke er helt som den oprindelige",
      "lagre er store igen, og nogle varer kan kun bestilles på bestemte tider af året",
    ],
    problemAreas: ["Mad, vand og forsyning", "Klima, energi og resiliens", "Arbejde og arbejdsliv"],
  },
  {
    id: "geopolitical-fragmentation",
    family: "systemer og forsyning",
    technology: "personlig data-agent",
    pressure: "Verden hænger ikke sammen på samme måde, og aftaler går på tværs af blokke",
    responses: [
      "det afhænger af, hvor man er, hvilke tjenester og apparater der virker",
      "unge tager kortere ophold i udlandet efter faste aftaler mellem regioner",
      "data om mennesker må ikke forlade den region, de er født i",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Uddannelse og læring", "Arbejde og arbejdsliv"],
  },
  {
    id: "tech-fragmentation",
    family: "systemer og forsyning",
    technology: "personlig data-agent",
    pressure: "Regionerne har bygget teknologi, der ikke taler ordentligt sammen",
    responses: [
      "en tilflytters papirer, prøver og eksamener skal oversættes af mennesker, før de gælder",
      "arbejdspladser holder to sæt systemer kørende, fordi kunder og kolleger er på hver sit",
      "de samme oplysninger findes i flere udgaver, og de er ikke altid enige",
    ],
    problemAreas: ["Digital tillid, rettigheder og styring", "Sundhed og omsorg", "Uddannelse og læring"],
  },
];

/** Rotated as whole families so a journey never spends two stops on neighbouring
 *  pressures — heat and drought back to back read as the same stop twice. */
export const pressureFamilies: PressureFamily[] = [
  "klima og natur",
  "mennesker og bevægelse",
  "sundhed og omsorg",
  "arbejde og økonomi",
  "tillid og information",
  "systemer og forsyning",
];

export const pressuresById = new Map(futurePressures.map((pressure) => [pressure.id, pressure]));
/** @deprecated Research/provenance data; production authoring uses futureDevelopments. */
