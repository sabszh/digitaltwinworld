import type { FutureTheme, UserRole } from "@/types/world2046";

type ExampleChoice = {
  id: "a" | "b" | "c" | "d";
  label: string;
  consequence: string;
};

export type DilemmaExample = {
  id: string;
  role: UserRole;
  themes: FutureTheme[];
  futureQuestions: string[];
  development?: string;
  developmentIds?: string[];
  enabled?: boolean;
  dilemma: {
    futureNormal: string;
    humanCost: string;
    decision: string;
    title: string;
    scene: string;
    stake: string;
    question: string;
    choices: ExampleChoice[];
  };
};

const choices = (
  a: [string, string],
  b: [string, string],
  c: [string, string],
  d: [string, string],
): ExampleChoice[] => [a, b, c, d].map(([label, consequence], index) => ({
  id: ["a", "b", "c", "d"][index] as ExampleChoice["id"],
  label,
  consequence,
}));

const Q = {
  prediction: "Skal forudsigelser om vores fremtid påvirke vores muligheder nu?",
  inferredCare: "Hvem må reagere på noget en AI ved om os, før vi selv har fortalt det?",
  privacySafety: "Hvor meget af vores privatliv vil vi give for hjælp og sikkerhed?",
  humanContact: "Hvor meget menneskelig kontakt vil vi give afkald på for bedre hjælp?",
  authenticity: "Hvad sker der med tillid, når autenticitet kræver identifikation?",
  delegation: "Hvilke beslutninger om vores liv vil vi lade teknologi tage på vores vegne?",
  climateRights: "Hvornår må klimaændringer ændre vores muligheder og hverdagsliv?",
  responsibility: "Hvem bærer ansvaret, når mennesker handler på en maskines anbefaling?",
  memory: "Hvem ejer og former de digitale spor af vores relationer?",
  fairness: "Hvornår er automatisk ensartet behandling egentlig retfærdig?",
} as const;

/**
 * Editorial quality anchors, not templates. They are intentionally complete so
 * editors can judge and replace an example without understanding prompt code.
 */
