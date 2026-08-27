# World 2046 A/B/C diagnostic

Samme 10 planer i hvert setup. Ét authoring-kald per rolle per setup. Ingen retries eller regenerationer.

## Automatisk summary

- A: 7/10 accepted · 16074 ms avg · 52990 input · 18992 output
- B: 9/10 accepted · 10458 ms avg · 11710 input · 11062 output
- C: 10/10 accepted · 36064 ms avg · 11710 input · 19050 output

## Setup A — baseline

### A1. Barn — GODKENDT

- Plan: extreme-heat · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 16509 ms · 5856 in · 1802 out

#### Hvem vil du være sammen med i varmen?

Du åbner døren i Generationernes Hus. Din ven står med en bold, og din mor kalder på dig fra køkkenet.

I 2046 holder skole og arbejde en lang pause midt på dagen, fordi hedebølger gør timerne farlige. Din ven vil lege nu, men din mor har kun tid til dig i den samme pause.

*Du kan beskytte tiden med din mor eller dit venskab, men du kan ikke få begge dele i dag.*

**Hvem vil du bruge pausen sammen med?**

1. **Gå ud med din ven** — Du går ud og leger med din ven, men din mor må spise frokost alene. → Din ven bliver glad og føler, at du stadig vælger jeres venskab. Din mor bliver stille resten af dagen.
2. **Bliv hos mor** — Du bliver hjemme og spiser med din mor, men din ven leger uden dig. → Din mor får den sjældne stund, hun har ønsket sig. Din ven føler sig valgt fra, da han går alene.
3. **Læg dig og hvil** — Du bruger pausen på at hvile dig, men både din ven og din mor mister tiden med dig. → Din krop får ro i varmen. Din ven og din mor må begge vente på en anden dag.
4. **Invitér din ven ind** — Du inviterer din ven til frokost med mor, men din mor mister den stille stund, hun havde glædet sig til. → Din ven er med, men din mor taler næsten ikke. Du får fællesskab, men ikke den nære tid alene med hende.

### A2. Ung — AFVIST (audience_language)

- Plan: ageing · Odense, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 18496 ms · 5241 in · 2157 out

#### Hvem får plads ved siden af hende?

Du træder ind på INCUBA Katrinebjerg med din første jobaftale på mobilen. Din mor venter ved et mødebord, hvor hendes navn står ved siden af dit på projektet.

I 2046 stopper folk sjældent fra den ene dag til den anden. På INCUBA møder du din mor, 68, som stadig arbejder tre dage om ugen, mens du får tilbudt hendes nye fælles stilling.

*Du kan få din første rigtige chance, men dit valg påvirker også din mors arbejde, selvstændighed og plads i familien.*

**Hvad siger du ja til som din første arbejdsplads?**

1. **Del ansvaret med mor** — Du tager stillingen som hendes makker og får hendes erfaring, men din egen vej begynder langsommere. → Din mor beholder et reelt ansvar og en tydelig plads; du får tryg oplæring, men må vente længere på selv at lede projektet.
2. **Tag projektet alene** — Du overtager projektet og får frihed til at skabe din egen karriere, men din mor mister sit vigtigste ansvar. → Du bliver hurtigt synlig på arbejdspladsen; din mor får færre beslutninger at træffe og mærker, at hendes erfaring ikke længere styrer retningen.
3. **Lad mor lede videre** — Du siger ja som hendes lærling og beskytter hendes rolle, men accepterer at være den, andre ser som nummer to. → Din mor kan fortsætte som projektets ansigt; du lærer meget, men dit første job bliver tæt knyttet til hende og sværere at kalde dit eget.
4. **Vælg den hurtige karrierevej** — Du vælger den AI-accelererede rolle uden din mor og rykker frem hurtigere, men mister den daglige relation til hende. → Du får adgang til større opgaver og højere løn; din mor arbejder stadig, men jeres fælles hverdag og mulighed for at lære af hinanden forsvinder.

### A3. Forælder — GODKENDT

- Plan: living-norms · København, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 15461 ms · 5228 in · 1804 out

#### Hvem må kende dit barns vej?

Du kommer til Randers Bibliotek med din datter efter skole. Ved skranken står hendes læringsassistent klar til at registrere den voksne, der fremover må følge hendes hverdag tæt.

I 2046 hjælper registrerede venner og naboer med at hente børn og følge deres læring. På Randers Bibliotek skal du nu vælge, hvor meget din datters læringsassistent må dele med hendes nære netværk.

*Dit valg kan give din datter flere trygge voksne, men også gøre hendes usikkerheder synlige for mennesker tæt på jer.*

**Hvem vil du lade følge dit barns læring og hverdag?**

1. **Vælg din partner** — Giv din partner fuld adgang til læringsprofilen, men hold hjælpen inden for familien. → Dit barn får en voksen, der allerede kender hjemmets rytme, men naboen Maja forbliver uden det indblik, hun har tilbudt at bruge i hverdagen.
2. **Vælg naboen Maja** — Giv Maja fuld adgang, så hun kan støtte dit barn tæt, men lad en del af familielivet blive kendt uden for hjemmet. → Maja kan opdage, når dit barn har brug for hjælp, men dit barn kan føle, at fejl og bekymringer ikke længere kun tilhører familien.
3. **Vælg barnets lærer** — Lad læreren følge profilen, så støtten hænger sammen med skolen, men gør læring mere synlig som præstation. → Dit barn får målrettet hjælp fra en fagperson, men kan begynde at opleve selv fritiden som en forlængelse af skolens blik.
4. **Vælg kun barnet selv** — Lad dit barn eje og styre sin profil, men uden en voksen der automatisk opdager, når hjælpen er nødvendig. → Dit barn får mest mulig kontrol over sit eget læringsspor, men skal selv bede om støtte, også når det måske ikke kan overskue det.

### A4. Lærer / pædagog — GODKENDT

- Plan: power-concentration · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 15461 ms · 5244 in · 1824 out

#### Skal Mika kende sin prognose?

Du sidder på Kolding Rådhus med Mikas mor og hans klasselærer. På skærmen står prognosen: høj risiko for skolefrafald, selv om Mika netop har afleveret sit bedste projekt.

I 2046 bruger Kolding Kommune en lejet beslutnings-AI, som samler skole-, sundheds- og fraværsdata for at opdage børn, der risikerer at falde ud. Den hjælper mange i tide, men gør det svært at se Mika uden om hans prognose.

*Mika kan få hjælp i tide, men risikerer at blive behandlet som sit dataspor og miste tilliden til dig.*

**Hvad vil du lægge til grund for Mikas næste skoleforløb?**

1. **Følg prognosen åbent** — Anbefal et tæt støtteforløb ud fra prognosen, men accepter at Mika mødes som et barn i risiko. → Mika får hurtigere hjælp og faste voksne omkring sig, men hans lærere og familie kan begynde at tolke hans fejl som bekræftelser på systemets dom.
2. **Stå ved din egen vurdering** — Anbefal det almindelige forløb ud fra Mikas aktuelle arbejde, men løb risikoen for at overse et behov, systemet har opdaget. → Mika bevarer friheden til at blive vurderet på det, han gør nu, men kan senere stå uden den støtte, der kunne have holdt ham i skolen.
3. **Fortæl Mika prognosen** — Anbefal støtteforløbet og vis Mika prognosen, men lad ham bære viden om systemets forventning til ham. → Mika kan forstå og udfordre den hjælp, han får, men kan også begynde at holde igen, fordi han tror, at nederlag allerede er skrevet ind i ham.
4. **Skærm ham fra prognosen** — Anbefal støtten uden at nævne prognosen, men accepter at andre træffer en skjult vurdering af hans fremtid. → Mika kan tage imod hjælpen uden at føle sig dømt, men du kan ikke ærligt forklare, hvorfor hans skoleforløb pludselig bliver tæt overvåget.

### A5. Fagperson — GODKENDT

- Plan: supply-chains · Odense, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 15971 ms · 5273 in · 1879 out

#### Må den ligne nok?

Du står på Esbjerg Havn med den printede propelflange i hænderne, mens din far venter ved kutteren. Den passer på plads, men du kan ikke give ham samme sporbarhed som en original del.

