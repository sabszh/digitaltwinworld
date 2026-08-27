import type { FutureDevelopment, FutureTheme, UserRole } from "@/types/world2046";

const development = (
  id: string,
  text: string,
  themes: FutureTheme[],
  options: Pick<FutureDevelopment, "suitableRoles" | "unsuitableRoles" | "contexts" | "pressureIds"> = {},
): FutureDevelopment => ({ id, development: text, themes, ...options });

/**
 * Curated building blocks for World 2046 authoring.
 *
 * Each entry describes only what has become possible or normal. It deliberately
 * does not name a conflict, a value pair or a preferred decision axis. Those
 * belong to the new situation Terra writes for the selected role.
 */
export const futureDevelopments: FutureDevelopment[] = [
  // AI og beslutninger
  development("ai-detects-distress", "AI kan opdage mistrivsel, før mennesker selv fortæller om den", ["AI og beslutninger", "Sundhed og bioteknologi", "Uddannelse"], { contexts: ["skole", "arbejde", "hjem"] }),
  development("ai-predicts-dropout", "AI kan forudsige risiko for frafald længe før en elev forlader sin uddannelse", ["AI og beslutninger", "Uddannelse"]),
  development("ai-detects-burnout", "AI kan opdage tegn på stress og udbrændthed gennem almindeligt arbejde", ["AI og beslutninger", "Arbejde", "Sundhed og bioteknologi"]),
  development("ai-simulates-life-choices", "AI kan vise sandsynlige følger af forskellige uddannelses-, job- og livsvalg", ["AI og beslutninger", "Uddannelse", "Arbejde"]),
  development("agents-act-for-people", "Personlige AI-agenter kan købe, booke og indgå hverdagsaftaler på menneskers vegne", ["AI og beslutninger", "Relationer, familie og hverdagsliv"]),
  development("ai-knows-preferences", "AI kan forudsige menneskers præferencer, før de selv har formuleret dem", ["AI og beslutninger", "Data, identitet og privatliv"]),
  development("ai-prioritises-resources", "AI kan prioritere knappe ressourcer løbende, når mange har brug for dem samtidig", ["AI og beslutninger", "Offentlige systemer og demokrati"], { unsuitableRoles: ["Barn"] }),
  development("ai-evaluates-work", "AI kan vurdere kompetencer gennem menneskers løbende arbejde i stedet for prøver og ansøgninger", ["AI og beslutninger", "Uddannelse", "Arbejde"]),
  development("ai-mediates-conflicts", "AI kan fungere som neutral mellemmand i konflikter og foreslå formuleringer, begge parter kan acceptere", ["AI og beslutninger", "Relationer, familie og hverdagsliv"]),
  development("ai-predicts-needs", "Personlige AI-systemer kan forberede hjælp og muligheder, før et menneske selv beder om dem", ["AI og beslutninger", "Offentlige systemer og demokrati"]),

  // Robotter og autonome systemer
  development("robots-personal-care", "Robotter kan hjælpe mennesker med bad, påklædning og andre intime hverdagsopgaver", ["Robotter og autonome systemer", "Sundhed og bioteknologi"], { suitableRoles: ["Fagperson", "Forælder", "Borger", "For alle"] }),
  development("social-robots-lasting", "Sociale robotter kan være faste relationer, der husker et menneske gennem mange år", ["Robotter og autonome systemer", "Relationer, familie og hverdagsliv"]),
  development("robots-watch-children", "Robotter kan passe børn sikkert i korte perioder og kontakte voksne ved behov", ["Robotter og autonome systemer", "Relationer, familie og hverdagsliv"], { suitableRoles: ["Barn", "Forælder", "Lærer / pædagog"] }),
  development("robots-teach-one-student", "Robotter kan undervise en enkelt elev fysisk og tilpasse sig elevens tempo", ["Robotter og autonome systemer", "Uddannelse"]),
  development("remote-specialist-robots", "Specialister kan undersøge, reparere og behandle fysisk gennem robotter på stor afstand", ["Robotter og autonome systemer", "Sundhed og bioteknologi", "Arbejde"]),
  development("driverless-transport-normal", "Det meste hverdags- og varetransport kan køre uden en menneskelig chauffør", ["Robotter og autonome systemer", "Klima, energi og ressourcer"]),
  development("robots-dangerous-work", "Robotter kan udføre det meste farlige fysiske arbejde i miner, brande og katastrofeområder", ["Robotter og autonome systemer", "Arbejde"]),
  development("delivery-robots-everywhere", "Små autonome robotter kan levere varer gennem byer og boligområder døgnet rundt", ["Robotter og autonome systemer", "Relationer, familie og hverdagsliv"]),
  development("home-robots-coordinate", "Flere robotter i et hjem kan fordele rengøring, madlavning og praktisk hjælp mellem sig", ["Robotter og autonome systemer", "Relationer, familie og hverdagsliv"]),
  development("autonomous-farms", "Landbrug kan drives næsten hele døgnet af autonome maskiner, der passer hver plante og hvert dyr", ["Robotter og autonome systemer", "Klima, energi og ressourcer", "Arbejde"]),

  // Sundhed og bioteknologi
  development("disease-before-symptoms", "Sygdom kan ofte opdages flere år før de første symptomer", ["Sundhed og bioteknologi"]),
  development("continuous-body-sensors", "Små sensorer kan følge kroppens tilstand kontinuerligt gennem hele livet", ["Sundhed og bioteknologi", "Data, identitet og privatliv"]),
  development("personalised-medicine", "Medicin kan tilpasses den enkelte persons biologi og ændres løbende", ["Sundhed og bioteknologi"]),
  development("diagnosis-at-home", "Mange diagnoser kan stilles hjemme med sensorer og fjernkontakt til en fagperson", ["Sundhed og bioteknologi", "Robotter og autonome systemer"]),
  development("voice-movement-diagnosis", "Sygdom kan nogle gange opdages gennem små ændringer i stemme, ansigt og bevægelse", ["Sundhed og bioteknologi", "AI og beslutninger"]),
  development("genetic-risk-decades", "Genetiske risikoprofiler kan sige noget om sygdom flere årtier frem", ["Sundhed og bioteknologi", "Data, identitet og privatliv"]),
  development("prevent-genetic-disease", "Flere alvorlige genetiske sygdomme kan forebygges før et barn bliver født", ["Sundhed og bioteknologi"], { unsuitableRoles: ["Barn", "Ung"] }),
  development("personal-grown-organs", "Væv og organer kan dyrkes ud fra en persons egne celler", ["Sundhed og bioteknologi"]),
  development("digital-memory-support", "Digitale systemer kan genkende mennesker, steder og aftaler og støtte en svækket hukommelse", ["Sundhed og bioteknologi", "Relationer, familie og hverdagsliv"]),
  development("independent-ageing", "Ældre kan bo alene væsentligt længere med sensorer, robotter og hjælp på afstand", ["Sundhed og bioteknologi", "Robotter og autonome systemer", "Relationer, familie og hverdagsliv"]),

  // Data, identitet og privatliv
  development("prove-human-online", "Mennesker kan bevise digitalt, at de er virkelige mennesker uden at vise deres fulde navn", ["Data, identitet og privatliv", "Sandhed og autenticitet"]),
  development("selective-digital-id", "Digitalt ID kan bevise enkelte egenskaber som alder eller uddannelse uden at afsløre hele identiteten", ["Data, identitet og privatliv"]),
  development("lifelong-learning-record", "Lærings- og kompetencedata kan følge mennesker fra skole gennem hele arbejdslivet", ["Data, identitet og privatliv", "Uddannelse", "Arbejde"]),
  development("personal-data-agents", "Personlige data-agenter kan give og fjerne adgang til oplysninger på et menneskes vegne", ["Data, identitet og privatliv", "AI og beslutninger"]),
  development("data-use-ledger", "Mennesker kan se præcist, hvem der har brugt deres oplysninger, hvornår og til hvad", ["Data, identitet og privatliv"]),
  development("tracking-free-spaces", "Nogle fysiske og digitale rum kan dokumentere, at ingen tracking finder sted", ["Data, identitet og privatliv", "Relationer, familie og hverdagsliv"]),
  development("whole-home-data-picture", "Hjemmets sensorer kan skabe et samlet billede af hele husstandens vaner og trivsel", ["Data, identitet og privatliv", "Relationer, familie og hverdagsliv"]),
  development("behavioural-identification", "Mennesker kan identificeres gennem deres stemme, bevægelse og adfærd uden at vise ID", ["Data, identitet og privatliv"]),
  development("portable-reputation", "Digitale beviser på pålidelighed og tidligere aftaler kan tages med mellem tjenester og fællesskaber", ["Data, identitet og privatliv", "Sandhed og autenticitet"]),
  development("temporary-data-identities", "Mennesker kan oprette midlertidige digitale identiteter med præcist afgrænsede rettigheder", ["Data, identitet og privatliv"]),

  // Sandhed og autenticitet
  development("synthetic-media-indistinguishable", "Syntetisk video og lyd kan være næsten umulig for mennesker at skelne fra optagelser", ["Sandhed og autenticitet", "AI og beslutninger"]),
  development("verified-media-origin", "Billeder, lyd og video kan have en verificerbar kæde fra optagelse til offentliggørelse", ["Sandhed og autenticitet", "Data, identitet og privatliv"]),
  development("verified-conversations", "Digitale samtaler kan løbende verificere, hvem der faktisk deltager", ["Sandhed og autenticitet", "Data, identitet og privatliv"]),
  development("personal-ai-clones", "AI-kloner kan tale, skrive og handle genkendeligt i et virkeligt menneskes stil", ["Sandhed og autenticitet", "Relationer, familie og hverdagsliv"]),
  development("digital-deceased", "Digitale versioner af afdøde kan fortsætte samtaler ud fra deres optagelser og beskeder", ["Sandhed og autenticitet", "Relationer, familie og hverdagsliv"]),
  development("live-fact-checking", "Faktuelle udsagn kan kontrolleres og kommenteres af AI, mens de bliver sagt", ["Sandhed og autenticitet", "AI og beslutninger"]),
  development("personalised-news-realities", "Nyheder kan genereres forskelligt til hver person ud fra deres viden, interesser og reaktioner", ["Sandhed og autenticitet", "AI og beslutninger"]),
  development("anonymous-content-downranked", "Anonymt indhold behandles nogle steder automatisk som mindre troværdigt", ["Sandhed og autenticitet", "Data, identitet og privatliv"]),
  development("authenticity-wearables", "Små personlige enheder kan markere, om en stemme eller besked sandsynligvis kommer fra den person, den påstår", ["Sandhed og autenticitet", "Data, identitet og privatliv"]),
  development("synthetic-actors", "Film, reklamer og undervisning kan bruge syntetiske personer, som aldrig har levet", ["Sandhed og autenticitet", "Arbejde"]),

  // Uddannelse
  development("adaptive-lessons", "Undervisning kan ændre tempo, forklaring og opgave automatisk fra elev til elev", ["Uddannelse", "AI og beslutninger"]),
  development("ai-finds-learning-style", "AI kan opdage, hvordan et barn lærer bedst gennem dets almindelige skolearbejde", ["Uddannelse", "AI og beslutninger"]),
  development("continuous-student-assessment", "Elever kan vurderes løbende gennem deres almindelige arbejde i stedet for enkelte prøver", ["Uddannelse", "Data, identitet og privatliv"]),
  development("competence-profiles", "Kompetenceprofiler kan bruges mere end karakterer ved uddannelse og arbejde", ["Uddannelse", "Arbejde"]),
  development("lifelong-ai-tutor", "Et barn kan have den samme AI-læringshjælper gennem mange skoleår", ["Uddannelse", "Relationer, familie og hverdagsliv"]),
  development("ai-classmates", "AI-personer kan deltage som faste gruppemedlemmer i undervisning og projektarbejde", ["Uddannelse", "AI og beslutninger"]),
  development("immersive-school-simulations", "Realistiske simulationer kan lade elever opleve historiske, naturvidenskabelige og sociale situationer", ["Uddannelse", "Sandhed og autenticitet"]),
  development("school-detects-isolation", "Skolen kan opdage mønstre af ensomhed eller mobning gennem hverdagen, før nogen fortæller om dem", ["Uddannelse", "AI og beslutninger", "Data, identitet og privatliv"]),
  development("global-live-classrooms", "Elever i forskellige lande kan opleve at være i samme oversatte klasseværelse i realtid", ["Uddannelse", "Relationer, familie og hverdagsliv"]),
  development("skills-through-making", "Skoler kan dokumentere kompetencer gennem det, elever bygger, hjælper med og skaber uden formelle prøver", ["Uddannelse", "Data, identitet og privatliv"]),

  // Arbejde
  development("ai-administration", "AI kan udføre store dele af administrativt arbejde fra planlægning til dokumentation", ["Arbejde", "AI og beslutninger"]),
  development("humans-supervise-ai", "Mange medarbejdere fører primært tilsyn med arbejde, som AI udfører", ["Arbejde", "AI og beslutninger"]),
  development("many-career-switches", "Det er normalt at skifte fag flere gange gennem arbejdslivet med korte intensive uddannelsesforløb", ["Arbejde", "Uddannelse"]),
  development("agents-find-work", "AI-agenter kan finde opgaver og jobs og søge dem på menneskers vegne", ["Arbejde", "AI og beslutninger"]),
  development("agents-negotiate-pay", "Personlige agenter kan forhandle løn og arbejdsvilkår direkte med arbejdsgiverens agent", ["Arbejde", "AI og beslutninger"], { unsuitableRoles: ["Barn"] }),
  development("work-measured-continuously", "Arbejdsindsats kan vurderes gennem løbende digitale spor fra det daglige arbejde", ["Arbejde", "Data, identitet og privatliv"]),
  development("remote-physical-work", "Specialiseret fysisk arbejde kan udføres globalt på afstand gennem robotter", ["Arbejde", "Robotter og autonome systemer"]),
  development("humans-liable-for-ai", "Mennesker kan være personligt ansvarlige for beslutninger, som en AI har foreslået og udført", ["Arbejde", "AI og beslutninger"]),
  development("mixed-agent-teams", "Teams kan bestå af både mennesker og autonome agenter med egne opgaver og beskeder", ["Arbejde", "AI og beslutninger"]),
  development("tiny-agent-organisations", "Organisationer kan være meget små, fordi autonome agenter udfører koordinering, økonomi og drift", ["Arbejde", "AI og beslutninger"], { suitableRoles: ["Arbejdsgiver", "Medarbejder", "Fagperson", "Beslutningstager"] }),

  // Klima, energi og ressourcer
  development("grid-responsive-homes", "Hjem kan ændre energiforbrug automatisk efter belastningen på elnettet", ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"]),
  development("dynamic-energy-budgets", "Husholdninger kan have energibudgetter, der ændrer sig med vejr, produktion og fælles behov", ["Klima, energi og ressourcer"]),
  development("local-water-reuse", "Vand fra bad, vask og regn kan renses og genbruges lokalt i bygninger og kvarterer", ["Klima, energi og ressourcer"]),
  development("heat-shifts-daily-rhythm", "Ekstrem varme kan flytte skole, arbejde og fritid til andre tider på døgnet", ["Klima, energi og ressourcer", "Uddannelse", "Arbejde"]),
  development("public-cooling-rooms", "Offentlige kølerum kan være en almindelig del af bylivet i varme perioder", ["Klima, energi og ressourcer", "Offentlige systemer og demokrati"]),
  development("floodable-neighbourhoods", "Nogle boligområder kan være bygget til at tåle regelmæssige oversvømmelser", ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"]),
  development("seasonal-homes", "Flere mennesker kan bo forskellige steder efter årstidens varme, vand og arbejde", ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"]),
  development("volatile-food-prices", "Fødevarepriser kan ændre sig hurtigt efter lokale høster, vandforbrug og transportforhold", ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"]),
  development("urban-food-production", "Byer kan producere en stor del af deres friske mad i bygninger og lokale anlæg", ["Klima, energi og ressourcer", "Robotter og autonome systemer"]),
  development("neighbourhood-energy-sharing", "Nabolag kan dele lokalt produceret strøm direkte mellem hjem, butikker og fælles bygninger", ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"]),

  // Offentlige systemer og demokrati
  development("automated-public-decisions", "Mange offentlige afgørelser kan udarbejdes automatisk ud fra lov, data og tidligere sager", ["Offentlige systemer og demokrati", "AI og beslutninger"], { unsuitableRoles: ["Barn"] }),
  development("personal-decision-explanations", "Borgere kan få en individuel forklaring og simulation af, hvorfor en offentlig afgørelse blev truffet", ["Offentlige systemer og demokrati", "AI og beslutninger"]),
  development("policy-simulations", "Mennesker kan se lokale simuleringer af politiske beslutninger, før de bliver vedtaget", ["Offentlige systemer og demokrati", "AI og beslutninger"], { suitableRoles: ["Borger", "Beslutningstager", "For alle"] }),
  development("continuous-local-participation", "Lokal demokratisk deltagelse kan foregå løbende digitalt i stedet for kun ved valg og møder", ["Offentlige systemer og demokrati", "Data, identitet og privatliv"]),
  development("ai-first-public-contact", "AI kan håndtere størstedelen af den første kontakt mellem mennesker og det offentlige", ["Offentlige systemer og demokrati", "AI og beslutninger"]),
  development("city-digital-twins", "Byer kan afprøve trafik, byggeri og klimatiltag i detaljerede digitale tvillinger før virkelige beslutninger", ["Offentlige systemer og demokrati", "Klima, energi og ressourcer"]),
  development("automatic-public-services", "Offentlige tilbud kan tilpasses automatisk til den enkelte borgers situation", ["Offentlige systemer og demokrati", "AI og beslutninger"]),
  development("needs-before-application", "Behov for offentlig hjælp kan opdages, før personen selv søger om den", ["Offentlige systemer og demokrati", "AI og beslutninger", "Data, identitet og privatliv"]),
  development("participatory-city-budgets", "Borgere kan løbende fordele en del af lokale budgetter gennem verificerede digitale valg", ["Offentlige systemer og demokrati", "Data, identitet og privatliv"], { unsuitableRoles: ["Barn"] }),
  development("automated-emergency-routing", "Beredskab kan omdirigere transport, strøm og offentlige rum automatisk under kriser", ["Offentlige systemer og demokrati", "AI og beslutninger", "Klima, energi og ressourcer"]),

  // Relationer, familie og hverdagsliv
  development("family-ai-coordination", "Familier kan bruge en fælles AI til at koordinere aftaler, indkøb, omsorg og tid sammen", ["Relationer, familie og hverdagsliv", "AI og beslutninger"]),
  development("ai-remembers-shared-history", "AI kan huske en relations fælles historie og finde gamle samtaler, løfter og oplevelser", ["Relationer, familie og hverdagsliv", "Data, identitet og privatliv"]),
  development("lifelong-digital-companions", "Digitale ledsagere kan følge et menneske fra barndom til alderdom og bevare deres fælles historie", ["Relationer, familie og hverdagsliv", "AI og beslutninger"]),
  development("technology-supported-multigenerational-homes", "Flere generationer kan bo tæt sammen med teknologi, der fordeler praktiske opgaver og omsorg", ["Relationer, familie og hverdagsliv", "Robotter og autonome systemer"]),
  development("blended-child-social-life", "Børns online og fysiske sociale liv kan smelte sammen i de samme lege, rum og venskaber", ["Relationer, familie og hverdagsliv", "Data, identitet og privatliv"], { suitableRoles: ["Barn", "Forælder", "Lærer / pædagog", "Ung"] }),
  development("invisible-language-barriers", "Direkte oversættelse kan gøre sprogbarrierer næsten usynlige i samtaler", ["Relationer, familie og hverdagsliv", "AI og beslutninger"]),
  development("presence-across-distance", "Mennesker kan opleve måltider, leg og hverdagsrum sammen på tværs af meget store afstande", ["Relationer, familie og hverdagsliv", "Robotter og autonome systemer"]),
  development("automatic-home-decisions", "Automatiserede hjem kan tage mange små beslutninger om mad, varme, indkøb og rutiner uden at spørge først", ["Relationer, familie og hverdagsliv", "AI og beslutninger"]),
  development("shared-family-memory", "Familier kan gemme et søgbart fælles minde-arkiv af billeder, stemmer, beskeder og steder", ["Relationer, familie og hverdagsliv", "Sandhed og autenticitet"]),
  development("digital-presence-at-events", "Mennesker kan deltage i familiebegivenheder gennem en bevægelig digital tilstedeværelse, der taler og ser på deres vegne", ["Relationer, familie og hverdagsliv", "Robotter og autonome systemer"]),
];

export const futureDevelopmentIds = new Set(futureDevelopments.map((item) => item.id));

export function developmentIsSuitableForRole(item: FutureDevelopment, role: UserRole) {
  return !item.unsuitableRoles?.includes(role);
}