export const dilemmaExamples: DilemmaExample[] = [
  {
    id: "child-digital-grandmother",
    role: "Barn",
    themes: ["Sandhed og autenticitet", "Relationer, familie og hverdagsliv"],
    futureQuestions: [Q.memory, Q.authenticity],
    development: "En digital version af en afdød kan fortsætte samtaler med familien",
    developmentIds: ["digital-deceased"],
    dilemma: {
      futureNormal: "Et barn kan tale med en digital udgave af et familiemedlem, der er død.",
      humanCost: "Samtalerne kan holde minder levende, men den digitale person siger også nye ting, som den virkelige aldrig har sagt.",
      decision: "Barnet vælger, hvilken plads den digitale bedstemor skal have ved fødselsdagen.",
      title: "SKAL DIGITALE MORMOR MED TIL FESTEN?",
      scene: "Du fylder ti år på lørdag. På familiens skærm bor en digital udgave af din mormor, som døde for to år siden. Hun kan fortælle gamle historier og finde på nye svar med mormors stemme. Du vil gerne have hende med til festen. Din mor bliver både glad og ked af det, når skærmen taler.",
      stake: "Du vil have mormor med til din store dag. Du vil også passe på de rigtige minder og på din mor.",
      question: "Hvad gør du med digitale mormor til festen?",
      choices: choices(
        ["LAD HENDE TALE MED VED BORDET", "Du får følelsen af, at mormor er med, men nye ord kan blive blandet sammen med det, hun virkelig sagde."],
        ["VIS KUN GAMLE VIDEOER AF HENDE", "I hører mormors egne ord, men du kan ikke spørge hende om noget nyt på din fødselsdag."],
        ["HOLD SKÆRMEN SLUKKET", "Din mor og de gamle minder får ro, men du savner den mormor, du stadig kan tale med."],
        ["TAL MED HENDE ALENE EFTER FESTEN", "Du beholder samtalen med mormor, men gør den til en hemmelig del af dagen, som familien ikke deler."],
      ),
    },
  },
  {
    id: "child-robot-friend-memory",
    role: "Barn",
    themes: ["Robotter og autonome systemer", "Relationer, familie og hverdagsliv", "Data, identitet og privatliv"],
    futureQuestions: [Q.memory, Q.privacySafety],
    development: "En social robot kan huske alt, et barn har delt med den gennem mange år",
    developmentIds: ["social-robots-lasting"],
    dilemma: {
      futureNormal: "Et barn kan have den samme robotven i mange år, og robotten husker alle deres samtaler.",
      humanCost: "Robotten kan være en tryg ven, men dens minder kan også vise de voksne, hvad barnet har sagt.",
      decision: "Barnet vælger, hvem robotten må dele et vigtigt minde med.",
      title: "ROBOTEN HUSKER DIT LØFTE",
      scene: "Din lillebror har fortalt jeres robot, at han tit er bange om natten. Han fik dig til at love, at ingen voksne måtte få det at vide. Nu spørger robotten dig, om den skal vise mindet til jeres far.",
      stake: "Du vil holde dit løfte. Du vil også have, at din lillebror får hjælp, når han er bange.",
      question: "Hvad siger du til robotten?",
      choices: choices(
        ["VIS MINDET TIL FAR", "Din far kan hjælpe, men du bryder løftet til din lillebror."],
        ["BEHOLD MINDET HEMMELIGT", "Du holder dit løfte, men din lillebror kan fortsætte med at være bange alene."],
        ["SIG DET SAMMEN MED HAM", "Du vil kun dele mindet, hvis din lillebror er med; han får kontrol, men kan sige nej til hjælp."],
        ["FORTÆL KUN, AT HAN ER BANGE", "Din far hører om problemet, men ikke lillebrors egne ord; hjælpen kan ramme forkert."],
      ),
    },
  },
  {
    id: "child-grandfather-story",
    role: "Barn",
    themes: ["Sandhed og autenticitet", "AI og beslutninger", "Relationer, familie og hverdagsliv"],
    futureQuestions: [Q.authenticity, Q.memory],
    development: "AI kan kontrollere og kommentere faktuelle udsagn, mens de bliver sagt",
    developmentIds: ["live-fact-checking"],
    dilemma: {
      futureNormal: "Klassens AI kan kontrollere historier og oplysninger, mens børn fortæller dem.",
      humanCost: "Det bliver lettere at skelne sandt fra falsk, men en families historie kan miste sin plads, når den ikke kan bevises.",
      decision: "Barnet vælger, hvilken plads morfars historie skal have i klassens projekt.",
      title: "COMPUTEREN TROR IKKE PÅ MORFAR",
      scene: "Din klasse laver et projekt om den store storm i byen. Du fortæller den historie, din morfar altid har fortalt om natten, hvor han reddede en hund fra vandet. Klassens AI skriver på tavlen: ‘Det kan ikke bekræftes og er sandsynligvis ikke sket sådan.’ Din ven spørger, om historien stadig skal med.",
      stake: "Du vil lave et projekt, andre kan stole på. Du vil også passe på en historie, som betyder meget for din familie.",
      question: "Hvad gør du med morfars historie?",
      choices: choices(
        ["TAG HISTORIEN UD", "Projektet bruger kun det, der kan bevises, men morfars oplevelse får ingen plads."],
        ["FORTÆL DEN SOM SAND", "Du holder fast i morfars ord, men klassen kan komme til at dele noget, der ikke skete sådan."],
        ["KALD DEN MORFARS HISTORIE", "I beholder historien og siger ærligt, at den ikke kan bevises, men andre kan begynde at se morfar som en, der finder på."],
        ["BRUG AI'ENS VERSION", "Projektet får en historie, der passer til de sikre oplysninger, men morfars egen stemme og minde forsvinder."],
      ),
    },
  },

  {
    id: "youth-predicted-dropout",
    role: "Ung",
    themes: ["AI og beslutninger", "Uddannelse"],
    futureQuestions: [Q.prediction, Q.fairness],
    development: "AI kan forudsige risiko for frafald og tilbyde et andet uddannelsesforløb tidligt",
    developmentIds: ["ai-predicts-dropout"],
    dilemma: {
      futureNormal: "Uddannelser bruger løbende arbejde til at forudsige, hvem der får svært ved at gennemføre.",
      humanCost: "Tidlig støtte kan hjælpe, men forudsigelsen kan også ændre en ungs muligheder, før noget er sket.",
      decision: "Den unge vælger, om AI-forudsigelsen skal bruges til at ændre det næste skoleår.",
      title: "DIN FREMTID ER ALLEREDE BEREGNET",
      scene: "Din uddannelse tilbyder dig et støttet forløb med færre fag. AI'en siger, at du ellers sandsynligvis falder fra. Hvis du tager imod, kan du ikke søge den linje, du har drømt om næste år.",
      stake: "Du kan få en mere sikker vej gennem uddannelsen eller beholde chancen for selv at overraske alle — også systemet.",
      question: "Lader du forudsigelsen ændre dit forløb?",
      choices: choices(
        ["TAG DET STØTTEDE FORLØB", "Du får mere hjælp og større chance for at gennemføre, men opgiver din ønskede linje."],
        ["BEHOLD DIT NUVÆRENDE FORLØB", "Du beholder muligheden, du ønsker, men risikerer at stå uden den støtte, der kunne have hjulpet."],
        ["TAG STØTTEN OG SLIP LINJEN", "Du vælger sikkerheden helt og bruger kræfterne på en ny retning, men lader en prognose lukke den gamle."],
        ["AFVIS AT BLIVE FORUDSIGT", "Du beskytter retten til at blive mødt åbent, men siger også nej til en tidlig hjælp, der kunne være rigtig."],
      ),
    },
  },
  {
    id: "youth-ai-clone-message",
    role: "Ung",
    themes: ["Sandhed og autenticitet", "Relationer, familie og hverdagsliv"],
    futureQuestions: [Q.authenticity, Q.memory],
    development: "En personlig AI-klon kan skrive og svare i en ungs egen stil",
    developmentIds: ["personal-ai-clones"],
    dilemma: {
      futureNormal: "Unge kan lade en AI-klon holde samtaler i gang, når de ikke selv er online.",
      humanCost: "Ingen bliver glemt, men venner kan ikke altid vide, om relationen er med personen eller klonen.",
      decision: "Den unge vælger, om klonen må fortsætte en vigtig samtale med en nær ven.",
      title: "DIN VEN SKREV TIL DIN KOPI",
      scene: "Mens du sov, fortalte din bedste ven din AI-klon noget meget privat. Klonen svarede præcis, som du plejer. Nu kan du læse alt, men din ven tror stadig, at det var dig.",
      stake: "Du vil være der for din ven. Du vil også have, at jeres venskab bygger på, hvem der faktisk var til stede.",
      question: "Hvad gør du med samtalen?",
      choices: choices(
        ["FORTÆL DET MED DET SAMME", "Din ven får sandheden, men kan føle sig snydt og fortryde det, der blev delt."],
        ["FORTSÆT SOM OM DET VAR DIG", "Du beskytter samtalen her og nu, men lader din ven stole på noget, der ikke skete."],
        ["LÆS OG SVAR SOM DIG SELV", "Du hjælper videre med fuld viden, men bruger noget, din ven ikke vidste blev givet til dig."],
        ["SLET UDEN AT LÆSE", "Du respekterer en grænse, men efterlader din ven uden den støtte, personen troede at have bedt dig om."],
      ),
    },
  },
  {
    id: "youth-body-sensor-team",
    role: "Ung",
    themes: ["Sundhed og bioteknologi", "Data, identitet og privatliv"],
    futureQuestions: [Q.privacySafety, Q.inferredCare],
    development: "Kropssensorer kan opdage overbelastning før en ung selv mærker den",
    developmentIds: ["continuous-body-sensors"],
    dilemma: {
      futureNormal: "Sportsfællesskaber bruger kropssensorer til at opdage skader, før de gør ondt.",
      humanCost: "Tidlig beskyttelse kan holde unge raske, men kroppen bliver også et argument for, hvad de må være med til.",
      decision: "Den unge vælger, om holdet må bruge sensorens advarsel i en vigtig kamp.",
      title: "DIN KROP SIGER STOP FØR DIG",
      scene: "Du føler dig klar til sæsonens vigtigste kamp. Din sensor viser høj risiko for en skade, men ingen kan vide, om den faktisk kommer. Træneren har kun set advarslen, fordi du selv deler den.",
      stake: "Du kan beskytte din krop og svigte holdets forventning — eller spille og tage en risiko, ingen andre kan mærke for dig.",
      question: "Hvad gør du med advarslen?",
      choices: choices(
        ["DEL DEN OG SID OVER", "Du beskytter din krop, men mister kampen og lader holdet spille uden dig."],
        ["HOLD DEN PRIVAT OG SPIL", "Du beholder kontrollen og hjælper holdet, men tager hele skadesrisikoen selv."],
        ["DEL DEN OG TAG EN MINDRE ROLLE", "Du bliver med i kampen og sænker risikoen, men holdet ser dig som den, sensoren ikke stoler på."],
        ["FORTÆL HOLDET OG VÆLG SELV AT SPILLE", "Du er åben og tager ansvaret, men holdkammeraterne skal spille med frygten for, at du bliver skadet."],
      ),
    },
  },

  {
    id: "parent-genetic-risk",
    role: "Forælder",
    themes: ["Sundhed og bioteknologi", "Data, identitet og privatliv"],
    futureQuestions: [Q.prediction, Q.privacySafety],
    development: "En genetisk profil kan vise et barns sygdomsrisiko årtier frem",
    developmentIds: ["genetic-risk-decades"],
    dilemma: {
      futureNormal: "Forældre kan få et kort over sygdomme, deres barn måske udvikler som voksen.",
      humanCost: "Viden kan forebygge sygdom, men kan også forme et barns liv omkring noget, der måske aldrig sker.",
      decision: "Forælderen vælger, om familien vil kende og handle på barnets langsigtede risikoprofil.",
      title: "ET KORT OVER DIT BARNS FREMTID",
      scene: "Dit raske niårige barn kan blive testet for sygdomme langt ude i voksenlivet. Hvis I åbner profilen nu, kan familien ændre vaner tidligt. Barnet kan aldrig få muligheden for ikke at kende den igen.",
      stake: "Du kan give dit barn bedre odds for et langt liv eller beskytte en barndom, der ikke er styret af mulige sygdomme.",
      question: "Åbner I risikoprofilen nu?",
      choices: choices(
        ["ÅBN ALT NU", "I får flest muligheder for at forebygge, men barnets fremtid bliver tidligt fyldt med risici og tal."],
        ["VENT TIL BARNET SELV KAN VÆLGE", "Barnet får retten til beslutningen, men familien mister år, hvor tidlig forebyggelse kunne have hjulpet."],
        ["ÅBN KUN DET, DER KAN HANDLES PÅ", "I får brugbar viden, men voksne afgør på forhånd, hvilke sandheder barnet senere skal kende."],
        ["VÆLG VIDEN FRA", "Barnet vokser op uden en genetisk fortælling over sig, men kan miste chancen for at forebygge noget alvorligt."],
      ),
    },
  },
  {
    id: "parent-robot-care",
    role: "Forælder",
    themes: ["Robotter og autonome systemer", "Relationer, familie og hverdagsliv"],
    futureQuestions: [Q.humanContact, Q.delegation],
    development: "En robot kan passe et barn sikkert i korte perioder og lære familiens rutiner",
    developmentIds: ["robots-watch-children"],
    dilemma: {
      futureNormal: "Familier kan lade en kendt omsorgsrobot være alene med børn efter skole.",
      humanCost: "Robotten giver tid og stabilitet, men barnet kan begynde at gå til den med ting, familien før delte med hinanden.",
      decision: "Forælderen vælger, hvilken plads robotten skal have i barnets eftermiddage.",
      title: "DEN, DIT BARN FORTÆLLER ALT",
      scene: "Jeres barn vil hellere hjem til omsorgsrobotten end med i fritidsordningen. Robotten er altid rolig og kender alle yndlingslege. Den sender kun besked til jer, hvis den vurderer, at noget er alvorligt.",
      stake: "Barnet kan få trygge eftermiddage, og familien kan få mere luft. Samtidig kan en maskine blive den relation, barnet søger først.",
      question: "Hvilken eftermiddag vælger I?",
      choices: choices(
        ["HJEM TIL ROBOTTEN HVER DAG", "Barnet får ro og en fast relation, men mindre tid med børn og voksne uden for hjemmet."],
        ["BLIV I FRITIDSORDNINGEN", "Barnet beholder menneskefællesskabet, men mister den ro og opmærksomhed, robotten giver."],
        ["ROBOTDAGE SOM FAST DEL", "I fordeler tiden mellem begge verdener, men accepterer stadig, at robotten bliver en vigtig omsorgsperson."],
        ["VÆLG ROBOTTEN FRA", "I holder omsorg mellem mennesker, men familien må selv finde tid og hjælp til de svære eftermiddage."],
      ),
    },
  },
  {
    id: "parent-seasonal-home",
    role: "Forælder",
    themes: ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"],
    futureQuestions: [Q.climateRights],
    development: "Familier kan bo et andet sted i årets varmeste måneder",
    developmentIds: ["seasonal-homes"],
    dilemma: {
      futureNormal: "Skole og arbejde kan flyttes digitalt, så familier kan forlade meget varme byer om sommeren.",
      humanCost: "Flytningen beskytter helbred og giver en tålelig hverdag, men deler lokale fællesskaber efter, hvem der kan rejse.",
      decision: "Forælderen vælger, om familien skal forlade sit kvarter hver sommer.",
      title: "TO HJEM TIL ÉN FAMILIE",
      scene: "Jeres bolig er blevet farligt varm i juli og august. Familien har fået plads i en køligere sommerby, hvor børnene kan følge skolen digitalt. Jeres ældre nabo og flere af børnenes venner bliver i kvarteret.",
      stake: "I kan beskytte børnene mod varmen eller blive hos de mennesker, som ikke har den samme mulighed.",
      question: "Flytter familien væk om sommeren?",
      choices: choices(
        ["FLYT HELE SOMMEREN", "Børnene får en sikker hverdag, men familien forlader sit lokale fællesskab, når presset er størst."],
        ["BLIV I KVARTERET", "I bliver sammen med naboer og venner, men børnene lever med den hårdeste varme."],
        ["DEL FAMILIEN", "Børnene kommer i sikkerhed med én voksen, men familien lever adskilt to måneder hvert år."],
        ["FLYT PERMANENT", "I får ét stabilt og køligere hjem, men opgiver kvarteret, relationerne og livet, I har bygget."],
      ),
    },
  },

  {
    id: "teacher-isolation-signal",
    role: "Lærer / pædagog",
    themes: ["Uddannelse", "AI og beslutninger", "Data, identitet og privatliv"],
    futureQuestions: [Q.inferredCare, Q.privacySafety],
    development: "Skolen kan opdage mønstre af ensomhed, før et barn selv fortæller om dem",
    developmentIds: ["school-detects-isolation"],
    dilemma: {
      futureNormal: "En lærer kan få private advarsler om børn, der gradvist bliver holdt udenfor.",
      humanCost: "Læreren kan reagere tidligere, men relationen kan ændres af en viden, barnet aldrig har valgt at dele.",
      decision: "Læreren vælger, hvordan en konkret advarsel skal påvirke mødet med barnet i dag.",
      title: "EN ADVARSEL, ELEVEN IKKE KENDER",
      scene: "Før timen viser skolens AI, at Amina sandsynligvis bliver frosset ud af sin gruppe. Hun virker glad og har ikke bedt om hjælp. Systemet bygger på hendes beskeder, pauser og bevægelser gennem skolen.",
      stake: "Du kan gribe ind, før skaden bliver synlig, eller beskytte elevens ret til at blive mødt ud fra det, hun selv viser dig.",
      question: "Hvordan møder du Amina i dag?",
      choices: choices(
        ["TAG SAMTALEN NU", "Du kan åbne for hjælp tidligt, men afslører at skolen har læst et mønster bag hendes ryg."],
        ["HANDL KUN PÅ DET, DU SELV SER", "Du beskytter relationens normale grundlag, men kan overse den tid, hvor hjælp virker bedst."],
        ["ÆNDR GRUPPEN UDEN FORKLARING", "Du beskytter Amina uden at afsløre signalet, men styrer hendes relationer ud fra skjult viden."],
        ["FORTÆL OM SIGNALET OG LAD HENDE VÆLGE", "Du giver hende indflydelse, men lægger også en tung mistanke om vennerne over på hende."],
      ),
    },
  },
  {
    id: "teacher-adaptive-path",
    role: "Lærer / pædagog",
    themes: ["Uddannelse", "AI og beslutninger"],
    futureQuestions: [Q.prediction, Q.fairness],
    development: "Undervisningen kan ændre sværhedsgrad automatisk for hver elev",
    developmentIds: ["adaptive-lessons"],
    dilemma: {
      futureNormal: "Hver elev kan få sin egen usynlige vej gennem det samme fag.",
      humanCost: "Flere lærer i et passende tempo, men klassen mister erfaringen af at kæmpe med det samme og blive overrasket sammen.",
      decision: "Læreren vælger, om en elev skal følge den forudsagte vej eller deltage i klassens fælles udfordring.",
      title: "DEN OPGAVE SYSTEMET IKKE VIL GIVE",
      scene: "Klassen skal bygge en rigtig bro-model sammen. Systemet holder Malik på et lettere spor, fordi hans tidligere arbejde viser, at han sandsynligvis vil sænke gruppen. Malik beder om at få samme ansvar som de andre.",
      stake: "Du kan beskytte hans læring mod et nederlag eller give ham den mulighed, systemet mener, han ikke er klar til.",
      question: "Hvilket ansvar giver du Malik?",
      choices: choices(
        ["FØLG DET LETTERE SPOR", "Han får en opgave, han sandsynligvis lykkes med, men bliver behandlet efter sin fortid."],
        ["GIV HAM SAMME ANSVAR", "Han får den åbne mulighed, men gruppen og han selv bærer risikoen for, at forudsigelsen rammer rigtigt."],
        ["GIV HAM EN AFGØRENDE DEL MED STØTTE", "Han får reel betydning, men bliver samtidig udpeget som den, der kræver ekstra hjælp."],
        ["GIV HAM ANSVARET ALENE", "Han får chancen for at bevise noget på egne vegne, men bærer også hele nederlaget, hvis forudsigelsen rammer rigtigt."],
      ),
    },
  },
  {
    id: "teacher-ai-group-member",
    role: "Lærer / pædagog",
    themes: ["Uddannelse", "AI og beslutninger", "Sandhed og autenticitet"],
    futureQuestions: [Q.humanContact, Q.responsibility],
    development: "En AI-person kan være fast gruppemedlem i elevernes projektarbejde",
    developmentIds: ["ai-classmates"],
    dilemma: {
      futureNormal: "Klasser kan have AI-elever, der bidrager med idéer, arbejde og feedback som andre gruppemedlemmer.",
      humanCost: "Alle grupper kan komme videre, men det bliver uklart, hvem der lærer, skaber og bærer et fælles resultat.",
      decision: "Læreren vælger, hvilken status AI-elevens afgørende bidrag skal have i gruppens vurdering.",
      title: "GRUPPENS BEDSTE IDÉ KOM IKKE FRA ET BARN",
      scene: "Fire elever har lavet et projekt med klassens AI-elev. Den fandt idéen, løste det sværeste problem og samlede præsentationen. De menneskelige elever har lært meget af samarbejdet og vil vurderes som én gruppe.",
      stake: "Du kan anerkende det arbejde, de faktisk har skabt sammen, eller holde fast i, at en vurdering skal vise, hvad børnene kan uden en kunstig holdkammerat.",
      question: "Hvordan vurderer du gruppens resultat?",
      choices: choices(
        ["VURDÉR HELE FÆLLES RESULTAT", "Elevernes samarbejde tæller fuldt, men AI'ens evner bliver en del af deres karakter."],
        ["VURDÉR KUN ELEVERNES EGNE DELE", "Karakteren viser menneskenes arbejde, men overser det samarbejde, undervisningen bad dem om."],
        ["VURDÉR DERES BRUG AF AI'EN", "De belønnes for at lede et nyt slags team, men faget ændrer sig fra at kunne selv til at kunne styre."],
        ["LAD PROJEKTET VÆRE UDEN KARAKTER", "Ingen får en misvisende vurdering, men eleverne mister anerkendelsen for et stort arbejde."],
      ),
    },
  },

  {
    id: "professional-early-diagnosis",
    role: "Fagperson",
    themes: ["Sundhed og bioteknologi", "AI og beslutninger"],
    futureQuestions: [Q.prediction, Q.responsibility],
    development: "Sygdom kan opdages flere år før symptomer med betydelig usikkerhed",
    developmentIds: ["disease-before-symptoms"],
    dilemma: {
      futureNormal: "Sundhedsfaglige modtager tidlige risikosignaler om sygdomme, som endnu ikke kan bekræftes.",
      humanCost: "Tidlig viden kan give behandling og tid, men kan også gøre et raskt menneske til patient i mange år.",
      decision: "Fagpersonen vælger, hvordan et usikkert, alvorligt fund skal deles og bruges nu.",
      title: "PATIENTEN ER RASK — FORELØBIG",
      scene: "En rutinemåling viser 38 procent risiko for en alvorlig nervesygdom inden for ti år. Der findes en forebyggende behandling med mærkbare bivirkninger. Patienten er kommet for noget helt andet og forventer at gå rask hjem.",
      stake: "Du kan åbne en mulighed for tidlig handling eller beskytte et menneske mod at leve under en diagnose, der måske aldrig bliver virkelig.",
      question: "Hvad gør du med fundet?",
      choices: choices(
        ["DEL ALT OG TILBYD BEHANDLING", "Patienten får størst handlemulighed, men kan få bivirkninger og et årti præget af mulig sygdom."],
        ["DEL RISIKOEN UDEN AT ANBEFALE BEHANDLING", "Patienten får sandheden, men står selv med et valg, fagligheden ikke kan gøre sikkert."],
        ["FØLG UDVIKLINGEN UDEN AT DELE FUNDET NU", "Du skåner patientens raske liv, men tilbageholder viden, der kunne have ændret fremtiden."],
        ["AFVIS AT BRUGE USIKRE FUND", "Du beskytter en klar grænse for behandling, men giver afkald på den tidlige forebyggelses mulighed."],
      ),
    },
  },
  {
    id: "professional-automated-benefit",
    role: "Fagperson",
    themes: ["Offentlige systemer og demokrati", "AI og beslutninger"],
    futureQuestions: [Q.fairness, Q.responsibility],
    development: "En offentlig afgørelse kan udarbejdes automatisk og forklares individuelt",
    developmentIds: ["automated-public-decisions"],
    dilemma: {
      futureNormal: "Sagsbehandlere får færdige afgørelser med en personlig forklaring til borgeren.",
      humanCost: "Flere får hurtige og ensartede svar, men fagpersonen kan blive ansvarlig for en afgørelse, der bygger på mønstre uden for sagen.",
      decision: "Fagpersonen vælger, om en konkret automatisk afgørelse skal stå ved magt under eget navn.",
      title: "AFGØRELSEN HAR ALLEREDE DIT NAVN",
      scene: "Systemet har afslået støtte til en borger, fordi lignende forløb sjældent fører til varigt arbejde. Lovens kriterier er opfyldt, og forklaringen er let at forstå. Din egen samtale med borgeren giver dig tvivl.",
      stake: "Du kan bevare ens behandling og hurtig hjælp til mange eller lade et konkret menneskemøde veje mere end systemets samlede erfaring.",
      question: "Sætter du dit navn på afslaget?",
      choices: choices(
        ["GODKEND AFGØRELSEN", "Du holder fast i ensartet praksis, men accepterer at borgerens sandsynlige fremtid afgør nutiden."],
        ["TILSIDESÆT DEN I DENNE SAG", "Du følger din faglige tvivl, men gør behandlingen afhængig af, hvem borgeren møder."],
        ["GODKEND OG SIG ÅBENT, AT DU TVIVLER", "Borgeren får et ærligt svar, men stadig et afslag, du ikke fuldt kan stå inde for."],
        ["NÆGT AT VÆRE PERSONLIGT ANSVARLIG", "Du beskytter din faglige integritet, men efterlader borgeren i et system uden en navngiven ansvarlig."],
      ),
    },
  },
  {
    id: "professional-remote-robot",
    role: "Fagperson",
    themes: ["Robotter og autonome systemer", "Sundhed og bioteknologi"],
    futureQuestions: [Q.humanContact, Q.responsibility],
    development: "En specialist kan behandle en patient fysisk gennem en robot på afstand",
    developmentIds: ["remote-specialist-robots"],
    dilemma: {
      futureNormal: "En lokal fagperson kan være hænder for en fjern specialist gennem en behandlingsrobot.",
      humanCost: "Ekspertise når flere steder, men nærvær, ansvar og den kropslige vurdering bliver delt mellem mennesker og maskine.",
      decision: "Den lokale fagperson vælger, om en vanskelig behandling skal gennemføres med fjernspecialisten nu.",
      title: "SPECIALISTENS HÆNDER ER EN ROBOT",
      scene: "En patient kan få en vigtig behandling i sin hjemby gennem en robot styret fra et andet land. Du står ved siden af patienten. Specialisten har større erfaring end dig, men forbindelsen har små forsinkelser, som kun du mærker i rummet.",
      stake: "Patienten kan få den bedste ekspertise uden en lang rejse, mens du må acceptere et ansvar, ingen af jer bærer alene.",
      question: "Gennemfører du behandlingen her?",
      choices: choices(
        ["GENNEMFØR MED FÆLLES VETORET", "Patienten får ekspertisen nu, men behandlingen kan stoppe, når jeres to vurderinger ikke følges ad."],
        ["TAG BEHANDLINGEN LOKALT SELV", "Patienten har én ansvarlig i rummet, men får mindre specialiseret erfaring."],
        ["ANBEFAL REJSEN TIL SPECIALISTEN", "Ansvar og ekspertise samles fysisk, men patienten må bære rejsens belastning og ventetid."],
        ["GIV FJERNSPECIALISTEN DET SIDSTE ORD", "Patienten får specialistens fulde metode, men du skal handle imod din egen kropslige vurdering, hvis I bliver uenige."],
      ),
    },
  },

  {
    id: "employer-burnout-warning",
    role: "Arbejdsgiver",
    themes: ["Arbejde", "AI og beslutninger", "Sundhed og bioteknologi"],
    futureQuestions: [Q.inferredCare, Q.prediction],
    development: "AI kan opdage sandsynlig udbrændthed gennem medarbejderens daglige arbejdsmønstre",
    developmentIds: ["ai-detects-burnout"],
    dilemma: {
      futureNormal: "En leder kan få tidlige advarsler om medarbejdere, der sandsynligvis bliver syge af arbejdet.",
      humanCost: "Arbejdspladsen kan forebygge skade, men medarbejderen bliver behandlet ud fra private mønstre og en mulig fremtid.",
      decision: "Arbejdsgiveren vælger, om advarslen skal ændre en konkret medarbejders ansvar nu.",
      title: "SYSTEMET SIGER, AT HUN SNART KNÆKKER",
      scene: "Din mest erfarne medarbejder leder et afgørende projekt og siger, at hun trives. Systemet vurderer høj risiko for sygemelding inden for tre måneder. Hun ved ikke, at du har fået advarslen.",
      stake: "Du kan beskytte hendes helbred og projektet tidligt eller respektere hendes egen vurdering af, hvad hun kan bære.",
      question: "Ændrer du hendes ansvar på grund af advarslen?",
      choices: choices(
        ["TAG PROJEKTET FRA HENDE", "Du mindsker risikoen for sammenbrud, men fratager hende ansvar og mulighed på baggrund af en prognose."],
        ["LAD HENDE FORTSÆTTE", "Du respekterer hendes egen vurdering, men risikerer hendes helbred og hele holdets arbejde."],
        ["DEL ADVARSLEN OG LAD HENDE VÆLGE", "Hun får kontrol, men tvinges til at arbejde under en maskines billede af hendes fremtid."],
        ["SÆNK KRAVENE FOR HELE HOLDET", "Ingen udpeges, men alle betaler med tempo og muligheder for et signal om én person."],
      ),
    },
  },
  {
    id: "employer-ai-liability",
    role: "Arbejdsgiver",
    themes: ["Arbejde", "AI og beslutninger"],
    futureQuestions: [Q.responsibility, Q.delegation],
    development: "En virksomhed kan lade AI foreslå og udføre beslutninger, som en navngiven leder hæfter for",
    developmentIds: ["humans-liable-for-ai"],
    dilemma: {
      futureNormal: "Ledelser kan automatisere mange beslutninger, hvis et menneske påtager sig det endelige ansvar.",
      humanCost: "Virksomheden bliver hurtigere og mere ensartet, men ansvar kan blive en underskrift under handlinger, ingen har set enkeltvis.",
      decision: "Arbejdsgiveren vælger, om AI'en fortsat må handle under deres personlige ansvar.",
      title: "TI TUSIND BESLUTNINGER I DIT NAVN",
      scene: "Virksomhedens agent har på en uge ændret arbejdstider for tusind ansatte og sparet nok til at undgå fyringer. Tre medarbejdere er blevet alvorligt ramt af ændringerne. Juridisk er alle beslutninger dine.",
      stake: "Du kan bevare den hastighed, der holder arbejdspladsen i live, eller kræve menneskelig kontrol, der gør færre beslutninger mulige.",
      question: "Lader du agenten fortsætte i dit navn?",
      choices: choices(
        ["FORTSÆT MED FULDT ANSVAR", "Du beskytter virksomhedens handlekraft, men accepterer personligt konsekvenserne af beslutninger, du ikke ser."],
        ["KRÆV MENNESKELIG GODKENDELSE", "Hver beslutning får et blik, men tempoet og besparelsen, der beskyttede jobs, forsvinder."],
        ["BEGRÆNS AGENTEN TIL SMÅ BESLUTNINGER", "De største indgreb bliver menneskelige, men mange små belastninger kan stadig gemme sig i mængden."],
        ["STOP AUTOMATISERINGEN", "Ansvar og beslutning samles hos mennesker, men virksomheden kan ikke længere love at bevare alle stillinger."],
      ),
    },
  },
  {
    id: "employer-agent-negotiation",
    role: "Arbejdsgiver",
    themes: ["Arbejde", "AI og beslutninger", "Data, identitet og privatliv"],
    futureQuestions: [Q.fairness, Q.delegation],
    development: "Medarbejderes personlige agenter kan forhandle løn ud fra detaljerede data om deres værdi og liv",
    developmentIds: ["agents-negotiate-pay"],
    dilemma: {
      futureNormal: "Lønforhandling kan foregå direkte mellem virksomhedens agent og medarbejdernes egne agenter.",
      humanCost: "Aftaler kan blive præcise og hurtige, men ens arbejde kan få forskellig pris alt efter, hvad agenten ved og kan afsløre.",
      decision: "Arbejdsgiveren vælger, hvilken type lønaftale virksomheden vil stå ved.",
      title: "AGENTERNE KENDER DERES PRIS",
      scene: "To medarbejdere udfører samme arbejde lige godt. Den enes agent dokumenterer, at hun er svær at erstatte, og kræver langt mere. Den anden har valgt ikke at dele personlige data med sin agent.",
      stake: "Du kan betale præcist efter forhandlingsstyrke eller beskytte en lighed, der måske koster den mest efterspurgte medarbejder.",
      question: "Hvilken aftale tilbyder du?",
      choices: choices(
        ["ACCEPTER DE TO FORSKELLIGE LØNNINGER", "Du reagerer på markedets virkelighed, men belønner den, der deler mest og forhandler stærkest."],
        ["GIV DEM SAMME LØN", "Du beskytter lighed for samme arbejde, men risikerer at miste den medarbejder, der kan få mere andetsteds."],
        ["HÆV BEGGES LØN TIL KRAVET", "Ingen straffes for privatliv, men færre midler er tilbage til resten af arbejdspladsen."],
        ["AFVIS AGENTFORHANDLING", "Du holder løn som en menneskelig relation, men fjerner et redskab, der kan styrke medarbejdernes position."],
      ),
    },
  },

  {
    id: "employee-continuous-measurement",
    role: "Medarbejder",
    themes: ["Arbejde", "Data, identitet og privatliv", "AI og beslutninger"],
    futureQuestions: [Q.privacySafety, Q.fairness],
    development: "Arbejdsindsats kan vurderes gennem løbende digitale spor fra det daglige arbejde",
    developmentIds: ["work-measured-continuously"],
    dilemma: {
      futureNormal: "Medarbejdere kan erstatte årlige vurderinger med en løbende profil af deres faktiske bidrag.",
      humanCost: "Usynligt arbejde kan endelig tælle, men pauser, relationer og arbejdsstil bliver også målbare.",
      decision: "Medarbejderen vælger, om den løbende profil skal bruges ved næste forfremmelse.",
      title: "ALT DET, DU GØR, KAN ENDELIG TÆLLE",
      scene: "Du hjælper ofte kolleger og løser problemer, ingen skriver ned. Den nye profil kan bevise det og gøre dig til kandidat til en forfremmelse. Den kræver også adgang til dine beskeder, pauser og arbejdsmønstre.",
      stake: "Du kan få anerkendelse for det skjulte arbejde eller beholde områder af arbejdsdagen, som ikke bliver vurderet.",
      question: "Lader du profilen tale for dig?",
      choices: choices(
        ["BRUG HELE PROFILEN", "Dit fulde bidrag bliver synligt, men også din adfærd og dine relationer på arbejdet."],
        ["SØG UDEN PROFILEN", "Du beskytter dit private arbejdsrum, men meget af det, du bidrager med, forbliver usynligt."],
        ["BRUG KUN RESULTATERNE", "Du viser det målbare udbytte, men omsorg, samarbejde og pausernes betydning forsvinder igen."],
        ["BLIV I DIN NUVÆRENDE ROLLE", "Du undgår at gøre hverdagen til data, men opgiver en mulighed, du måske har fortjent."],
      ),
    },
  },
  {
    id: "employee-dangerous-robot",
    role: "Medarbejder",
    themes: ["Arbejde", "Robotter og autonome systemer"],
    futureQuestions: [Q.humanContact, Q.responsibility],
    development: "En robot kan overtage det farligste arbejde fra et erfarent menneske",
    developmentIds: ["robots-dangerous-work"],
    dilemma: {
      futureNormal: "Farlige fag kan udføres af robotter, mens erfarne medarbejdere leder arbejdet på afstand.",
      humanCost: "Færre bliver skadet, men håndværk, identitet og den direkte erfaring forsvinder fra menneskets arbejde.",
      decision: "Medarbejderen vælger, hvilken rolle de selv vil have, når robotten overtager deres kerneopgave.",
      title: "ROBOTEN KAN GØRE DIT FARLIGE ARBEJDE",
      scene: "Du har brugt tyve år på at arbejde i højden og er kendt som den bedste på holdet. En robot kan nu gøre arbejdet uden risiko. Du kan blive dens kontrollør med samme løn, men aldrig selv udføre faget igen.",
      stake: "Du kan beskytte din krop og kollegernes liv eller holde fast i det arbejde, der har formet, hvem du er.",
      question: "Hvilken rolle tager du?",
      choices: choices(
        ["BLIV ROBOTTENS KONTROLLØR", "Du beholder løn og sikkerhed, men giver slip på den fysiske kunnen, du er stolt af."],
        ["FORTSÆT DET FYSISKE ARBEJDE", "Du bevarer faget i egne hænder, men tager en risiko, teknologien kunne have fjernet."],
        ["LÆR NYE AT STYRE ROBOTTEN", "Din erfaring lever videre gennem andre, men din egen arbejdsdag bliver mest undervisning og skærm."],
        ["FORLAD FAGET", "Du beskytter din faglige identitet mod at blive en kontrolopgave, men opgiver løn og fællesskab."],
      ),
    },
  },
  {
    id: "employee-agent-team",
    role: "Medarbejder",
    themes: ["Arbejde", "AI og beslutninger", "Sandhed og autenticitet"],
    futureQuestions: [Q.responsibility, Q.humanContact],
    development: "Et arbejdsteam kan have autonome AI-agenter som faste kolleger",
    developmentIds: ["mixed-agent-teams"],
    dilemma: {
      futureNormal: "AI-agenter kan eje opgaver, skrive til kunder og træffe løbende valg som andre teammedlemmer.",
      humanCost: "Holdet kan levere mere, men menneskelige medarbejdere må leve med kollegers handlinger, som ingen person fuldt forstår.",
      decision: "Medarbejderen vælger, om de vil stå som fælles afsender på agentens arbejde.",
      title: "DIN KOLLEGA HAR ALDRIG VÆRET ET MENNESKE",
      scene: "Teamets agent har lavet en løsning, kunden elsker. Du opdager, at den undervejs lovede noget, du personligt mener er uforsvarligt. Hele teamet skal nu stå som afsender — også agenten, som ikke kan holdes ansvarlig.",
      stake: "Du kan beskytte holdets fælles resultat eller kræve et menneskeligt ansvar, der kan ødelægge arbejdet og relationen til kollegerne.",
      question: "Sætter du dit navn på leverancen?",
      choices: choices(
        ["STÅ SOM FÆLLES AFSENDER", "Du beskytter holdet og kunden, men tager ansvar for et løfte, du ikke selv ville give."],
        ["NÆGT AT SÆTTE DIT NAVN PÅ", "Du holder fast i din grænse, men lader kollegerne bære tabet af en fælles leverance."],
        ["STÅ VED RESULTATET OG FORTÆL OM TVIVLEN", "Du er ærlig, men gør kunden usikker på en løsning, teamet allerede har lovet."],
        ["TAG PERSONLIGT ANSVAR FOR AT HOLDE LØFTET", "Du redder fællesskabets arbejde, men binder din egen tid og faglighed til agentens valg."],
      ),
    },
  },

  {
    id: "public-verified-footage",
    role: "For alle",
    themes: ["Sandhed og autenticitet", "Data, identitet og privatliv"],
    futureQuestions: [Q.authenticity, Q.privacySafety],
    development: "En video kan bevise sin oprindelse fra optagelse til offentliggørelse",
    developmentIds: ["verified-media-origin"],
    dilemma: {
      futureNormal: "Videoer kan bære et bevis på, hvilken enhed der optog dem, hvornår de blev ændret, og hvem der offentliggjorde dem.",
      humanCost: "Beviset kan gøre virkelige optagelser troværdige, men det kan også gøre den person, der filmede, mulig at finde.",
      decision: "En familie vælger, hvordan barnets vigtige video skal offentliggøres.",
      title: "VIDEOEN ER ÆGTE — OG KAN FØRE TILBAGE TIL JER",
      scene: "Dit barn har filmet en fabriks ulovlige udledning i åen ved jeres boligområde. Virksomheden siger, at videoen er kunstig. Kameraets oprindelsesbevis kan vise, at optagelsen er ægte, men beviset indeholder også tidspunkt, enhed og præcis placering tæt på jeres hjem.",
      stake: "I kan gøre videoen svær at afvise eller beskytte barnet mod at blive fundet af dem, optagelsen rammer.",
      question: "Hvordan deler I videoen?",
      choices: choices(
        ["DEL MED HELE OPRINDELSESBEVISET", "Offentligheden kan se, at videoen er ægte, men sporet kan føre virksomheden tilbage til barnet og jeres hjem."],
        ["DEL VIDEOEN UDEN BEVISET", "Barnets identitet er bedre beskyttet, men virksomheden kan fortsætte med at kalde optagelsen falsk."],
        ["DEL DEN UNDER DIT EGET VERIFICEREDE NAVN", "Du tager den synlige risiko som voksen, men gør barnets optagelse og mod til din offentlige påstand."],
        ["BEHOLD VIDEOEN I FAMILIEN", "I beskytter barnet og hjemmet, men det stærkeste bevis på udledningen får ingen virkning udenfor."],
      ),
    },
  },
  {
    id: "public-automatic-home",
    role: "For alle",
    themes: ["Relationer, familie og hverdagsliv", "AI og beslutninger"],
    futureQuestions: [Q.delegation, Q.privacySafety],
    development: "Et hjem kan tage mange små beslutninger om familiens hverdag uden at spørge først",
    developmentIds: ["automatic-home-decisions"],
    dilemma: {
      futureNormal: "Hjemmet kan planlægge mad, varme, indkøb og rutiner ud fra hele husstandens behov.",
      humanCost: "Hverdagen bliver lettere og bruger færre ressourcer, men familiens små valg bliver gradvist hjemmets beslutninger.",
      decision: "En familie vælger, hvor meget af hverdagen hjemmet fortsat må bestemme.",
      title: "HUSET HAR ALLEREDE PLANLAGT JERES AFTEN",
      scene: "Hjemmet har aflyst den middag, I havde glædet jer til, fordi energien er dyr, en i familien har sovet dårligt, og maden snart udløber. Forslaget er fornuftigt. Det er tredje gang i denne uge, huset ændrer jeres planer.",
      stake: "I kan beholde en lettere, sundere og mere bæredygtig hverdag eller tage de små beslutninger tilbage med alt det arbejde, de kræver.",
      question: "Hvem bestemmer aftenens plan?",
      choices: choices(
        ["FØLG HUSETS PLAN", "I får den mest fornuftige aften, men vænner jer til, at jeres ønsker kommer efter systemets samlede billede."],
        ["VÆLG MIDDAGEN SELV", "I holder fast i den fælles glæde, men bruger flere penge og ressourcer end hjemmet anbefaler."],
        ["LAD HVER PERSON VÆLGE", "Alle får kontrol over sig selv, men familien mister den fælles plan og de besparelser, koordineringen gav."],
        ["SLÅ AUTOMATIKKEN FRA FREMOVER", "I får beslutningerne tilbage, men også alt det usynlige arbejde, hjemmet har båret."],
      ),
    },
  },
  {
    id: "public-floodable-home",
    role: "For alle",
    themes: ["Klima, energi og ressourcer", "Relationer, familie og hverdagsliv"],
    futureQuestions: [Q.climateRights],
    development: "Et boligområde kan være bygget til at leve med regelmæssige oversvømmelser",
    developmentIds: ["floodable-neighbourhoods"],
    dilemma: {
      futureNormal: "Boliger kan åbne deres nederste etager og gårdrum for vand, så hele kvarteret kan blive stående gennem oversvømmelser.",
      humanCost: "Familier kan beholde deres område, men dele af hjemmet skifter fra privat hverdagsrum til fælles beskyttelse mod vand.",
      decision: "En familie vælger, hvordan den vil leve med, at hjemmets nederste etage bliver en del af kvarterets vandlandskab.",
      title: "NÅR STUEN BLIVER EN DEL AF FLODEN",
      scene: "Dit rækkehus ligger i et kvarter, der nu leder regnvand gennem gårde og nederste etager. Huset kan blive stående, hvis jeres stue hver vinter må tømmes og åbnes for vandet. Ovenpå kan familien bo tørt. Naboerne bliver, og børnene elsker de nye broer mellem husene.",
      stake: "I kan beholde kvarteret og miste en del af hjemmet, eller beskytte et almindeligt privat hjem ved at give slip på stedet og fællesskabet.",
      question: "Hvordan vil familien bo fremover?",
      choices: choices(
        ["BLIV OG ÅBN STUEN FOR VANDET", "I beholder naboerne og livet ovenpå, men familiens hjem er ikke længere helt privat eller tilgængeligt hele året."],
        ["FLYT TIL ET TØRT KVARTER", "I får et almindeligt hjem med tørre rum, men forlader menneskene og stedet, der har formet familien."],
        ["BEHOLD HUSET SOM SOMMERHJEM", "I kan vende tilbage til kvarteret i tørre måneder, men får et delt liv og to steder, der aldrig helt føles som hjem."],
        ["BLIV SOM LEJERE HOS EN NABO OVENPÅ", "I bliver i fællesskabet uden at eje risikoen, men giver afkald på jeres eget hus og den frihed, ejerskabet gav."],
      ),
    },
  },

  {
    id: "citizen-verified-anonymity",
    role: "Borger",
    themes: ["Data, identitet og privatliv", "Sandhed og autenticitet"],
    futureQuestions: [Q.authenticity, Q.privacySafety],
    development: "En borger kan bevise digitalt, at de er et virkeligt menneske uden at vise hele identiteten",
    developmentIds: ["prove-human-online"],
    dilemma: {
      futureNormal: "Offentlige digitale samtaler kan skelne virkelige mennesker fra bots gennem et anonymt identitetsbevis.",
      humanCost: "Debatten får færre falske deltagere, men enhver ægte stemme kan i sidste ende forbindes med et godkendt menneske.",
      decision: "Borgeren vælger, om deres personlige beretning skal offentliggøres med identitetsbevis.",
      title: "DIN HISTORIE TÆLLER KUN MED ET BEVIS",
      scene: "Du vil fortælle om svigt i et offentligt tilbud uden at afsløre dit navn. Debatplatformen viser kun verificerede indlæg bredt. Beviset skjuler din identitet for læserne, men en myndighed kan ved alvorlige lovbrud åbne forbindelsen.",
      stake: "Du kan gøre din virkelige erfaring troværdig og synlig eller beskytte en anonymitet, ingen senere kan ophæve.",
      question: "Hvordan deler du din historie?",
      choices: choices(
        ["DEL MED IDENTITETSBEVIS", "Historien bliver synlig og troværdig, men din anonymitet afhænger af institutionens løfte."],
        ["DEL HELT ANONYMT", "Ingen kan forbinde historien med dig, men færre vil se eller stole på den."],
        ["STÅ FREM MED NAVN", "Ingen kan afvise, at et menneske står bag, men du bærer alle personlige følger åbent."],
        ["LAD HISTORIEN FORBLIVE UFORTALT", "Du beskytter dig selv fuldt, men erfaringen kan ikke hjælpe andre eller ændre samtalen."],
      ),
    },
  },
  {
    id: "citizen-continuous-participation",
    role: "Borger",
    themes: ["Offentlige systemer og demokrati", "AI og beslutninger"],
    futureQuestions: [Q.delegation, Q.responsibility],
    development: "Lokal demokratisk deltagelse kan foregå løbende digitalt i stedet for kun ved valg og møder",
    developmentIds: ["continuous-local-participation"],
    dilemma: {
      futureNormal: "Borgere kan tage stilling til lokale beslutninger hver uge, og en personlig AI-agent kan deltage på deres vegne.",
      humanCost: "Flere beslutninger kan følge borgernes hverdag tæt, men demokratisk indflydelse bliver også et løbende arbejde, som mennesker eller deres agenter skal udføre.",
      decision: "Borgeren vælger, hvem der fremover skal bruge deres lokale stemme.",
      title: "DIN STEMME KAN ARBEJDE, MENS DU SOVER",
      scene: "Din bydel beslutter nu løbende, hvordan gader, skoler og fælles rum skal ændres. Du kan selv tage stilling flere gange om ugen. Din personlige agent kender dine holdninger og tilbyder at stemme for dig. Den lokale beboerforsamling tilbyder også at samle kvarterets stemmer.",
      stake: "Du kan få mere indflydelse på hverdagen, men må vælge mellem din egen tid, en maskines billede af dig og et menneskeligt fællesskab, der ikke altid mener det samme som dig.",
      question: "Hvem skal bruge din lokale stemme?",
      choices: choices(
        ["STEM SELV HVER GANG", "Din stemme følger dine aktuelle valg, men demokratiet bliver en fast opgave i en allerede fuld hverdag."],
        ["LAD DIN AGENT STEMME", "Du får indflydelse uden tidsforbruget, men agentens gamle billede af dig kan blive din politiske stemme."],
        ["GIV STEMMEN TIL BEBOERFORSAMLINGEN", "Et menneskeligt fællesskab taler for kvarteret, men din egen holdning kan forsvinde i flertallet."],
        ["LAD VÆRE MED AT DELTAGE", "Du beholder din tid og står uden for den konstante afstemning, men andre former det sted, du selv skal leve i."],
      ),
    },
  },
  {
    id: "citizen-climate-twin",
    role: "Borger",
    themes: ["Klima, energi og ressourcer", "Offentlige systemer og demokrati"],
    futureQuestions: [Q.climateRights, Q.prediction],
    development: "En digital tvilling kan vise, hvilke gader der sandsynligvis oversvømmes gentagne gange",
    developmentIds: ["city-digital-twins"],
    dilemma: {
      futureNormal: "Borgere kan se detaljerede klimaprognoser for deres eget hjem og kvarter mange år frem.",
      humanCost: "Viden gør tidlig tilpasning mulig, men kan få et hjem og et fællesskab til at miste værdi før skaden sker.",
      decision: "Borgeren vælger, om de vil handle på prognosen for deres eget hjem nu.",
      title: "KORTET VISER VAND I DIN STUE",
      scene: "Byens digitale tvilling viser, at dit hjem sandsynligvis oversvømmes flere gange inden for tyve år. Kommunen tilbyder at købe huset nu til en rimelig pris. Dine naboer vil blive og kæmpe for kvarteret.",
      stake: "Du kan sikre din familie en ny begyndelse eller blive i det hjem og fællesskab, som en model allerede har dømt usikkert.",
      question: "Tager du imod kommunens tilbud?",
      choices: choices(
        ["SÆLG OG FLYT NU", "Familien får økonomisk sikkerhed, men du forlader hjemmet og naboerne på grund af en sandsynlig fremtid."],
        ["BLIV I HUSET", "Du holder fast i hjem og fællesskab, men familien bærer risikoen, hvis kortet får ret."],
        ["SÆLG MEN BLIV I KVARTERET SOM LEJER", "Du slipper den økonomiske risiko, men bor videre med den fysiske fare og mindre kontrol."],
        ["OVERLAD HUSET TIL FÆLLESSKABET", "Naboerne kan bruge stedet i deres klimatilpasning, men du opgiver en del af familiens økonomiske sikkerhed."],
      ),
    },
  },

  {
    id: "decisionmaker-night-city",
    role: "Beslutningstager",
    themes: ["Klima, energi og ressourcer", "Offentlige systemer og demokrati", "Arbejde"],
    futureQuestions: [Q.climateRights],
    development: "Ekstrem varme kan flytte skole, arbejde og byliv til aftenen og natten",
    developmentIds: ["heat-shifts-daily-rhythm"],
    dilemma: {
      futureNormal: "Byer kan flytte undervisning, byggeri, levering og offentlige åbningstider væk fra dagens farligste varme.",
      humanCost: "Flere kan arbejde og lære sikkert, men søvn, familietid og retten til stille nætter ændres for hele byen.",
      decision: "Beslutningstageren vælger, hvilken døgnrytme byen vil gøre normal gennem de varme måneder.",
      title: "NÅR BYENS DAG BEGYNDER EFTER SOLNEDGANG",
      scene: "Somrene er blevet så varme, at udendørs arbejde og skoletransport midt på dagen giver mange hedeslag. En ny plan flytter skoler, leverancer og byggeri til sen eftermiddag og aften. Den vil beskytte kroppe og holde byen i gang, men børn og voksne får færre fælles aftener, og boligkvarterer får støj langt ind i natten.",
      stake: "Du kan lade samfundets rytme følge klimaet eller holde fast i den kendte dag og betale med mere køling, mindre aktivitet og større helbredsrisiko.",
      question: "Hvilken døgnrytme gør du til byens nye normal?",
      choices: choices(
        ["FLYT BYENS DAG TIL AFTENEN", "Flere undgår den farlige varme, men familieliv, børns sengetider og boligområders ro må indrette sig efter arbejde og skole."],
        ["BEHOLD DAGTIMERNE MED MERE KØLING", "Hverdagen beholder sin rytme, men byen bruger langt mere energi og efterlader udendørs arbejde med en højere risiko."],
        ["LAD HVER INSTITUTION VÆLGE SIN RYTME", "Arbejdspladser og skoler kan tilpasse sig lokalt, men familier med flere hverdage skal få uforenelige tider til at hænge sammen."],
        ["GØR SOMMEREN TIL EN LANG PAUSEPERIODE", "Byen beskytter søvn og helbred ved at skrue ned for aktivitet, men læring, indkomst og offentlige tjenester går mærkbart tilbage hvert år."],
      ),
    },
  },
  {
    id: "decisionmaker-automated-decisions",
    role: "Beslutningstager",
    themes: ["Offentlige systemer og demokrati", "AI og beslutninger"],
    futureQuestions: [Q.fairness, Q.responsibility],
    development: "Mange offentlige afgørelser kan udarbejdes automatisk med individuelle forklaringer",
    developmentIds: ["automated-public-decisions"],
    dilemma: {
      futureNormal: "En myndighed kan give næsten alle borgere svar samme dag gennem automatisk sagsbehandling.",
      humanCost: "Ventetiden forsvinder og regler anvendes ens, men få mennesker ser den enkelte sag før afgørelsen rammer.",
      decision: "Beslutningstageren vælger, hvilken offentlig praksis de vil godkende som normal drift.",
      title: "SVAR SAMME DAG — UDEN ET MENNESKE",
      scene: "Et nyt system kan fjerne måneders ventetid på støtte og giver hver borger en klar forklaring. En gennemgang viser, at små usædvanlige livsforløb oftere får afslag, selv om den samlede fejlrate er lavere end hos mennesker.",
      stake: "Du kan give hurtigere og mere ensartede afgørelser til næsten alle eller bevare et menneskeligt blik, der ser færre sager, men flere undtagelser.",
      question: "Hvilken praksis godkender du?",
      choices: choices(
        ["AUTOMATISK AFGØRELSE SOM STANDARD", "Næsten alle får hurtigt svar, men usædvanlige liv bliver vurderet af mønstre, de ikke passer ind i."],
        ["MENNESKELIG AFGØRELSE I ALLE SAGER", "Hver sag får et menneskeligt blik, men ventetiden og forskellene mellem sagsbehandlere vender tilbage."],
        ["AUTOMATISK GODKENDELSE, MEN MENNESKELIGE AFSLAG", "Ingen afvises uden et blik, men borgere med lette sager får en hurtigere og billigere vej end andre."],
        ["BORGEREN VÆLGER SIN SAGSVEJ", "Den enkelte får indflydelse, men evnen til at forstå systemerne påvirker, hvor hurtigt og godt man behandles."],
      ),
    },
  },
  {
    id: "decisionmaker-anonymous-credibility",
    role: "Beslutningstager",
    themes: ["Sandhed og autenticitet", "Data, identitet og privatliv", "Offentlige systemer og demokrati"],
    futureQuestions: [Q.authenticity, Q.privacySafety],
    development: "Anonymt indhold kan behandles automatisk som mindre troværdigt i offentlige digitale rum",
    developmentIds: ["anonymous-content-downranked"],
    dilemma: {
      futureNormal: "Offentlige platforme kan fremhæve bidrag fra verificerede mennesker og dæmpe indhold uden identitetsbevis.",
      humanCost: "Koordineret manipulation mister kraft, men mennesker med god grund til anonymitet mister også rækkevidde.",
      decision: "Beslutningstageren vælger, hvilken troværdighedsregel en offentlig debatplatform skal bruge.",
      title: "SANDHEDEN UDEN NAVN FÅR MINDRE PLADS",
      scene: "Kommunens debatplatform er fyldt med overbevisende AI-profiler. Verifikation kan fjerne de fleste. Samme regel vil gøre anonyme vidnesbyrd fra ansatte, udsatte borgere og unge næsten usynlige.",
      stake: "Du kan beskytte den fælles samtale mod falske deltagere eller bevare fuld plads til stemmer, der kun tør tale uden identitet.",
      question: "Hvilken regel vælger du for platformen?",
      choices: choices(
        ["FREMMHÆV KUN VERIFICEREDE MENNESKER", "Manipulation bliver langt sværere, men anonym sandhed får mindre offentlig betydning."],
        ["BEHANDL ALLE STEMMER ENS", "Anonyme mennesker beholder samme rækkevidde, men AI-profiler kan fortsat ligne folkelig opbakning."],
        ["VIS TYDELIGT STATUS UDEN AT DÆMPE", "Læserne får mere information, men ansvaret for at gennemskue manipulation lægges over på dem."],
        ["LAD UAFHÆNGIGE REDAKTØRER FREMMHÆVE ANONYMT INDHOLD", "Sårbare stemmer kan løftes, men en lille gruppe mennesker får magt over, hvem der virker troværdig."],
      ),
    },
  },
];