I 2046 kan forsynings-AI rekonstruere reservedele lokalt ud fra gamle modeller, så havnen ikke venter måneder på globale leverancer. I dag skal du tage ansvar for en del, der fungerer, men ikke er identisk med originalen.

*Din beslutning afgør, om din far kan sejle videre nu, eller må opgive sin sæson og sin lokale levevej.*

**Godkender du den lokalt printede del til din fars kutter?**

1. **Godkend delen** — Godkend delen, så din far kan sejle videre, men tag selv ansvaret for den usikkerhed, der følger med. → Din far kan fortsætte sæsonen, men hvis delen svigter, vil du have skrevet under på, at hurtig lokal forsyning var vigtigere end fuld sporbarhed.
2. **Afvis delen** — Afvis delen og kræv originalen, men accepter at din far mister sæsonen og måske sit arbejde. → Besætningen sejler ikke med en usikker del, men kutteren bliver liggende, og din far må forklare familien, hvorfor indtægten forsvandt.
3. **Godkend kun til lav fart** — Godkend delen til den langsommere rute, men accepter mindre fangst og en mere presset økonomi. → Din far kan sejle, men turene bliver længere og dyrere; du har valgt en begrænset drift frem for både fuld tryghed og fuld indtjening.
4. **Godkend og offentliggør afvigelsen** — Godkend delen og mærk kutteren offentligt, men gør din far synligt mindre attraktiv for købere og samarbejdspartnere. → Han kan arbejde videre med en lokal del, men kunder og besætning vil kende dens usikkerhed og kan vælge andre både.

### A6. Arbejdsgiver — AFVIST (bad_choices:missing_tradeoff)

- Plan: geopolitical-fragmentation · København, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 15873 ms · 5277 in · 2051 out

#### Skal Amina have ansvaret?

Du sidder i Vejle Kommunes ansættelsesudvalg, mens Amina venter udenfor døren. På skærmen står hendes forseglede risikovurdering, og du skal underskrive udpegningen.

I 2046 bliver persondata i den region, hvor man er født, i regionen. Det beskytter borgere mod udenlandsk profilering og gør fælles sikkerhedsmodeller mulige, men du kan ikke se eller efterprøve hele grundlaget for Aminas vurdering.

*Aminas karriere, teamets tillid og dit ansvar for kommunens sikkerhed står på spil.*

**Vil du give Amina ledelsesansvaret, når du ikke kan se hele grundlaget for vurderingen?**

1. **Udpeg Amina åbent** — Du udpeger Amina og siger, at din tillid til hendes arbejde vejer tungere end den forseglede risikovurdering. → Amina får sin lederchance, men du bærer selv ansvaret, hvis den ukendte risiko senere rammer teamet eller borgerne.
2. **Afvis hende på vurderingen** — Du vælger en anden kandidat og accepterer, at kommunens sikkerhed kræver tillid til den forseglede vurdering. → Kommunen får en leder, systemet vurderer som mindre risikabel, mens Amina mister en karrierevej uden at kunne se, hvad hun skulle forsvare sig imod.
3. **Udpeg hende trods markeringen** — Du udpeger Amina, fordi du nægter at lade et ubegribeligt resultat definere hendes egnethed, selv om du accepterer den mulige risiko. → Amina oplever reel retfærdighed, men teamet ved, at du bevidst har tilsidesat det eneste tværregionale sikkerhedssignal, kommunen har.
4. **Afvis hende trods din tillid** — Du afviser Amina, fordi du ikke vil placere et ukendt sikkerhedsansvar hos nogen, selv om du personligt stoler på hende. → Du beskytter teamet efter forsigtighedsprincippet, men Amina mister både muligheden og troen på, at hendes faktiske arbejde tæller.

### A7. Medarbejder — GODKENDT

- Plan: labour-shortage · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 15767 ms · 5232 in · 1871 out

#### Hvor skal dit arbejde høre hjemme?

Du møder ind på Regionshospitalet Horsens og ser den nordiske arbejdsplan på skærmen. Din partner skriver, at flyttekasserne står klar derhjemme, men at de ikke kan flytte med uden selv at opgive deres arbejde.

I møder ind på Regionshospitalet Horsens, hvor den nordiske vagtplan allerede har placeret dig på tre hospitaler det næste år. Din partner står med flyttekasser derhjemme, mens du skal vælge, hvilket arbejdsliv du vil leve.

*Du beskytter enten din faglighed, din hverdag med din partner, din indkomst eller din frihed til at skifte spor.*

**Hvilken arbejdsform vælger du for det næste år?**

1. **Bliv i specialistpuljen** — Du tager rundt mellem hospitalerne, men beholder din specialisering, løn og mulighed for at hjælpe de mest komplekse patienter. → Patienter i Horsens og andre nordiske byer får din ekspertise, men din partner må bygge hverdagen uden dig i lange perioder.
2. **Vælg fast arbejde lokalt** — Du tager en fast stilling i Horsens, men opgiver din specialisering og den højere indkomst, der følger med den nordiske pulje. → Din partner får dig tæt på, mens patienter med de sværeste forløb må undvære din særlige erfaring på hospitalet.
3. **Flyt med arbejdet** — Du og din partner flytter efter puljen, men giver afkald på deres arbejde, familie og det liv, I har bygget i Horsens. → I kan blive sammen og du kan fortsætte som specialist, men din partner mister sit lokale netværk og sin egen karriere.
4. **Forlad specialistfaget** — Du siger op som specialist og vælger et mindre krævende fagligt spor, men mister indkomst, status og mange års træning. → Din partner får en stabil hverdag med dig, mens kollegerne mister en erfaren specialist, som det tager år at erstatte.

### A8. For alle — GODKENDT

- Plan: cyber-infrastructure · Odense, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 14634 ms · 5186 in · 1808 out

#### Skal jeres hjem gå først?

Du står i opgangen i et boligområde i Esbjerg, mens din datter kommer hjem med sin inhalator. På din telefon står der, at jeres blok afkobles først efter et angreb på elnettet, medmindre du åbner hjemmet for systemets sensorer.

I 2046 lukker AI-styrede elnet automatisk boligområder ned i en fast rækkefølge under cyberangreb. Det holder hele regionen stabil, men i dag skal dit hjem enten bære afbrydelsen eller dele intime data for at blive skånet.

*Din familie kan få varme og strøm under angreb, men prisen er enten utryghed i hjemmet eller et indblik i jeres liv, som ikke kan trækkes tilbage.*

**Hvad accepterer du for at holde din familie tryg, når elnettet angribes?**

1. **Tag jeres afbrydelse** — Du accepterer, at jeres hjem går tidligt ned, men beskytter familiens ret til et privat hjem. → Din datter må klare aftenen uden stabil strøm og varme, mens naboerne længere nede i rækkefølgen får mere tid, før deres hjem rammes.
2. **Åbn hjemmet for systemet** — Du giver systemet fuldt indblik i jeres rum og vaner, men får større sikkerhed for strøm til din datter. → Boligen skånes, fordi systemet kan se hendes behov, men familiens mest private døgnrytme bliver en del af elnettets beredskab.
3. **Bær en større del** — Du vælger at lade jeres hjem blive afbrudt længere, men giver andre sårbare boliger førsteprioritet. → Din datter får en mere usikker aften, mens en ukendt familie i regionen kan blive holdt varm under angrebet på grund af jeres afkald.
4. **Sæt jer foran andre** — Du accepterer tæt overvågning af hjemmet og en højere prioritet, men ved, at andre må miste strøm før jer. → Din datter er beskyttet, men du ved, at familiens tryghed under angrebet bygger på en større risiko for andre beboere.

### A9. Borger — GODKENDT

- Plan: antibiotic-resistance · København, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 15460 ms · 5202 in · 1781 out

#### Skal Saras infektionsspor følge hende?

Du står på Københavns Stads Apotek med Saras prøvesvar på skærmen. Kurven er klar, men apotekeren spørger, om hendes særlige infektionsprofil skal følge hende videre.

I 2046 bliver ingen antibiotika udleveret, før en præcis test viser, hvad der virker. På apoteket kan du give Saras infektionsprofil videre til fremtidig behandling — men den kan også følge hende i mange år.

*Saras næste behandling kan blive hurtigere og mere sikker, men hendes private helbredsoplysninger kan følge hende længe.*

**Hvad vælger du at gøre med Saras infektionsprofil?**

1. **Kobl profilen til Saras ID** — Du kobler profilen til Saras ID, så fremtidige behandlinger kan målrettes straks, men hendes sygdomshistorie bliver varigt søgbar. → Hvis Sara bliver syg igen, kan sundhedspersonalet handle hurtigt; til gengæld må hun leve med, at flere kan se et meget personligt helbredsforløb.
2. **Gem den kun lokalt** — Du lader profilen blive hos Saras egen læge, så hun får noget beskyttelse, men andre steder må teste hende næsten forfra. → Saras læge kender hendes særlige resistens, mens en akut behandling på rejse eller hos en anden klinik kan blive langsommere og mere usikker.
3. **Giv den til forskningen anonymt** — Du frigiver profilen anonymt til forskning, men Sara får ikke selv fordel af en genfindbar personlig behandlingshistorik. → Andre børn kan måske få bedre behandling, men Saras næste læge har ikke adgang til netop den viden, der kunne spare hende for en fejlbehandling.
4. **Lad den forsvinde** — Du beder om, at profilen ikke gemmes efter kuren, så Saras spor lukkes, men fremtidige læger mister en vigtig advarsel. → Saras privatliv er bedst beskyttet nu, men ved en ny infektion kan hun igen få en bred behandling, der ikke virker eller fremmer mere resistens.

### A10. Beslutningstager — AFVIST (bad_location_fit)

- Plan: new-work-forms · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 17104 ms · 5251 in · 2015 out

#### Hvem ejer dit arbejde?

Du træder ind i byrådssalen på Næstved Rådhus, hvor aftalen om kommunens nye arbejdskooperativ ligger foran dig. Maja sidder blandt tilhørerne og ved, at hendes ejerandel afhænger af din underskrift.

I 2046 ejer mange nordiske arbejdere en andel af robotterne, platformene og AI-systemerne, der skaber deres indkomst. I Næstved skal du godkende kommunens model, men din tidligere kollega Maja står til at miste sin andel, hvis hun ikke accepterer systemets arbejdsliv.

*Du kan give flere mennesker en stabil andel i værdierne, men nogle mister retten til selv at vælge, hvornår og hvordan de arbejder.*

**Hvilken arbejdsmodel vil du skrive under på, når alle muligheder koster nogen deres tryghed eller frihed?**

1. **Godkend fuld fælleseje** — Du godkender fælles ejerskab med forpligtende AI-planer, men Maja kan miste sin andel ved gentagne afslag. → Flere ustabile arbejdere får en forudsigelig indkomst og medejerskab, mens Maja må vælge mellem sin søns behov og sin plads i fællesskabet.
2. **Beskyt retten til at sige nej** — Du binder modellen til frit valg af opgaver, men accepterer lavere og mere uforudsigelige ejerudbetalinger. → Maja beholder kontrollen over sin tid, men hun og andre med ustabile liv får mindre mulighed for at betale bolig og omsorg gennem deres andele.
3. **Lad borgerne eje mest** — Du giver Næstveds borgere hovedparten af andelene, men arbejderne får løn frem for langsigtet medejerskab. → Kommunens afkast kan finansiere velfærd for alle, men Maja får ingen del af den stigende værdi, hun selv er med til at skabe.
4. **Bevar kommunalt ejerskab** — Du lader kommunen eje systemerne og garanterer faste lønninger, men opgiver arbejdernes direkte andel i gevinsten. → Maja får mere forudsigelig løn uden at blive målt som medejer, mens medarbejderne mister indflydelse på de systemer, der bestemmer deres arbejde.

## Setup B — simplified

### B1. Barn — AFVIST (bad_location_fit)

- Plan: extreme-heat · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 10472 ms · 1224 in · 1142 out

#### Det, sensoren ikke må vide

Aarhus, 2046. På din skole holder alle pause midt på dagen, når varmen er værst. Et armbånd viser, hvem der skal ind i kølerummet. Din ven har slået sit fra. Nu beder din ven dig om ikke at sige det.

Du står ved døren til skolens kølerum. Din ven har gemt armbåndet i tasken. Uden det ved læreren ikke, om din ven bliver for varm. Din ven siger: "Hvis du siger noget, bestemmer de over mig hele dagen."

*Du kan beskytte din vens krop, men bryde et løfte. Eller beskytte din vens ret til selv at vælge, men lade en risiko være skjult.*

**Hvad gør du, når sikkerhed kræver oplysninger, som din ven selv vil holde private?**

1. **Sig det til læreren med det samme** — Du fortæller læreren, at armbåndet er slået fra, selv om din ven bad dig tie. → Din ven får hjælp og bliver måske sendt ind i kølerummet. Men din ven kan føle sig svigtet og ikke stole på dig igen.
2. **Hold løftet og sig ingenting** — Du beskytter hemmeligheden og lader din ven vælge, hvad skolen skal vide. → Din ven beholder kontrollen over sine data. Men hvis varmen gør din ven syg, kan du føle, at du kunne have grebet ind.
3. **Sig, at din ven selv må fortælle det** — Du hjælper ikke med at skjule armbåndet, men du siger heller ikke noget til læreren endnu. → Din ven får en chance for selv at vælge. Men tilliden mellem jer kan briste, og risikoen er stadig ikke kendt af en voksen.
4. **Fortæl læreren det sammen med din ven** — Du siger til din ven, at du kun går med, hvis I begge fortæller læreren, hvad der er sket. → Din ven får støtte og bliver hørt. Men oplysningerne bliver stadig delt, og din ven kan mene, at du pressede et svar frem.

### B2. Ung — GODKENDT

- Plan: ageing · Odense, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 12154 ms · 1192 in · 1218 out

#### Mormors hjem ved, når noget er galt

Det er aften i jeres generationsbolig i Odense. Mormor vil blive hjemme, og rummets sensorer følger hendes søvn, fald, toiletbesøg og humør. Nu får du tilbudt en plads på din drømmeuddannelse, hvis du bliver hendes digitale kontaktperson.

Du sidder med mormor ved køkkenbordet. Hun siger ja til systemet, fordi det gør det muligt at blive hjemme. Du kan se alt i appen, også ting hun ikke selv ved bliver registreret. Uddannelsestilbuddet kræver, at du tager rollen som kontaktperson.

*Mormors tryghed og mulighed for at blive hjemme står over for hendes privatliv, jeres tillid og din egen uddannelsesmulighed.*

**Hvad gør du, når din vej videre kræver adgang til et menneskes mest private hverdag?**

1. **Sig ja og vær helt åben om dataene** — Du bliver kontaktperson, viser mormor alle registreringer og accepterer, at systemet følger hendes hverdag tæt. → Mormor får hurtig hjælp, og du får uddannelsespladsen. Men hun kan føle sig udstillet, og du bliver den, der ser ting, hun aldrig ville fortælle dig.
2. **Sig ja, men skjul de mest intime data** — Du tager rollen, men lover mormor kun at dele alarmer om fald, sygdom og akut fare med systemet. → I bevarer noget privatliv, og du får chancen. Hvis en vigtig ændring overses, kan mormor blive skadet, og du kan føle, at ansvaret er dit.
3. **Afvis rollen og beskyt mormors privatliv** — Du siger nej til uddannelsespladsen og beder mormor vælge almindelig hjemmehjælp uden dig som dataansvarlig. → Du svigter ikke hendes grænser, men mister en sjælden vej til din drømmeuddannelse. Mormor kan også blive nødt til at flytte tidligere.
4. **Accepter, men fortæl andre hvad systemet viser** — Du bruger rollen og deler systemets praksis med din ven og klasse, så flere kan diskutere prisen ved at blive boende hjemme. → Mormor kan få mere indflydelse på reglerne, men hun mister kontrollen over sin egen historie. Hun kan føle sig hængt ud og trække sit samtykke.

### B3. Forælder — GODKENDT

- Plan: living-norms · København, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 10844 ms · 1163 in · 1041 out

#### Dit barns læringsspor