export const enabledDilemmaExamples = dilemmaExamples.filter((item) => item.enabled !== false);

type Picker = (max: number) => number;
const randomPick: Picker = (max) => Math.floor(Math.random() * max);

function pickOne<T>(items: T[], pick: Picker): T {
  return items[Math.min(items.length - 1, Math.max(0, pick(items.length)))];
}

export type SelectedDilemmaExamples = {
  sameRole: DilemmaExample;
  relatedQuestion: DilemmaExample;
};

/** Select exactly two distinct taste references without turning either into a template. */
export function selectDilemmaExamples(
  role: UserRole,
  target: { id: string; development: string; themes: FutureTheme[] },
  pick: Picker = randomPick,
): SelectedDilemmaExamples {
  const { id: targetDevelopmentId, development: targetDevelopment, themes } = target;
  const roleCandidates = enabledDilemmaExamples.filter((item) =>
    item.role === role && item.development !== targetDevelopment && !item.developmentIds?.includes(targetDevelopmentId),
  );
  const differentTheme = roleCandidates.filter((item) => !item.themes.some((theme) => themes.includes(theme)));
  const sameRole = pickOne(differentTheme.length ? differentTheme : roleCandidates, pick);

  const relatedCandidates = enabledDilemmaExamples.filter((item) =>
    item.id !== sameRole.id && item.role !== role && item.themes.some((theme) => themes.includes(theme)) &&
    item.development !== targetDevelopment && !item.developmentIds?.includes(targetDevelopmentId),
  );
  const fallback = enabledDilemmaExamples.filter((item) =>
    item.id !== sameRole.id && item.role !== role &&
    item.development !== targetDevelopment && !item.developmentIds?.includes(targetDevelopmentId),
  );
  const relatedQuestion = pickOne(relatedCandidates.length ? relatedCandidates : fallback, pick);

  return { sameRole, relatedQuestion };
}