Det er forældremøde på en folkeskole i København. I 2046 bygger de fleste deres uddannelse i korte forløb hele livet. Skolen tilbyder derfor dit 14-årige barn en livslang læringsprofil med dokumenterede projekter, samarbejdsformer og faglige fremskridt. Profilen kan åbne døren til attraktive forløb allerede nu, men den

På skolen skal du som forælder tage stilling til, om dit 14-årige barn må få en livslang læringsprofil. Dit barn ønsker den for at komme ind på et eftertragtet klimaforløb. Du frygter, at tidlige fejl og vurderinger følger barnet ind i voksenlivet.

*Dit valg kan give barnet flere uddannelsesmuligheder nu, men også gøre barnets skoleliv til en permanent mappe, som andre senere kan læse.*

**Vil du give samtykke til profilen, selv om den kan forme andres syn på dit barn længe efter skolen?**

1. **Giv fuldt samtykke nu** — Du lader skolen opbygge og dele hele profilen, fordi muligheden betyder meget for dit barn. → Barnet får den bedste adgang til forløb og mentorer, men tidlige nederlag, styrker og lærervurderinger kan påvirke fremtidige valg uden barnets fulde kontrol.
2. **Sig nej, indtil barnet selv kan vælge** — Du beskytter barnets ret til at starte voksenlivet uden et offentligt læringsspor. → Barnet undgår den permanente registrering, men kan miste adgang til forløbet og opleve, at du beskyttede det mod en mulighed, det selv ønskede.
3. **Godkend kun skolens interne brug** — Du accepterer profilen til undervisning, men ikke deling med andre skoler eller udbydere. → Barnet får støtte i hverdagen, men står svagere ved optagelser, fordi andre ikke kan se den dokumentation, som jævnaldrende bruger.
4. **Lad barnet bestemme med åbne øjne** — Du siger ja på betingelse af, at I sammen gennemgår, hvad profilen kan koste, før barnet vælger. → Barnet får reel indflydelse og lærer at tage ansvar, men du må acceptere risikoen for et valg, barnet senere fortryder, og som du ikke kan gøre om.

### B4. Lærer / pædagog — GODKENDT

- Plan: power-concentration · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 8717 ms · 1165 in · 928 out

#### Når modellen kender barnet bedre end dig

Du er lærer i Aarhus i 2046. Kommunen lejer en læringsmodel, som samler elevens skoledata fra tidligere systemer. Den anbefaler, at du flytter 12-årige Malik til et mindre hold med individuel AI-støtte.

Malik klarer sig fagligt bedre i modellens forløb, men mister sine venner og siger, at han føler sig sorteret fra. Du kan se, at anbefalingen bygger på data fra en anden kommune, som familien ikke kendte til.

*Malik kan få en reel faglig chance, men risikerer at miste tilhørsforholdet og tilliden til dig. Din beslutning påvirker også, hvad klassen lærer om forskellighed.*

**Hvad gør du, når systemets bedste prognose strider mod din viden om barnets liv i klassen?**

1. **Følg anbefalingen fuldt ud** — Du flytter Malik til det lille hold og forklarer, at det er den bedste faglige mulighed. → Malik får sandsynligvis hurtigere faglig fremgang, men oplever måske beslutningen som en dom over ham. Du styrker systemets autoritet på hans bekostning.
2. **Lad Malik blive i klassen** — Du afviser anbefalingen og bygger støtten ind i den almindelige undervisning. → Malik beholder sine venner og din tillid, men kan gå glip af hjælp, der faktisk kunne have ændret hans skolegang. Du bærer ansvaret, hvis han sakker bagud.
3. **Lad Malik vælge med åbne øjne** — Du viser ham og hans forælder modellens grundlag og lader deres valg afgøre placeringen. → Malik får reel indflydelse, men du lægger et tungt valg på et barn og gør hans skoleliv afhængigt af familiens evne til at gennemskue systemet.
4. **Sæt din egen faglige vurdering først** — Du fastholder ham i klassen nu og siger offentligt, at modellen tager fejl i hans tilfælde. → Malik oplever, at du står ved ham, men du udsætter ham for klassens blik og gør din uenighed med systemet til en del af hans identitet.

### B5. Fagperson — GODKENDT

- Plan: supply-chains · Odense, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 10850 ms · 1183 in · 1209 out

#### Den del, der ikke er godkendt

Det er en kold morgen på Odense Vandværk. En vigtig ventil i renseanlægget er gået i stykker. Den oprindelige reservedel kan først komme om tre uger, men værkstedet har printet en næsten identisk del lokalt. Den virker i test, men materialet er ikke fuldt dokumenteret til drikkevand.

Du er vandkvalitetsspecialist på vandværket. Din kollega anbefaler, at den printede del afvises, fordi ingen kan garantere, at den holder eller afgiver stoffer til vandet. Uden delen kan et helt boligområde kun få vand fra en begrænset nødforsyning.

*Dit valg kan beskytte drikkevandets sikkerhed og din faglige integritet – eller sikre almindelig vandforsyning nu, men gøre dig ansvarlig, hvis noget går galt.*

**Hvad gør du, når den fagligt sikre løsning også betyder uger med en dårligere hverdag for tusindvis af mennesker?**

1. **Afvis delen og hold fast i nødforsyningen** — Du følger anbefalingen og siger nej, selv om området må leve med begrænset vandforsyning i tre uger. → Du beskytter standarden og din faglige samvittighed, men borgere får en mærkbar hverdag med vandbegrænsninger, og nogle vil mene, at du prioriterede regler over mennesker.
2. **Godkend delen og tag ansvaret selv** — Du tilsidesætter anbefalingen, får delen monteret og skriver under på, at beslutningen er din. → Vandforsyningen normaliseres hurtigt, men du bærer ansvaret for en mulig sundhedsrisiko og kan miste både tillid og faglig troværdighed ved fejl.
3. **Fortæl åbent om usikkerheden og godkend den** — Du orienterer borgere og institutioner om risikoen, men vælger stadig den printede del for at undgå tre ugers nødforsyning. → Du giver mennesker et ærligt grundlag for tillid, men kan ikke give dem et reelt fravalg. Hvis noget går galt, kan åbenhed føles som en ringe trøst.
4. **Begræns brugen til de mest sårbare først** — Du får den printede del monteret, men lader kun kritiske institutioner få normal forsyning og accepterer begrænsninger for n → Plejehjem og skoler hjælpes først, men du gør naboers adgang mindre vigtig og skaber en hård, fagligt begrundet forskel mellem borgere.

### B6. Arbejdsgiver — GODKENDT

- Plan: geopolitical-fragmentation · København, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 10035 ms · 1178 in · 1081 out

#### Den forudsigelse, du ikke må se

Du leder et københavnsk softwarefirma, der netop har fået en stor aftale med en nordisk kunde. Din dygtigste udvikler, Jonas, skal være ansvarlig for dataadgangen. I morges modtog du en regional risikovurdering: Jonas vil med høj sandsynlighed begå et alvorligt sikkerhedsbrud inden for et år.

I 2046 bliver medarbejderes adfærdsforudsigelser brugt i ansættelser og sikkerhedsvurderinger. Data må ikke forlade den region, hvor personen er født, så du får kun konklusionen – ikke grundlaget. Jonas ved ikke, at vurderingen findes, og du kan ikke efterprøve den.

*Et valg kan koste Jonas hans karriere, kundens data eller hele firmaets overlevelse. Uanset hvad du gør, bliver en konkret person ramt.*

**Hvad gør du, når en hemmelig forudsigelse siger, at din mest betroede medarbejder bliver en fare?**

1. **Ignorér vurderingen og giv Jonas ansvaret** — Du vurderer ham på hans faktiske arbejde og fortæller ingen om den hemmelige forudsigelse. → Jonas får sin chance, men et senere brud kan ramme kunden, kollegernes job og din egen troværdighed uopretteligt.
2. **Fjern Jonas fra rollen uden forklaring** — Du følger vurderingen og giver ansvaret til en mindre erfaren medarbejder. → Kunden er bedre beskyttet, men Jonas mister sin karrieremulighed på baggrund af noget, han hverken kan se eller forsvare sig imod.
3. **Fortæl Jonas det og lad ham vælge** — Du afslører vurderingen og beder ham selv sige ja eller nej til rollen med den skjulte risiko. → Han får autonomi, men du lægger en uforståelig mistanke på ham og risikerer, at han forlader både jobbet og tilliden til dig.
4. **Afvis kundeaftalen helt** — Du vil hverken sortere Jonas fra eller udsætte kundens data og siger derfor nej til opgaven. → Jonas beholder sin position, men firmaet mister sin vigtigste aftale, og flere medarbejdere kan miste deres arbejde.

### B7. Medarbejder — GODKENDT

- Plan: labour-shortage · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 12181 ms · 1150 in · 1325 out

#### Når omsorg bliver målt på din stemme

Det er tirsdag morgen på et plejehjem i Aarhus. Du arbejder både med beboere her og med fjernvisitation for tre kommuner. På skærmen står, at din kollega Maja ikke længere bør tage de svære demensvagter. Systemet har målt hendes stemme som ustabil.

Du ved, at Maja har været igennem en skilsmisse, men også at hun er den, beboerne oftest falder til ro hos. For at få beslutningen ændret skal du afgive dine egne stemme- og kropsdata til systemet. Du skal vælge, hvad du gør.

*Du kan beskytte en dygtig kollega og beboernes tryghed, men risikerer dit privatliv, din faglige anseelse eller selv at blive sorteret fra.*

**Hvad gør du, når systemet beskytter driften ved at fjerne den kollega, der skaber mest menneskelig tryghed?**

1. **Brug dine egne data til at anke** — Du giver systemet adgang til dine stemme- og kropsdata og skriver under på, at Maja bør blive på demensvagterne. → Maja får en reel chance, men du accepterer en grænse for overvågning, som også kan ramme dig senere.
2. **Støt beslutningen åbent** — Du siger, at systemets vurdering må følges, selv om du personligt mener, Maja er god til arbejdet. → Du beskytter din egen adgang til vagter og datafrihed, men Maja mister sit faglige område, og tilliden mellem jer kan briste.
3. **Afvis at godkende vurderingen** — Du nægter at godkende vagtplanen og siger, at en stemmeanalyse ikke kan erstatte din erfaring med beboerne. → Du står fast på din faglige stolthed, men kan miste vagter eller blive flyttet til fjernarbejde, hvor du tjener mindre.
4. **Tag selv Majas vagter** — Du accepterer systemets beslutning om Maja, men tilbyder at overtage de svære vagter uden at afgive flere data. → Beboerne beholder en erfaren kollega tæt på, men du får mindre tid, større belastning og risikerer selv at blive vurderet ustabil.

### B8. For alle — GODKENDT

- Plan: cyber-infrastructure · Odense, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 8658 ms · 1131 in · 976 out

#### Når nettet går ned, hvem må kende dig?

Odense er igen i manuel drift efter et angreb på de digitale systemer. På borgerservice ligger papirregistre klar, så naboer kan få medicin, mad og hjælp uden net. Din familie skal nu tage stilling til jeres nødprofil.

Du står med din søster på borgerservice. Jeres nødprofil viser adresse, sprog, sygdomme og hvem der må hjælpe jer. Den kan redde tid og liv, men er tilgængelig for lokale hjælpere, når nettet er lukket.

*Din beslutning kan gøre det lettere for familien at få hjælp, men også afsløre private oplysninger om jer og gøre hjemmet sårbart.*

**Vil du registrere familiens oplysninger i den lokale nødprofil, eller beskytte jer mod den risiko, profilen skaber?**

1. **Registrér hele familien** — Du accepterer, at nødprofilen indeholder alle relevante oplysninger, så ingen overses i en krise. → Familien får sandsynligvis hurtigere hjælp, men sygdomme, adresse og afhængigheder bliver synlige for mange flere end normalt.
2. **Registrér kun dig selv** — Du beskytter de andre ved kun at dele dine egne oplysninger og tager ansvar for at hjælpe familien manuelt. → De andre bevarer mere privatliv, men kan blive overset, hvis du ikke selv er der eller ikke kan forklare deres behov.
3. **Afvis profilen helt** — Du siger nej på familiens vegne, fordi retten til privatliv også skal gælde under et angreb. → I beholder kontrollen over jeres oplysninger, men må acceptere langsommere hjælp og større afhængighed af naboer, der kender jer.
4. **Lad familien vælge hver for sig** — Du beder hver person selv tage stilling, også selv om profilen dermed bliver ufuldstændig og sværere at bruge. → Alle får større selvbestemmelse, men hjælperne kan mangle det samlede billede, og beslutningen kan skabe konflikt i familien.

### B9. Borger — GODKENDT

- Plan: antibiotic-resistance · København, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 7957 ms · 1150 in · 867 out

#### Den kur, der følger dig hjem

København, 2046. Din otteårige datter har en infektion, som ikke kan behandles med almindelig antibiotika. På sundhedsklinikken viser testen, at et reserveret middel sandsynligvis vil virke. Du skal nu tage stilling til, hvordan I får adgang.

På skærmen står, at kuren kun kan frigives, hvis husstanden tilslutter sig det nationale smitteprogram. Det registrerer jeres prøver, kontakter og bevægelser i seks måneder. Du kan vælge mellem fuld tilslutning, begrænset deling, afvisning eller at lade kun din datter tilslutte sig.

*Din datters chance for at blive rask står over for familiens privatliv, lige behandling og tilliden til et system, der følger jer hjem.*

**Hvad vælger du, når hendes behandling kræver, at familien giver staten indblik i jeres liv?**

1. **Tilslut hele husstanden** — Du accepterer fuld registrering, så klinikken får det stærkeste grundlag for at frigive kuren. → Din datter får den bedste adgang til behandlingen, men familiens bevægelser og kontakter kan senere bruges til kontrol eller vurdering af risiko.
2. **Del kun din datters data** — Du lader hende indgå i programmet, men holder resten af familiens oplysninger udenfor. → Hun kan få kuren, men klinikken mangler vigtige oplysninger om smitte i hjemmet, og ansvaret for følgerne bliver mere uklart.
3. **Afvis programmet for hele familien** — Du siger nej til registreringen og beder om den almindelige behandling, selv om den har lavere chance for at virke. → I bevarer privatlivet og et princip om frivillighed, men din datter kan blive alvorligt syg, og I kan smitte andre.
4. **Lad en nær nabo indgå i stedet** — Du accepterer programmet for dig selv og en nabo, som allerede hjælper jer, men ikke for resten af familien. → Klinikken får noget lokalkendskab, men naboen bærer en privatlivsrisiko, hun ikke selv har valgt, og billedet af smitten kan blive skævt.

### B10. Beslutningstager — GODKENDT

- Plan: new-work-forms · Aarhus, Danmark
- Model: gpt-5.6-luna
- Latency/tokens: 12713 ms · 1174 in · 1275 out

#### Når din agent siger ja på dine vegne

Du sidder i Aarhus Kommunes udvalg for ældrepleje. I 2046 tager personlige agenter imod vagter for selvstændige plejere, mens de sover. En ny fælles pulje kan sikre faste plejere til sårbare borgere, men kræver, at agenten må binde hjælperen til vagter, som senere er svære at sige nej til.

Din beslutning er bindende: Skal kommunen godkende puljen som leverandør? Den vil give ældre mere stabil pleje og bedre betaling til deltagende hjælpere. Men din tidligere kollega siger, at hendes agent allerede har accepteret vagter, hun ikke længere kan få familieliv til at hænge sammen med.

*Et ja giver sårbare borgere kontinuitet, men gør arbejdet mindre frit. Et nej beskytter hjælpernes selvbestemmelse, men kan efterlade ældre med skiftende eller manglende pleje.*

**Hvilken ordning vil du godkende, når både borgernes tryghed og hjælpernes frihed afhænger af din beslutning?**

1. **Godkend bindende agent-aftaler** — Agenter må acceptere vagter og forpligte hjælperen, hvis vilkårene er tydelige på forhånd. → Flere ældre får kontinuitet, og puljen bliver effektiv. Til gengæld kan hjælpere miste reel kontrol over deres tid og føle sig bundet af en beslutning, de ikke selv tog vågne.
2. **Afvis puljen og beskyt friheden** — Kommunen må kun købe hjælp, hvor personen selv bekræfter hver vagt og frit kan sige nej. → Hjælperne bevarer fuld selvbestemmelse, men flere borgere får skiftende personale eller aflyste besøg. Kommunen må acceptere mindre forudsigelig omsorg.
3. **Tillad binding mod højere betaling** — Hjælpere kan frivilligt give agenten større mandat mod en markant højere takst. → Nogle får bedre indtjening og stabile forløb, mens andre ikke har råd til at sige nej til friheden. Plejen bliver mere opdelt efter økonomi og livssituation.
4. **Lad hjælpernes fælles pulje bestemme** — En valgt gruppe af hjælpere kan binde medlemmernes agenter til vagter efter fælles regler. → Ansvar og forhandling flyttes fra kommunen til fællesskabet, og den enkelte får mindre direkte kontrol. Til gengæld kan reglerne opleves mere legitime og solidariske.

## Setup C — simplified + Terra

### C1. Barn — GODKENDT

- Plan: extreme-heat · Aarhus, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 36260 ms · 1224 in · 2015 out

#### Den kølige sovesal og armbåndet

Det er nat i Aarhus. Din lejlighed er for varm til at sove i. I gården står et kølerum med fælles sovesal.

I 2046 sover mange børn i kvarterets kølerum på de varmeste nætter. For at komme ind skal du bære et armbånd. Det måler varme, puls og søvn. Det kan kalde på en voksen, hvis du bliver syg. Data bliver gemt i flere år. Din ven Malik vil ikke have det på.

*Du kan få kølig luft og hjælp, hvis din krop får det dårligt. Men du giver voksne og systemer adgang til data om din krop. Malik beder dig om at gå hjem med ham.*

**Tager du armbåndet på, selv om Malik går hjem til den varme lejlighed?**

1. **Tag armbåndet på og fortæl det** — Du bliver i kølerummet. Du siger til pædagogen, at Malik vil gå hjem uden armbånd. → Malik kan få hjælp og måske blive i det kølige rum. Han kan også føle, at du brød hans tillid. Du accepterer selv, at dine data gemmes.
2. **Tag armbåndet på, men hold tavs** — Du bliver i kølerummet. Du lader Malik gå hjem og siger ikke noget til de voksne. → Du får kølig luft og beholder måske Maliks tillid. Men han er alene i varmen. Hvis han får det dårligt, ved ingen i kølerummet det.
3. **Gå hjem med Malik** — Du siger nej til armbåndet. I går begge tilbage til hans varme lejlighed. → I holder sammen og beskytter jeres data. Men I mister den kølige nat og alarmen ved sygdom. Varmen kan gøre jer begge utilpasse.
4. **Bliv og sig til Malik, hvad du vælger** — Du tager armbåndet på. Du siger ærligt til Malik, at du ikke vil gå hjem, men at han selv må vælge. → Du bestemmer over din egen krop uden at angive ham. Malik står stadig alene med sit valg. Han kan føle sig svigtet, og du kan være bekymret hele natten.

### C2. Ung — GODKENDT

- Plan: ageing · Odense, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 48248 ms · 1192 in · 2640 out

#### Farmors tryghed kræver adgang til dit værelse

Odense, 2046. Du er 17 og bor med din far og farmor i en bolig for flere generationer. Farmor falder lettere om natten, men vil blive hjemme. Kommunens hjemmeomsorg kan kun fortsætte, hvis hjemmets alarmsystem må lytte efter fald, hoste og råb i alle rum – også dit.

Din far har lagt samtykkeskærmen frem på køkkenbordet. Systemet kan få farmor hjælp hurtigt, også når hun går forvildet rundt om natten. Men det registrerer også, hvornår du er hjemme, hvem der overnatter, og samtaler det vurderer som vigtige. Farmor siger ikke noget. Hun venter på, hvad du gør.

*Siger du ja, mister du et privat rum i dit eget hjem. Siger du nej, kan kommunen vurdere, at farmor ikke længere kan bo sikkert hjemme. Det kan ændre jeres hverdag og jeres tillid til hinand*

**Vil du lade systemet overvåge dit værelse, hvis det er prisen for, at farmor kan blive hjemme?**

1. **Sig ja til overvågning i mit værelse** — Du giver samtykke, så farmor kan beholde hjemmeomsorgen og blive boende. → Farmor får større chance for at blive hjemme, og din far bliver lettet. Men dit værelse er ikke længere kun dit, og du kan begynde at holde ting skjult eller føle dig på vagt.
2. **Sig nej og bliv boende** — Du nægter adgang til dit værelse, selv om det kan få konsekvenser for omsorgen. → Du beskytter en tydelig grænse. Men din far skal leve med usikkerheden, og farmor kan opleve dit nej som om, du vælger dit privatliv over hendes tryghed.
3. **Flyt hjemmefra, så systemet kan bruges** — Du finder et ungdomsbofællesskab og lader resten af hjemmet sige ja uden dig. → Du slipper for at blive overvåget, og farmor kan måske blive. Men du forlader også hverdagen med hende og din far, fordi hjemmet ikke kunne rumme din grænse.
4. **Vær ærlig med farmor om alternativet** — Du siger, at du ikke kan sige ja, og støtter hende, hvis hun selv vælger et bofællesskab med fast personale. → Du presser ikke farmor til at blive for din skyld, og hun får en reel stemme. Men samtalen kan gøre ondt: Hun kan føle sig forladt, selv om du prøver at respektere hende.

### C3. Forælder — GODKENDT

- Plan: living-norms · København, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 45777 ms · 1163 in · 2526 out

#### Skal din datter være registreret som omsorgsgiver?

I 2046 er det almindeligt, at familier registrerer et omsorgsnet, når en ældre vil blive hjemme. Skoler giver også merit for dokumenteret omsorgsarbejde. Din mor har brug for hjælp hver dag, men vil blive i sin lejlighed på Nørrebro. Din 15-årige datter Liv vil gerne tage to faste eftermiddage om ugen og blive registræ

Køkken i en lejlighed på Nørrebro i 2046. En 15-årig holder sin skoletablet med en åben omsorgsaftale. På bordet ligger mormors medicindispenser og et kort over dagens registrerede besøg.

*Hvis Liv registreres, får hun fleksibel skolegang og brugbare kompetencer. Men hendes hjælp, fravær og observationer bliver en del af et system, og hun får et ansvar, der kan ændre hendes år*

**Vil du lade Liv blive registreret som fast omsorgsgiver for sin mormor – og hvordan vil du ellers få hjælpen til at hænge sammen?**

1. **Registrér Liv som fast omsorgsgiver** — Liv hjælper to eftermiddage om ugen og får merit, fleksibel undervisning og adgang til omsorgsforløb senere. → Liv får en reel mulighed og kan føle sig stolt. Men hun bliver en planlagt del af plejen, og hendes skole ser data om hendes omsorgsarbejde og belastning.
2. **Sig nej og tag selv omsorgsvagterne** — Du holder Liv uden for den formelle plan og dækker eftermiddage ved at skrue ned for dit eget arbejde. → Liv beholder frihed og kan stadig være barnebarn frem for hjælper. Men din økonomi og arbejdsliv presses, og Liv kan opleve, at du ikke stoler på hende.
3. **Registrér en nabo i omsorgsnettet** — En nabo tager de faste besøg. Liv kan komme, når hun har lyst, uden merit eller registreret ansvar. → Liv undgår en forpligtende rolle, og du kan arbejde. Til gengæld får en udenforstående adgang til hjemmet og familiens sårbare oplysninger, og hjælpen kan føles mindre nær.
4. **Vælg kommunens aftenteam** — Et fast kommunalt team tager de praktiske besøg, mens Liv kun besøger sin mormor som familie. → Ansvaret bliver professionelt dækket, og Livs privatliv beskyttes. Men din mor skal indrette sig efter skiftende personale, og Liv mister en mulighed, hun selv bad om.

### C4. Lærer / pædagog — GODKENDT

- Plan: power-concentration · Aarhus, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 19355 ms · 1165 in · 1018 out

#### Skal Alma blive i klassen?

Du er lærer i Aarhus. På kommunens læringsplatform ligger en anbefaling om Alma, 11 år, som du holder af og har kendt i tre år.

I 2046 bruger næsten alle skoler en fælles platform, ejet af få leverandører. Den samler fravær, afleveringer, konflikter og trivselsnoter og finder børn, der risikerer at mistrives. Alma er udpeget. Systemet anbefaler et individuelt, digitalt læringsforløb uden for klassen. Hendes mor er lettet. Alma spørger dig stille: “Er jeg allerede blevet valgt fra?”

*Forløbet kan give Alma ro og målrettet hjælp, før hun får det værre. Men hvis du følger det, mister hun hverdagen med klassen – og kan opleve, at en profil blev stærkere end din tro på hende*

**Vil du følge systemets anbefaling, eller bruge din faglige vurdering til at holde Alma i fællesskabet – selv hvis det koster noget?**

1. **Følg anbefalingen nu** — Du siger ja til det individuelle forløb og forklarer Alma, at det er hjælp, ikke en straf. → Alma får ro, specialiseret støtte og færre svære situationer. Men hun mister sin faste plads i gruppen, og klassen lærer, at problemer ofte løses ved at flytte et barn væk.
2. **Hold Alma i klassen** — Du afviser anbefalingen og tilpasser undervisningen sammen med Alma i den klasse, hun kender. → Alma mærker, at du tror på hendes plads i fællesskabet. Til gengæld tager det tid fra resten af klassen, og du risikerer at overse en hjælp, der faktisk kunne have aflastet hende.
3. **Lad Alma være med til at vælge** — Du gennemgår anbefalingen ærligt med Alma og hendes mor og lader Alma sige ja eller nej. → Alma får ejerskab over noget, der handler om hendes liv. Men et barn kan komme til at bære ansvaret for et valg, voksne og et stærkt system allerede har gjort svært at sige nej til.
4. **Bed om en menneskelig modvurdering** — Du fastholder Alma i klassen foreløbig og beder kommunens langsommere, uafhængige team vurdere sagen. → Du udfordrer et system, der kan tage fejl, og giver Alma en ny faglig stemme. Men imens får hun ikke den hurtige støtte, og moren kan opleve, at du forsinker nødvendig hjælp.

### C5. Fagperson — GODKENDT

- Plan: supply-chains · Odense, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 31689 ms · 1183 in · 1723 out

#### Den printede del i Odenses drikkevand

Du er driftsansvarlig på et vandværk i Odense. En central ventil i rensningen er slidt og bør skiftes. Den originale reservedel kan først komme med næste sæsonleverance om fem måneder. En lokal producent kan levere en printet erstatning i morgen.

I 2046 er lokale, printede reservedele blevet almindelige, fordi globale forsyningskæder er dyre og ustabile. Modellen vurderer den nye ventil som sikker ved normal drift, men materialet er ikke testet over lang tid i netop jeres vandkemi. Din 81-årige far bor alene i den forsyningszone, der rammes hårdest af et stop.

*Du skal beskytte drikkevandets kvalitet og borgernes tillid, men også undgå, at mennesker mister stabil adgang til vand. Din egen far gør konsekvensen svær at holde på afstand.*

**Vil du tage den lokale, usikkert dokumenterede ventil i brug – og hvem skal bære prisen for din beslutning?**

1. **Sæt den printede ventil i nu** — Følg modellens anbefaling og hold forsyningen normal, mens I overvåger vandet tæt. → De fleste mærker intet, og din far beholder vandet. Men du gør borgerne til medbærere af en usikkerhed, de ikke selv har sagt ja til.
2. **Brug ventilen og fortæl åbent om tvivlen** — Tag den i brug, men orientér alle berørte borgere om den manglende langtidsdokumentation. → Du beskytter tilliden gennem ærlighed, men skaber utryghed hos mennesker, der ikke har et realistisk alternativ til vandet fra hanen.
3. **Luk den berørte forsyningszone** — Afvis ventilen og afbryd kun den del af nettet, hvor den slidte ventil er nødvendig. → Du holder fast i den dokumenterede standard, men lægger en tung byrde på ét kvarter – også på din far og andre, der har svært ved at hente vand.
4. **Sænk forsyningen i hele området** — Afvis ventilen og kør hele nettet med lavere tryk, så manglen deles bredere. → Du undgår at vælge ét kvarter fra og fastholder kvalitetskravet. Til gengæld bliver hverdagen vanskelig for tusinder, og svage borgere rammes stadig hårdest.

### C6. Arbejdsgiver — GODKENDT

- Plan: geopolitical-fragmentation · København, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 34439 ms · 1178 in · 1755 out

#### Hvem må stå med ansvaret, når nettet lukker?

På dit kontor i København ligger kontrakten med et bynet i den nordatlantiske region klar til underskrift. Din erfarne medarbejder Maja skal være driftsansvarlig. Men hendes adgangsprofil er bundet til den region, hvor hun blev født, og jeres nye prognose viser gentagne udfald i forbindelsen mellem regionerne.

I 2046 må persondata ikke forlade den region, man er født i. Maja kan arbejde i København, men når forbindelsen til hendes fødselsregion svigter, kan kunden ikke se eller godkende hendes arbejdslog. Kunden kræver én navngiven ansvarlig, der altid kan dokumentere sine handlinger i deres system.

*Gør du Maja til ansvarlig, kan en fejl lukke en vigtig kontrakt og koste teamet job. Vælger du hende fra, mister hun den forfremmelse, hun længe har arbejdet mod.*

**Vil du bruge prognosen om Majas adgang, eller vil du lade hendes erfaring veje tungere end den forudsete risiko?**

1. **Giv Maja det fulde ansvar** — Du udnævner Maja og accepterer, at hendes adgang kan være væk under en kritisk hændelse. → Maja får den rolle, hun har fortjent. Men hvis dokumentationen mangler under et udfald, kan kunden ophæve kontrakten, og resten af teamets arbejde bliver usikkert.
2. **Følg prognosen og vælg en anden** — Du giver ansvaret til Jonas, hvis adgang ligger i en region med stabil forbindelse til kunden. → Leverancen bliver mere robust, men Maja ved, at hendes fødselsregion — ikke hendes arbejde — afgjorde forfremmelsen. Det kan ændre hendes tillid til dig.
3. **Afslå kontrakten** — Du siger nej til en aftale, hvor adgangsreglerne reelt sorterer medarbejdere efter fødselsregion. → Du beskytter Maja og sætter en klar grænse for virksomheden. Men I mister indtægten, og du skal forklare teamet, hvorfor en principiel beslutning kan betyde færre stillinger.
4. **Del arbejdet, men ikke ansvaret** — Maja leder det faglige arbejde, mens Jonas står som formelt ansvarlig over for kunden. → Maja bliver på opgaven, men ikke i den rolle, der giver hende fuldt mandat og synlighed. Jonas bærer den juridiske risiko for arbejde, han ikke altid selv udfører.

### C7. Medarbejder — GODKENDT

- Plan: labour-shortage · Aarhus, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 45854 ms · 1150 in · 2509 out

#### Din faglighed deles – men hvem bliver du hos?

Det er 2046, og du er social- og sundhedsassistent på plejehjemmet Solsiden i Aarhus. Fordi der mangler folk med din demensfaglige uddannelse, deles I nu mellem flere kommuner. Du kan vælge én af de faste arbejdsformer i den fælles plan.

Tre dage om ugen kan du sidde i et fælles fagcenter og guide kolleger på afstand i andre plejehjem. På Solsiden bor Henning, som kun vil lade dig hjælpe ham i bad. Din kollega Mette er allerede slidt af at overtage, når du ikke er der.

*Din beslutning afgør både, om Henning beholder den tryghed, han kender, og hvor meget hjælp din sjældne faglighed når ud til. Den påvirker også din løn, din partner og Mettes hverdag.*

**Hvilken arbejdsform vælger du, når din faglighed er mere nødvendig flere steder end hos de mennesker, du kender bedst?**

1. **Bliv delt specialist på skærm** — Tag tre ugentlige dage i fagcenteret og vejled kolleger på afstand i flere kommuner. → Du hjælper langt flere beboere og beholder specialistsporet. Men Mette skal oftere stå alene med Henning, mens du kun ser hans svære dage gennem noter og video.
2. **Bliv fast på Solsiden** — Gå tilbage til almindelige vagter og vær hos Henning og den faste gruppe hver dag. → Henning får den ro, han kender, og Mette får en nær kollega. Men du mister specialisttillægget og ser andre plejehjem undvære den hjælp, du faktisk kan give.
3. **Gå i den kørende fagpool** — Vælg fysisk at besøge skiftende plejehjem i Aarhus-området i stedet for at vejlede fra en skærm. → Du giver hjælp ansigt til ansigt, også til de sværeste situationer. Til gengæld får du ingen fast beboergruppe, og din partner kommer ofte til at stå alene med aftenerne hjemme.
4. **Vælg den faste 80-procentsordning** — Behold to specialistdage, men arbejd færre timer og lad resten af dine vagter dækkes af planen. → Du får lidt tid både til Henning og til den fælles opgave. Men din indkomst falder, og Mette og de andre skal stadig dele de vagter, du ikke længere tager.

### C8. For alle — GODKENDT

- Plan: cyber-infrastructure · Odense, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 33602 ms · 1131 in · 1630 out

#### Nøglen til varme i næste nedlukning

Odense har igen lukket energinettet ned i regioner efter et angreb. I din opgang virker den fælles nødstrøm kun i tre døgn. Kommunen vil gøre din stuelejlighed til et officielt varmt opholdssted, fordi den er let at komme ind i og har ekstra batterikapacitet.

En mørklagt opgang i Odense i vintervejr. Kun svagt lys fra en lejlighed i stueetagen, hvor en analog opslagstavle viser åbningstider for et varmt opholdssted. En person står med en papirformular og ser mod sin egen hoveddør, mens naboer venter i gangen.

*Siger du ja, får naboer et sikkert sted under næste nedlukning, men kommunen og frivillige får adgang til dit hjem og din reserveenergi. Siger du nej, bevarer du roen og kontrollen, men en s*

**Vil du gøre dit hjem til en del af byens beredskab, selv om det ændrer, hvem der har adgang til dit privatliv?**

1. **Gør lejligheden til officielt opholdssted** — Du underskriver aftalen og lader kommunen opbevare en nøgle og en papirplan over hjemmets nødudstyr. → Flere får et kendt sted at gå hen, også dem du ikke kender. Til gengæld bliver dit hjem en arbejdsplads i krisen, og din families ro og strømreserve bliver fælles ansvar.
2. **Lav et uformelt nabohus** — Du åbner kun efter aftale med opgangen og siger nej til kommunens nøgle, register og faste adgangsregler. → I bevarer nærhed og kontrol mellem jer, men tilbuddet kan blive usikkert for nye, ensomme eller svagere naboer. Du står selv med ansvaret, hvis nogen bliver afvist.
3. **Gem strømmen til din egen familie** — Du siger nej til at være vært og bruger batteriet til varme, mad og kontakt for dem, der bor hos dig. → Din familie ved, hvad den kan regne med i tre døgn. Men du må leve med, at stuelejligheden står mørk, mens naboer med færre muligheder søger mod et andet kvarter.
4. **Flyt selv til et fælles beredskabssted** — Du opgiver lejligheden under nedlukninger og tilmelder familien et kommunalt opholdssted med faste regler. → Du undgår at gøre dit hjem til en halvoffentlig zone og støtter den fælles løsning som bruger. Prisen er at forlade jeres egen hverdag og dele plads, rutiner og privatliv med fremmede.

### C9. Borger — GODKENDT

- Plan: antibiotic-resistance · København, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 38744 ms · 1150 in · 1916 out

#### Den antibiotika, der kræver dit liv som data

På en sundhedsklinik i København får du svar på en infektion ved et gammelt operationsar. Den kan muligvis behandles med et af de få antibiotika, der stadig virker. Men midlet frigives kun gennem det nationale smittesystem.

For at søge adgang skal du dele prøver, seks måneders bevægelsesdata og navnene på dine nære kontakter. Systemet bruger oplysningerne til at opspore smitte og beskytte de sidste virksomme antibiotika. Du har gode grunde til ikke at åbne dit privatliv – men infektionen gør mere ondt hver uge.

*Siger du ja, bliver dine relationer og færden en del af statens smittekort. Siger du nej, kan du ende med en hårdere behandling, som måske ikke virker – eller med endnu en operation.*

**Vil du dele et meget detaljeret billede af dit liv for at få adgang til den antibiotika, der kan hjælpe dig?**

1. **Del alt, som systemet beder om** — Du sender data og beder dine nære kontakter om at blive koblet på din sag. → Du får sandsynligvis adgang til behandlingen og bidrager til smittebeskyttelsen. Men mennesker omkring dig bliver en del af et system, de ikke selv har valgt.
2. **Del kun dine medicinske prøver** — Du accepterer blodprøver og bakterieanalyse, men ikke bevægelsesdata eller kontaktliste. → Du sætter en grænse for overvågningen. Til gengæld vurderes din sag som usikker, og du må leve med, at ansøgningen om antibiotika kan blive afvist.
3. **Afslå den reserverede antibiotika** — Du vælger klinikkens ældre behandling og tæt kontrol frem for at åbne dine data. → Du beholder kontrollen over dit privatliv, men behandlingen kan give kraftige bivirkninger og kan være mindre præcis mod netop din infektion.
4. **Vælg operation frem for data** — Du beder om at få det betændte væv fjernet i stedet for at søge om det reserverede middel. → Du undgår smittesystemets indblik og sparer et vigtigt antibiotikum. Men indgrebet kan betyde længere sygemelding, smerter og en varig ændring af din krop.

### C10. Beslutningstager — GODKENDT

- Plan: new-work-forms · Aarhus, Danmark
- Model: gpt-5.6-terra
- Latency/tokens: 26673 ms · 1174 in · 1318 out

#### Skal Aarhus kræve indblik i arbejdernes agenter?

Du sidder med den endelige indstilling til Aarhus Byråd. Kommunen køber nu små reparations-, service- og omsorgsopgaver gennem arbejderrådede puljer. Hver deltager har en agent, der forhandler pris og vagter. For at stoppe snyd vil forvaltningen kunne gennemgå agenternes forhandlinger.

Nadia får nok opgaver til at blive boende i Aarhus, fordi hendes agent finder vagter, mens hun passer sin søn. Malik har derimod fravalgt puljen: Et kommunalt indblik kan afsløre, hvornår hans helbred og familie begrænser ham. Indkøbschefen siger, at uden indsigt kan kommunen ikke opdage pressede takster eller skjult forskelsbehandling.

*Dit valg afgør, om tusinder af selvstændige får stærkere beskyttelse i kommunale opgaver på bekostning af privatliv og frihed – eller om kontrollen bliver så svag, at de mest udsatte står då*

**Hvilken pris vil du acceptere for, at kommunens fleksible arbejde både kan være retfærdigt og til at stole på?**

1. **Krav fuld, revisionsklar agentlog** — Godkend puljerne, men kræv at kommunen kan revidere alle agentforhandlinger ved mistanke om misbrug. → Nadia og andre kan lettere få dokumenteret pressede priser og diskrimination. Malik og ligesindede må acceptere, at deres arbejdsmønstre kan granskes, eller miste adgang til kommunale opgaver.
2. **Kun anonymiseret kontrol** — Godkend puljerne med samlede, anonymiserede data og stikprøver hos puljen – aldrig indsigt i den enkeltes agent. → Flere kan arbejde uden at udlevere sårbare forhold. Men en konkret arbejder kan sjældnere bevise, at netop deres agent blev presset eller sorteret fra, og kommunen må leve med større risiko.
3. **Lad en fælles agent forhandle** — Krav, at hver pulje bruger én demokratisk styret fælles agent i kommunale opgaver frem for personlige agenter. → Kommunen kan kontrollere fælles regler uden at kortlægge den enkelte. Til gengæld mister Nadia den personlige planlægning, og flertallet i puljen kan komme til at bestemme vilkår, der ikke p
4. **Prioritér faste kommunale ansættelser** — Afvis agentpuljer til tilbagevendende opgaver og læg dem i faste kommunale stillinger med overenskomst. → Flere får klare rettigheder, kolleger og menneskelig ledelse. Men kommunen kan købe færre opgaver for budgettet, og mennesker, der kun kan arbejde i skiftende korte vinduer, mister en reel ind
