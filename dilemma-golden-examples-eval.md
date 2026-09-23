# World 2046 — developments + golden examples eval

Præcis 20 Terra authoring-kald: to per rolle, ingen retries og ingen regeneration. Alle rå outputs er gengivet uredigeret nedenfor.

## Setup og resultat

- Model: gpt-5.6-terra
- Kald: 20
- Teknisk accepteret: 20/20
- Redaktionelt production-worthy: 7/20
- Gennemsnitlig latency: 17358 ms
- Tokens: 27093 input · 17279 output
- Example copying: 16 none · 2 mild · 2 too close

## Gennemsnitlige scores

| Dimension | Gennemsnit |
|---|---:|
| Future significance | 4.1/5 |
| Role fit | 4.5/5 |
| Human relevance | 4.8/5 |
| Plausibility | 4.3/5 |
| Decision clarity | 4.7/5 |
| Choice quality | 4.0/5 |
| Discussion value | 4.7/5 |
| Language fit | 4.2/5 |
| Natural conflict | 3.5/5 |
| Originality vs examples | 4.5/5 |

## Rolleoverblik

| Rolle | Production-worthy | Gennemsnit på tværs af 10 dimensioner |
|---|---:|---:|
| Barn | 0/2 | 4.1/5 |
| Ung | 0/2 | 3.6/5 |
| Forælder | 2/2 | 4.8/5 |
| Lærer / pædagog | 0/2 | 3.5/5 |
| Fagperson | 2/2 | 4.7/5 |
| Arbejdsgiver | 1/2 | 4.7/5 |
| Medarbejder | 1/2 | 4.5/5 |
| For alle | 0/2 | 4.2/5 |
| Borger | 1/2 | 4.8/5 |
| Beslutningstager | 0/2 | 4.3/5 |

## Redaktionel summary

- **Barn er sprogligt forståeligt, men endnu ikke løst.** Begge børnecases kan forstås uden en voksenforklaring (4/5), men case 1 vender tilbage til den allerede problematiske skole/mistrivsel/privacy-scene, og case 2 har choices, der ikke alle besvarer beslutningen.
- **Choices er bedre formet, men workarounds findes stadig.** De bedste cases holder alle fire svar på samme akse (især 6, 9, 10, 13 og 18). I 1, 2, 4, 8 og 17 skifter mindst ét svar spørgsmål, flytter ansvaret eller er åbenlyst svagere.
- **Natural conflict er den største fejl.** Cases 3, 7, 11, 13, 15 og 20 bruger sidste plads, armbånd, én undtagelse, fast deadline eller et budget, der kun rækker til én, som motor for konflikten. Cases 7 og 15 kopierer samtidig scarcity-strukturen for tæt fra deres valgte golden example.
- **Developments er ikke altid centrale nok.** I case 8, 16 og 20 kunne næsten samme dilemma skrives uden den valgte udvikling; autonom transport, simulationsværktøj og AI-administration bliver baggrund frem for årsag til den menneskelige pris.
- **Bedst fungerende roller:** Forælder og Fagperson gav 2/2 production-worthy; Medarbejder, Arbejdsgiver og Borger gav én stærk case hver. **Svagest:** Barn, Ung, Lærer/pædagog, For alle og Beslutningstager gav 0/2 efter en streng redaktionel vurdering.
- **Example copying:** 16/20 viser ingen konkret kopiering, 2/20 har mild strukturel lighed, og 2/20 ligger for tæt. Few-shot-laget skaber altså ikke generel repetition, men enkelte scarcity-eksempler lærer modellen netop den mekanik, vi vil undgå.
- **Developments der gav svage mønstre:** `ai-prioritises-resources`, `public-cooling-rooms`, `grid-responsive-homes` og `ai-administration` fremkaldte konstrueret ressourcefordeling. `ai-detects-distress` gav igen den snævre skole/privacy-scene. Det peger på content-library-arbejde, ikke flere runtime-regler.

## Konklusion

Arkitekturen er væsentligt mere forståelig, og Terra leverer konsekvent korrekt form, konkrete scener og god rolle-tone. Golden examples løfter især sprog, stakes og beslutningsklarhed. Kvalitetsproblemet er nu synligt og redaktionelt håndterbart: enkelte developments og golden examples trækker modellen mod scarcity, og choice-kvaliteten er stadig ustabil. I overensstemmelse med eval-reglen er der ikke foretaget automatisk tuning efter disse resultater.

# Alle 20 rå cases med scoring

## 1. Barn — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: AI kan opdage mistrivsel, før mennesker selv fortæller om den (`ai-detects-distress`)
- Sted: Aarhus, Danmark
- Golden examples: `child-robot-friend-memory` + `youth-predicted-dropout`
- Latency/tokens: 12821 ms · 1380 input · 537 output

### DEN GULE PRIK VED DIT NAVN

**Future normal:** I 2046 kan skolens AI lægge mærke til tegn på mistrivsel, som ændret stemme, stille frikvarterer og ord i beskeder. Den sender en besked til en voksen, før barnet selv beder om hjælp.

**Human cost:** Den hurtige hjælp kan gøre, at ingen går alene med noget svært. Men det kan også føles ubehageligt, når voksne opdager følelser, man ikke er klar til at fortælle om.

**Decision:** Du vælger, hvad du siger, da din lærer spørger ind til AI’ens bekymring.

I 4.B på skolen i Aarhus lyser en lille gul prik ved dit navn på klassens tavle, lige før frikvarteret. Læreren hvisker, at skolens AI har set, at du har siddet alene tre dage og slettet flere beskeder til din bedste ven. Hun spørger, om I skal tale sammen nu. De andre er allerede på vej ud for at spille bold.

**Det står på spil:** Du vil gerne slippe for at fortælle noget, før du er klar. Men du savner også din ven og er træt af at have ondt i maven i frikvartererne.

**Hvad siger du til læreren?**

A. **JEG VIL GERNE TALE NU** — Du kan få hjælp med det samme, men du mister noget af dit frikvarter og skal fortælle om noget, du helst ville gemme.
B. **DER ER IKKE NOGET GALT** — Du får lov til at gå ud med de andre, men læreren tror måske, at du klarer det alene, selv om du ikke gør.
C. **JEG VIL KUN SIGE LIDT** — Du bestemmer selv, hvor meget du fortæller, men læreren kan mangle det vigtigste for at forstå, hvorfor du er ked af det.
D. **JEG VIL SNAKKE MED MIN VEN FØRST** — Du giver venskabet en chance for at blive bedre direkte, men din ven ved måske ikke, hvad der er sket, og samtalen kan gøre dig mere ked af det.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 4/5 |
| Decision clarity | 4/5 |
| Choice quality | 3/5 |
| Discussion value | 4/5 |
| Language fit | 4/5 |
| Natural conflict | 4/5 |
| Originality vs examples | 4/5 |
| Child comprehension | 4/5 |

- Production-worthy: nej
- Example copying: none
- Note: Barnet og sproget er tydeligt, men AI'en har allerede delt bekymringen. Valg D flytter beslutningen til vennen, og scenen ligner den skole/privacy-type, som produktet netop skulle væk fra.

## 2. Barn — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: AI kan vise sandsynlige følger af forskellige uddannelses-, job- og livsvalg (`ai-simulates-life-choices`)
- Sted: Hamburg, Tyskland
- Golden examples: `child-robot-friend-memory` + `teacher-isolation-signal`
- Latency/tokens: 11857 ms · 1378 input · 629 output

### DEN FILM, DER VIL VÆLGE FOR DIG

**Future normal:** I 2046 kan børn i Hamburg se små fremtidsfilm fra skolens valg-AI. Den viser, hvad der sandsynligvis sker, hvis de vælger forskellige fritidsaktiviteter, fag og job senere i livet.

**Human cost:** Filmene kan hjælpe børn med at vælge, men de kan også få et muligt liv til at føles som den eneste rigtige vej.

**Decision:** Du vælger, om du vil følge AI'ens forslag til din næste fritidsaktivitet.

Efter skole sidder du med din mor ved køkkenbordet i Hamburg. På din skolebrille spiller valg-AI'en fire korte film om dig som voksen. I den klareste film bygger du vindmøller ved havnen og ser glad ud. AI'en siger, at det er mest sandsynligt, hvis du går til robotværkstedet i stedet for at blive ved med dit dansehold. Men på danseholdet er din bedste ven, Emil, og I skal optræde sammen om tre uger. Din mor spørger, hvad du vil tilmelde dig i morgen.

**Det står på spil:** Du vil gerne vælge noget, der kan blive godt for dig senere. Du vil også selv bestemme og ikke miste noget vigtigt med Emil nu.

**Hvad siger du til din mor?**

A. **JEG VIL GÅ TIL ROBOTVÆRKSTED** — Du følger den fremtid, AI'en tror mest på, men Emil skal måske stå alene til optræden.
B. **JEG BLIVER PÅ DANSEHOLDET** — Du bliver hos Emil og vælger det, du holder af nu, men du kan blive ved med at tænke på filmen, du sagde nej til.
C. **JEG VIL VÆLGE UDEN AT SE FLERE FILM** — Du beskytter dit eget valg mod AI'ens billeder, men du mister den hjælp, som måske kunne have vist noget, du ville elske.
D. **JEG VIL SIGE TIL EMIL, HVAD AI'EN VISTE** — Du deler det svære med din ven, men Emil kan føle, at din mulige fremtid betyder mere end jeres optræden.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 4/5 |
| Decision clarity | 3/5 |
| Choice quality | 2/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 4/5 |
| Originality vs examples | 4/5 |
| Child comprehension | 4/5 |

- Production-worthy: nej
- Example copying: none
- Note: Fremtidsfilmene er stærke og forståelige. Valg C afviser mere information, og D fortæller vennen noget; ingen af dem afgør faktisk robotværksted eller dans.

## 3. Ung — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: AI kan prioritere knappe ressourcer løbende, når mange har brug for dem samtidig (`ai-prioritises-resources`)
- Sted: Lyon, Frankrig
- Golden examples: `youth-ai-clone-message` + `teacher-adaptive-path`
- Latency/tokens: 33056 ms · 1322 input · 1618 output

### DIN PLADS VED RHÔNE

**Future normal:** Når oversvømmelser rammer Lyon, fordeler byens AI-ledelse løbende pladser i evakueringskøretøjer efter vandstand, helbredsdata, afstand og sandsynligheden for at kunne klare sig selv.

**Human cost:** Færre mennesker bliver efterladt ved tilfældigheder, men i et kritisk øjeblik kan en persons registrerede data veje tungere end de løfter, frygt og relationer, der ikke kan måles.

**Decision:** Du skal beslutte, hvem der skal bruge den eneste plads, AI'en har tildelt dig i den næste evakueringsbus.

Et voldsomt skybrud har fået Rhône til at gå over sine mobile diger. Du står på Quai Claude Bernard med vand om anklerne, mens den sidste selvkørende bus før ruten lukkes, nærmer sig. Din mobil viser en grøn billet: AI'en har prioriteret dig på grund af din astma og den lange vej til nærmeste tørre zone. Ved siden af dig hyperventilerer din klassekammerat Inès. Lidt længere henne holder en ældre mand fast i sin sammenklappelige rollator. En nattevagt fra et hotel beder stille om hjælp; hans profil er markeret lavt, fordi systemet mangler nyere helbreds- og bopælsdata på ham. Du kan overføre din billet én gang, før bussen åbner døren.

**Det står på spil:** Du kan beskytte dig selv mod en situation, hvor din vejrtrækning kan blive dårligere. Men hvis du beholder pladsen, accepterer du også, at systemets beregning afgør mere end det, du ser lige foran dig.

**Hvem skal bruge din plads?**

A. **TAG PLADSEN SELV** — Du følger den prioritering, der skal beskytte din astma, men ser de andres behov blive stående uden for den grønne billet.
B. **GIV PLADSEN TIL INÈS** — Du hjælper din ven gennem hendes panik, men vælger en akut frygt over de fysiske risici, systemet har beregnet for dig.
C. **GIV PLADSEN TIL MANDEN MED ROLLATOREN** — Du giver pladsen til den, der vil have sværest ved at komme væk til fods, men efterlader Inès og dig selv med en mere usikker vej gennem vandet.
D. **GIV PLADSEN TIL NATTEVAGTEN** — Du retter op på, at manglende data har skubbet ham ned i køen, men giver afkald på din egen dokumenterede risiko for en person, du næsten ikke kender.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 3/5 |
| Human relevance | 5/5 |
| Plausibility | 3/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 5/5 |
| Language fit | 3/5 |
| Natural conflict | 1/5 |
| Originality vs examples | 5/5 |

- Production-worthy: nej
- Example copying: none
- Note: Et diskuterbart prioriteringsvalg, men konflikten skabes af sidste bus, én billet og en overførselsfrist. Det er præcis den kunstige scarcity/game mechanic, naturalisme-kravet forbød.

## 4. Ung — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Robotter kan hjælpe mennesker med bad, påklædning og andre intime hverdagsopgaver (`robots-personal-care`)
- Sted: Bologna, Italien
- Golden examples: `youth-ai-clone-message` + `parent-robot-care`
- Latency/tokens: 11340 ms · 1315 input · 555 output

### MIN SØSTER VIL IKKE HAVE MIG IND

**Future normal:** I 2046 bruger mange familier i Bologna hjemmehjælpsrobotter til bad, påklædning og anden kropsnær støtte, også når et familiemedlem midlertidigt har brug for hjælp.

**Human cost:** Robotten kan gøre hjælpen mindre pinlig og give din familie tid, men den kan også overtage de små øjeblikke, hvor mennesker mærker hinandens sårbarhed.

**Decision:** Du vælger, hvem der skal hjælpe din storesøster med hendes første bad efter operationen.

Din storesøster er kommet hjem til jeres lejlighed nær Porta San Donato efter en operation i knæet. Hun kan ikke stå sikkert i bruseren endnu. Da du tilbyder at hjælpe, bliver hun rød i hovedet og peger på familiens omsorgsrobot. Jeres mor siger lavt, at robotten kan klare det hele, men at din søster måske har brug for at vide, at familien ikke trækker sig, bare fordi det er akavet.

**Det står på spil:** Din søster skal kunne føle sig tryg og have kontrol over sin egen krop. Samtidig kan dit valg afgøre, om hun oplever familiens hjælp som nærvær eller som et pres, hun skal udholde.

**Hvem skal hjælpe hende i bad i aften?**

A. **LAD ROBOTTEN GØRE DET ALENE** — Din søster får den afstand og ro, hun beder om, men hun kan stå mere alene med en skræmmende ny afhængighed.
B. **HJÆLP HENDE SELV** — Hun får hjælp fra en, der elsker hende, men du overskrider den grænse, hun lige har forsøgt at sætte.
C. **VÆR I BADEVÆRELSET SAMMEN MED ROBOTTEN** — Du kan gribe ind og vise, at du bliver, men din søster mister noget af det privatliv, robotten skulle give hende.
D. **LAD JERES MOR HJÆLPE UDEN ROBOTTEN** — Din søster får menneskelig omsorg fra en voksen, hun kender, men kan føle, at familien har besluttet over hendes hoved, at robotten ikke er god nok.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 2/5 |
| Human relevance | 4/5 |
| Plausibility | 3/5 |
| Decision clarity | 4/5 |
| Choice quality | 2/5 |
| Discussion value | 4/5 |
| Language fit | 4/5 |
| Natural conflict | 3/5 |
| Originality vs examples | 4/5 |

- Production-worthy: nej
- Example copying: none
- Note: Søsterens kropslige autonomi er relevant, men den unge får urealistisk myndighed til at bestemme, hvem der bader hende. Flere valg tilsidesætter direkte hendes udtrykte ønske.

## 5. Forælder — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Robotter kan passe børn sikkert i korte perioder og kontakte voksne ved behov (`robots-watch-children`)
- Sted: Osaka, Japan
- Golden examples: `parent-genetic-risk` + `employee-dangerous-robot`
- Latency/tokens: 12435 ms · 1341 input · 590 output

### HVEM VENTER PÅ HENDE EFTER SKOLE?

**Future normal:** I Osaka er certificerede børnerobotter blevet almindelige i hjem med skæve arbejdstider. De kan lave mad, følge børn til aktiviteter og tilkalde en voksen, hvis noget virker galt.

**Human cost:** Robotten kan give et barn tryg praktisk omsorg, men den kan også gøre det lettere for voksne at lade arbejdstid og ansvar fylde de timer, hvor barnet har brug for dem personligt.

**Decision:** Du skal vælge, om din datter skal være alene med familiens børnerobot hver eftermiddag, mens du tager flere vagter.

Din tiårige datter, Mio, kommer hjem før dig til jeres lejlighed i Osaka. Jeres børnerobot kan møde hende ved døren, varme hendes snack, hjælpe med lektier og ringe til dig, hvis hun bliver ked af det. Din chef har tilbudt dig faste sene vagter, som vil betale den gæld, familien fik efter din partners lange sygdom. Mio siger, at robotten er sød, men spørger også, om du stadig vil være hjemme til at høre om hendes dag.

**Det står på spil:** Du kan skabe økonomisk ro for familien eller beskytte den daglige tid, hvor Mio mærker, at hun ikke bare bliver passet, men bliver ventet på.

**Tager du de faste sene vagter?**

A. **TAG VAGTERNE HELE UGEN** — Gælden kan blive betalt hurtigt, og robotten holder Mio sikkert med selskab, men hun lærer, at hendes hverdage først begynder rigtigt, når du allerede er træt.
B. **SIG NEJ TIL VAGTERNE** — Du er hjemme, når Mio kommer ind ad døren, men familien beholder gælden og den uro, der følger med hver regning.
C. **TAG KUN VAGTER PÅ DE DAGE, HUN HAR AKTIVITETER** — Du får noget af den ekstra indkomst, mens Mio har mindre stille tid alene, men robotten bliver stadig den voksne, hun kommer hjem til flere dage om ugen.
D. **TAG VAGTERNE, MEN LAD MIO VÆRE HOS DIN MOR EFTER SKOLE** — Mio får et menneske omkring sig, og økonomien forbedres, men din mor mister sin ro som pensionist, og Mio kan føle, at hun bliver sendt væk fra sit eget hjem.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 5/5 |
| Language fit | 5/5 |
| Natural conflict | 4/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Stærkt forældreperspektiv med reel økonomisk og relationel pris. Robotten er årsagen til, at valget findes, og alle svar medfører et forståeligt tab.

## 6. Forælder — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Mennesker kan bevise digitalt, at de er virkelige mennesker uden at vise deres fulde navn (`prove-human-online`)
- Sted: Nairobi, Kenya
- Golden examples: `parent-seasonal-home` + `employer-agent-negotiation`
- Latency/tokens: 27945 ms · 1329 input · 1357 output

### ET ÆGTE VIDNE UDEN NAVN

**Future normal:** I 2046 kan borgere i Nairobi bruge et digitalt menneskebevis: Det bekræfter, at en afsender er et rigtigt menneske med ret til at bruge en tjeneste, uden at afsløre fuldt navn, adresse eller familieforhold.

**Human cost:** Anonyme, troværdige beretninger gør det lettere at sige fra uden frygt. Men når navnet mangler, kan den anklagede have sværere ved at forstå, svare på eller forsvare sig mod beskyldningen.

**Decision:** Du skal vælge, hvordan I vil fortælle om det, din datter oplevede på vej hjem fra skole.

Din 13-årige datter kommer hjem fra sin grundskole i Nairobi og fortæller, at en ældre dreng ved matatu-stoppet flere gange har krævet penge af yngre elever. I dag gav hendes ven sin frokostpenge væk. Skolen og transportmyndigheden tager nu imod varsler gennem et system, hvor elever kan bevise, at de er virkelige mennesker og går på en relevant rute, uden at deres navn vises. Din datter vil bruge det. Hun er bange for, at drengen eller hans venner finder hende, hvis hun står frem.

**Det står på spil:** I kan gøre det sværere at ignorere afpresningen, men jeres valg afgør både, hvor udsat din datter bliver, og hvor retfærdigt den anklagede mødes.

**Hvordan indgiver I beretningen?**

A. **SEND HENDES BERETNING MED ANONYMT MENNESKEBEVIS** — Myndighederne får en troværdig elevberetning uden hendes navn, men den mistænkte kan blive ramt af en undersøgelse uden at kende sin anklager eller kunne tage direkte til genmæle.
B. **LAD HENDE STÅ FREM MED NAVN** — Hendes ord kan få større vægt og gøre sagen mere tydelig, men hun risikerer at blive genkendt ved stoppet og blive gjort til mål for vrede eller hævn.
C. **INDGIV VARSLET I DIT EGET NAVN** — Du tager den synlige risiko som voksen og skærmer hende delvist, men hendes oplevelse bliver en forælders andenhåndsberetning, som lettere kan afvises.
D. **LAD VÆRE MED AT INDBERETTE DET** — Du beskytter hende mod den umiddelbare opmærksomhed, men hendes ven og andre yngre elever kan fortsat blive presset til at betale på samme rute.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 4/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Et stort autenticitets- og anonymitetsspørgsmål bliver konkret gennem forælderens ansvar. Fire tydelige positioner med forskellige risici.

## 7. Lærer / pædagog — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Offentlige kølerum kan være en almindelig del af bylivet i varme perioder (`public-cooling-rooms`)
- Sted: Cape Town, Sydafrika
- Golden examples: `teacher-isolation-signal` + `decisionmaker-heat-priority`
- Latency/tokens: 13528 ms · 1394 input · 606 output

### DE SIDSTE ARMBÅND TIL KØLERUMMET

**Future normal:** I Cape Town åbner kommunen offentlige kølerum i varmeperioder, og skoler bruger dem som faste tilflugtssteder, når klasselokalerne bliver farlige varme.

**Human cost:** Kølerummet kan beskytte børn mod hede, men pladserne er få, og den voksne må afgøre, hvem der skal forlade fællesskabet først.

**Decision:** Du vælger, hvilke elever fra din fritidsgruppe der får de sidste pladser i det kommunale kølerum.

En eftermiddag i januar viser skolens varmemålere 39 grader i jeres bygning. Kommunens kølerum i den tidligere sportshal har sendt 12 adgangsarmbånd til din fritidsgruppe på 19 børn. Bussen kører om ti minutter. Flere børn er varme og trætte, men Sipho har hovedpine og virker fjern, mens Leila insisterer på, at hendes lillebror er bange for at blive alene tilbage med de ældre børn. To børn siger, at de hellere vil blive, fordi deres venner ikke har fået et armbånd.

**Det står på spil:** Hvis du fordeler pladserne efter akut fysisk behov, kan nogle børn opleve, at deres frygt og ensomhed tæller mindre. Hvis du holder gruppen samlet, kan du udsætte sårbare børn for mere varme.

**Hvem giver du de 12 armbånd til?**

A. **VÆLG DEM MED TYDELIGST FYSISKE TEGN** — Du prioriterer børn som Sipho, men børn med mindre synlige behov kan føle, at de skal blive syge, før en voksen tror på dem.
B. **LAD BØRNENE TRÆKKE LOD** — Reglen virker lige for alle, men den gør beskyttelse mod varme til et spørgsmål om held, også for dem der allerede kæmper mest.
C. **SEND SØSKENDE OG NÆRE VENNER SAMMEN** — Du beskytter børnenes tryghed i et uvant offentligt rum, men nogle med størst fysisk behov bliver tilbage, fordi deres trygge person ikke fik plads.
D. **TAG DE 12 YNGSTE MED** — Du følger en enkel og synlig aldersgrænse, men lægger ansvaret for at klare heden på de ældre børn, selv når de ikke reelt kan passe på sig selv.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 3/5 |
| Role fit | 4/5 |
| Human relevance | 4/5 |
| Plausibility | 3/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 4/5 |
| Language fit | 4/5 |
| Natural conflict | 1/5 |
| Originality vs examples | 3/5 |

- Production-worthy: nej
- Example copying: too close
- Note: Kølerumseksemplet er kopieret for tæt i sin struktur: få pladser, armbånd og bus om ti minutter. Konflikten kommer fra opfundet scarcity og deadline snarere end selve kølerummets nye normal.

## 8. Lærer / pædagog — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Det meste hverdags- og varetransport kan køre uden en menneskelig chauffør (`driverless-transport-normal`)
- Sted: Mexico City, Mexico
- Golden examples: `teacher-adaptive-path` + `citizen-climate-twin`
- Latency/tokens: 26113 ms · 1342 input · 1267 output

### POSEN VED SKOLEPORTEN

**Future normal:** Førerfri varetransport bringer dagligvarer til afhentningspunkter, fordi små leveringskøretøjer kører uden chauffør og kun må udlevere til en registreret voksen.

**Human cost:** Familier får billige og præcise leveringer, men den menneskelige chauffør, der før kunne se en presset situation og aflevere en pose til et barn eller en nabo, er væk.

**Decision:** Du skal beslutte, om du vil udlevere en families madpose til en elev, selv om afhentningsreglen kræver en voksen.

På din folkeskole i Iztapalapa i Mexico City bliver forældres vareleveringer ofte lagt i et aflåst skab ved porten. I dag står 10-årige Renata med koden til sin families pose: bønner, tortillas og hendes lillebrors modermælkserstatning. Hendes mor har fået en ekstra vagt på et pakkecenter, efter at førerløse varebiler overtog hendes tidligere arbejde som chauffør, og kan først komme efter skabet lukker. Systemet vil kun åbne med en voksens ansigtsskanning. Renata siger, at der ikke er mad hjemme til aftenen.

**Det står på spil:** Du kan følge en regel, der skal beskytte børn mod at bære voksnes ansvar, eller bøje den for en familie, som ellers går sulten i seng.

**Hvad gør du med Renatas families madpose?**

A. **UDLEVÉR POSEN TIL RENATA** — Familien får mad i aften, men Renata bliver den, der må løse en voksens forsørgelsesproblem og bære posen alene gennem kvarteret.
B. **VENT PÅ HENDES MOR** — Du holder fast i grænsen mellem barn og voksent ansvar, men familien mister maden, og Renata oplever skolen som endnu en lukket dør.
C. **TAG RENATA MED TIL ET MÅLTID PÅ SKOLEN** — Hun får mad og bliver ikke sendt hjem med ansvaret, men hendes lillebror og mor står stadig uden forsyninger, og hun bliver synligt behandlet som et barn i nød.
D. **UDLEVÉR POSEN TIL EN NABO, SOM RENATA PEGER PÅ** — Maden kan komme tættere på hjemmet uden at Renata bærer den, men du lægger familiens private situation og tillid i hænderne på en person, du ikke selv kender.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 2/5 |
| Role fit | 4/5 |
| Human relevance | 5/5 |
| Plausibility | 3/5 |
| Decision clarity | 4/5 |
| Choice quality | 3/5 |
| Discussion value | 4/5 |
| Language fit | 4/5 |
| Natural conflict | 2/5 |
| Originality vs examples | 4/5 |

- Production-worthy: nej
- Example copying: none
- Note: Menneskeligt vedkommende, men selvkørende transport er kun baghistorie. Den reelle konflikt er en låst madpose, voksen-scanning og lukketid; C og D er praktiske workarounds.

## 9. Fagperson — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Små autonome robotter kan levere varer gennem byer og boligområder døgnet rundt (`delivery-robots-everywhere`)
- Sted: Austin, USA
- Golden examples: `professional-early-diagnosis` + `public-neighbour-energy`
- Latency/tokens: 13084 ms · 1351 input · 634 output

### DEN KORTeste VEJ GÅR FORBI SOVEVÆRELSERNE

**Future normal:** I 2046 kører små autonome leveringsrobotter døgnet rundt på fortove og i boligområder i Austin. De kan prioritere hastende varer, men deres ruter bygger på adgang til fælles arealer tæt på hjemmene.

**Human cost:** Den samme adgang, der gør medicin og nødvendigheder hurtige at få frem, kan gøre beboeres nætter mere overvågede, støjende og svære at kontrollere.

**Decision:** Som driftsansvarlig for et boligområdes leveringszone skal du vælge, om robotterne fortsat må bruge en smal gangsti ved rækkehusene om natten.

En hedebølge har sendt mange ældre og småbørnsfamilier indendørs i Austin. Om natten leverer robotterne kølevæsker, medicin og dagligvarer fra et nærliggende depot. Den hurtigste rute går ad en smal gangsti forbi seks rækkehuse. Beboerne klager over summen fra hjulene, lysglimtene fra robotterne og kameraerne, der aktiveres ved hver dør. Hvis stien lukkes om natten, skal robotterne køre en længere rute langs den varme hovedvej, og nogle leverancer vil komme flere timer senere.

**Det står på spil:** Du kan beskytte beboernes ro og oplevelse af privatliv eller bevare den hurtige natlevering til mennesker, der kan have svært ved at klare sig uden den.

**Hvad gør du med natadgangen til gangstien?**

A. **HOLD STIEN ÅBEN HELE NATTEN** — Hastende leverancer kommer hurtigt frem, men de nærmeste beboere må leve med natlig trafik og registrering lige uden for deres hjem.
B. **LUK STIEN FRA KL. 22 TIL 06** — Beboerne får ro om natten, men kunder med akut behov må vente længere eller betale for en dyrere alternativ levering.
C. **LAD KUN MEDICINROBOTTER BRUGE STIEN OM NATTEN** — De mest kritiske pakker bevarer den korte vej, men familier, der mangler vand, køling eller babymad, mister den samme hurtige adgang.
D. **HOLD STIEN ÅBEN KUN FOR HUSSTANDE, DER AKTIVT HAR BEDT OM NATLEVERING** — Nogle får hurtig hjælp med beboernes accept, men fællesstien bliver en fordel for dem, der kan overskue og har adgang til at tilmelde sig.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 5/5 |
| Human relevance | 4/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 4/5 |
| Language fit | 4/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Udviklingen skaber naturligt konflikten mellem hurtige leverancer og hjemmets ro. Fagpersonens agency er troværdig, og alle valg holder sig på samme driftsbeslutning.

## 10. Fagperson — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Lærings- og kompetencedata kan følge mennesker fra skole gennem hele arbejdslivet (`lifelong-learning-record`)
- Sted: Singapore, Singapore
- Golden examples: `professional-early-diagnosis` + `employer-burnout-warning`
- Latency/tokens: 13910 ms · 1349 input · 726 output

### DEN GAMLE FEJL FØLGER MED PÅ VAGT

**Future normal:** I 2046 følger verificerede lærings- og kompetencedata singaporeanere fra skoleårene gennem hele arbejdslivet. Arbejdsgivere bruger dem til at fordele ansvar, efteruddannelse og adgang til sikkerhedskritiske opgaver.

**Human cost:** Data kan gøre det lettere at opdage oversete evner og tilbyde den rette støtte, men et gammelt læringsmønster kan også blive en varig forklaring på, hvad et menneske angiveligt ikke kan.

**Decision:** Du skal afgøre, om en medarbejders gamle kompetenceprofil skal påvirke, hvem der får ansvaret for en akut sikkerhedsopgave.

Du er fagansvarlig på et kontrolrum ved Singapores havn. En fejl i et autonomt lastsystem har lukket en kaj, og du skal udpege én person til at lede den manuelle omlægning, før forsyninger til hospitaler bliver forsinket. Din kollega Farah har mest erfaring og melder sig straks. Hendes livslange kompetenceprofil viser dog et mønster fra ungdomsuddannelsen: under tidspres overså hun gentagne gange afvigelser i komplekse procedurer. De seneste tolv år har hun arbejdet uden alvorlige fejl. En yngre kollega har en stærkere profil, men har aldrig stået med ansvaret i en reel krise.

**Det står på spil:** Du kan bruge data til at mindske risikoen ved kajen, men også lade et gammelt mønster veje tungere end Farahs dokumenterede arbejdsliv og hendes tillid i teamet.

**Hvem giver du ansvaret for den manuelle omlægning?**

A. **GIV FARAH ANSVARET** — Du anerkender hendes erfaring og viser, at mennesker kan vokse ud af deres gamle data, men udsætter drift og sikkerhed for den risiko, profilen advarer om.
B. **GIV DEN YNGRE KOLLEGA ANSVARET** — Du følger det stærkeste datagrundlag og giver en ny medarbejder en chance, men Farah oplever, at fejl fra skoletiden stadig kan lukke døre for hende.
C. **BEHOLD SELV ANSVARET** — Du undgår at lade profilen afgøre mellem to kolleger, men fratager dem begge et vigtigt fagligt skridt og binder dig selv i en opgave, hvor du kender anlægget dårligere.
D. **UDPEG FARAH, MEN LAD DEN YNGRE KOLLEGA HAVE DEN AFGØRENDE GODKENDELSE** — Du deler risikoen mellem erfaring og data, men gør Farahs autoritet betinget af en yngre kollegas kontrol og kan skabe tvivl midt i en presset indsats.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 4/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Meget stærk brug af livslange kompetencedata: gammel prognose mod tolv års erfaring. Krisen øger stakes uden alene at opfinde konflikten.

## 11. Arbejdsgiver — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Film, reklamer og undervisning kan bruge syntetiske personer, som aldrig har levet (`synthetic-actors`)
- Sted: Wellington, New Zealand
- Golden examples: `employer-ai-liability` + `employee-continuous-measurement`
- Latency/tokens: 12734 ms · 1362 input · 624 output

### ANSIGTET, DER ALDRIG KAN BLIVE TRÆT

**Future normal:** Produktionsselskaber kan licensere syntetiske personer med ansigter, stemmer og livshistorier, der aldrig har tilhørt et menneske.

**Human cost:** Ingen skuespiller behøver at stå foran kameraet, men de første jobs, erfaringer og tilfældige gennembrud for lokale talenter bliver færre.

**Decision:** Som arbejdsgiver vælger du, om kampagnen skal besættes med en syntetisk hovedperson eller et menneske fra Wellington.

Dit bureau i Wellington har vundet en stor kampagne for færgerne over Cookstrædet. Kunden foretrækker en syntetisk kvinde, som kan tale alle sprog, optage stormscener uden risiko og bruges i reklamer i ti år. Din castingansvarlige har samtidig fundet Maia, en lokal skuespiller, hvis første store kontrakt kunne holde hende i branchen efter to år med små undervisningsjobs. Budgettet rækker kun til én hovedperson.

**Det står på spil:** Du kan give kunden det fejlfri og genbrugelige ansigt, de betaler for, eller bruge kampagnen til at holde en virkelig persons karriere og de lokale optagedage i live.

**Hvem giver du hovedrollen?**

A. **VÆLG DEN SYNTHETISKE HOVEDPERSON** — Kunden får en fleksibel stjerne uden forsinkelser eller sikkerhedsrisiko, men Maia mister sin mulighed, og bureauet køber færre dage med menneskelig performance.
B. **VÆLG MAIA TIL HELE KAMPAGNEN** — En lokal skuespiller får et gennembrud og et hold får arbejde omkring hende, men du beder kunden acceptere færre sprogversioner, dyrere optagelser og et ansigt, de ikke kan eje for altid.
C. **LAD MAIA VÆRE ANSIGTET I WELLINGTON OG BRUG DEN SYNTHETISKE PERSON GLOBALT** — Maia får synlighed hjemme, men hendes arbejde bliver en lokal undtagelse, mens den syntetiske person får den internationale rækkevidde og den varige værdi.
D. **VÆLG DEN SYNTHETISKE PERSON, MEN ANSÆT MAIA SOM BEVÆGELSES- OG STEMMEINSTRUKTØR** — Maia får betalt arbejde og sætter et menneskeligt præg på figuren, men publikum vil aldrig vide, at noget af personen kommer fra hende, og hun får ikke rollen i sit eget navn.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 3/5 |
| Originality vs examples | 5/5 |

- Production-worthy: nej
- Example copying: none
- Note: Syntetiske skuespillere og menneskelige karriereveje er et stærkt World 2046-spørgsmål. Men 'budgettet rækker kun til én' er en konstrueret scarcity-mekanisme, som gør valget kunstigt eksklusivt.

## 12. Arbejdsgiver — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Medicin kan tilpasses den enkelte persons biologi og ændres løbende (`personalised-medicine`)
- Sted: Helsinki, Finland
- Golden examples: `employer-agent-negotiation` + `youth-body-sensor-team`
- Latency/tokens: 12290 ms · 1331 input · 681 output

### DEN UGE HUN IKKE MÅ PRESSES

**Future normal:** Personligt tilpasset medicin justeres løbende efter blodprøver, søvn, hormoner og immunrespons, så behandlingen kan følge et menneskes krop fra uge til uge.

**Human cost:** Den kan gøre flere i stand til at arbejde uden smerter eller tilbagefald, men den gør også kroppens skiftende grænser synlige for dem, der fordeler ansvar og muligheder.

**Decision:** Du skal afgøre, om en projektleder skal beholde ansvaret for en afgørende kundelancering, efter hendes medicinplan pludselig er ændret.

På dit designbureau i Helsinki skal I lancere en offentlig transportløsning for byen om ti dage. Din projektleder, Aino, har ledet arbejdet i et år. Hendes løbende tilpassede behandling mod en autoimmun sygdom er netop ændret: Den vil sandsynligvis holde hendes hænder smertefrie på sigt, men de næste seks dage kan hun få koncentrationssvigt og uforudsigelig udmattelse. Aino siger, at hun stadig vil stå for lanceringen. Hun har delt behandlingsprognosen med dig, fordi hun vil være ærlig. To medarbejdere er klar til at overtage, men de kender ikke alle hendes valg og relationer til kunden.

**Det står på spil:** Hvis du lader Aino fortsætte, viser du tillid til hendes egen vurdering, men en fejl kan koste holdet kontrakten. Hvis du flytter ansvaret, kan du beskytte projektet og hendes helbred, men gøre hendes frivillige åbenhed til en grund til at miste indflydelse.

**Hvem får ansvaret for lanceringen?**

A. **LAD AINO LEDE LANCERINGEN** — Du respekterer hendes beslutning om sin egen krop og sit arbejde, men resten af holdet må bære risikoen, hvis behandlingen rammer hende midt i lanceringen.
B. **GIV ANSVARET TIL EN ANDEN** — Du skærmer både kunde og projekt mod en kendt usikkerhed, men Aino kan opleve, at hendes helbredsoplysninger nu begrænser hendes karriere.
C. **DEL ANSVARET MELLEM AINO OG HENDES NÆSTKOMMANDERENDE** — Du skaber en sikkerhed under lanceringen, men gør Ain­os lederskab betinget af en overvågning, som de andre projektledere ikke lever med.
D. **LAD AINO LEDE, MEN FORTÆL KUNDEN OM BEHANDLINGSRISIKOEN** — Du gør forventningerne åbne og kan beskytte tilliden, men udleverer Ain­os helbredsforhold til en kunde, der fremover kan tvivle på hende.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Personlig medicin bliver til et naturligt arbejdsgiverdilemma om åbenhed, helbred og mulighed. Valg D er hårdt, men afslører en reel prioritering frem for en flugtvej.

## 13. Medarbejder — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Personlige data-agenter kan give og fjerne adgang til oplysninger på et menneskes vegne (`personal-data-agents`)
- Sted: Dubai, Forenede Arabiske Emirater
- Golden examples: `employee-dangerous-robot` + `employer-agent-negotiation`
- Latency/tokens: 29699 ms · 1361 input · 1604 output

### DIN AGENT KAN RENSE DIT NAVN

**Future normal:** Personlige data-agenter styrer løbende, hvem der må se deres ejers oplysninger, og kan give eller fjerne adgang midt i en sag.

**Human cost:** Det er lettere at beskytte sit privatliv, men når data kan afgøre skyld og arbejde, kan en lukket grænse også blive læst som mistanke eller svigt.

**Decision:** Du skal beslutte, hvilke af dine personlige oplysninger din data-agent må dele med virksomhedens undersøgelse.

På et lager i Jebel Ali i Dubai er en container med ulovligt mærkede batterier registreret med dit medarbejder-ID. Du var ikke ved rampen den aften, men du byttede vagt med en kollega, som stadig forsøger at få fornyet sin opholdstilladelse. Din data-agent kan give undersøgelsen adgang til din præcise færden, dine private beskeder og dine arbejdslogfiler – eller fjerne virksomhedens adgang helt. Hvis sagen ikke afklares inden dagens udgang, bliver I begge taget af vagtplanen.

**Det står på spil:** Du kan beskytte dit privatliv, din kollegas fremtid eller din egen troværdighed, men ikke uden at nogen bærer risikoen.

**Hvilken adgang giver du undersøgelsen?**

A. **GIV FULD ADGANG I ET DØGN** — Din tidslinje kan vise, at du ikke var ved containeren, men chefen får også indblik i private beskeder og steder, du aldrig havde tænkt at dele på arbejdet.
B. **DEL KUN ARBEJDSLOGFILERNE** — Du holder dit privatliv lukket, men logfilerne viser ikke selve vagtbyttet, så mistanken kan blive hængende over jer begge.
C. **DEL BESKEDERNE OM VAGTBYTTET** — Du dokumenterer, hvorfor dit ID blev brugt, men din kollega bliver direkte knyttet til den aften, der kan afgøre hans ophold og job.
D. **FJERN VIRKSOMHEDENS ADGANG HELT** — Du fastholder, at din agent ikke er et redskab for arbejdsgiveren, men du risikerer suspension uden mulighed for at forklare dig med data.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 3/5 |
| Originality vs examples | 5/5 |

- Production-worthy: nej
- Example copying: none
- Note: Choice-aksen om dataadgang er usædvanligt ren. Den kunstige dagsfrist og automatiske suspension er dog lagt ind for at tvinge valget og sænker naturalismen.

## 14. Medarbejder — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Digitale samtaler kan løbende verificere, hvem der faktisk deltager (`verified-conversations`)
- Sted: Kigali, Rwanda
- Golden examples: `employee-dangerous-robot` + `youth-body-sensor-team`
- Latency/tokens: 11481 ms · 1330 input · 560 output

### DU SKAL VISE, AT DET ER DIG

**Future normal:** Digitale samtaler kan løbende verificere, hvem der faktisk deltager, så møder, opkald og beskeder får samme vægt som fysisk fremmøde.

**Human cost:** Systemet beskytter mod falske profiler og skjult manipulation, men gør det sværere at tale på vegne af andre eller holde sin deltagelse privat.

**Decision:** Medarbejderen vælger, om de vil bekræfte deres identitet i et følsomt videomøde om en kollegas afskedigelse.

På dit kontor i Kigali indkalder ledelsen til et videomøde om budgetnedskæringer. En kollega, Aline, er på barsel og har bedt dig læse hendes korte forsvar op: Hun frygter, at hendes stilling forsvinder, mens hun er væk. Mødesystemet kræver løbende ansigts- og stemmeverifikation. Det markerer straks, at ordene ikke er dine, og ledelsen kan se, at du taler på en andens vegne.

**Det står på spil:** Du kan give Aline en stemme i en beslutning, der rammer hende direkte, men du risikerer selv at blive opfattet som illoyal eller uærlig. Hvis du følger systemets krav, står hun uden for samtalen om sit eget arbejde.

**Hvad gør du?**

A. **LÆS ALINES FORSVAR OP ALLIGEVEL** — Du gør hendes sag hørbar, men din verificerede profil registrerer, at du bevidst talte på vegne af en fraværende kollega.
B. **SIG, AT DU KUN KAN TALE FOR DIG SELV** — Du beskytter din egen position og følger mødernes normer, men Aline mister sit eneste planlagte indlæg.
C. **FORTÆL ÅBENT, AT ALINE HAR BEDT DIG TALE** — Du undgår at skjule noget, men ledelsen kan afvise hendes ord, fordi de ikke kommer fra hendes verificerede deltagelse.
D. **FORLAD MØDET I PROTEST** — Du nægter at legitimere en proces, der udelukker Aline, men opgiver muligheden for at påvirke beslutningen indefra.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 4/5 |
| Decision clarity | 4/5 |
| Choice quality | 4/5 |
| Discussion value | 4/5 |
| Language fit | 5/5 |
| Natural conflict | 4/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Rollen, relationen og agency passer. Verificering påvirker konkret, hvem der kan tale, og de fire reaktioner accepterer grundsituationen.

## 15. For alle — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Hjem kan ændre energiforbrug automatisk efter belastningen på elnettet (`grid-responsive-homes`)
- Sted: Tallinn, Estland
- Golden examples: `public-neighbour-energy` + `child-robot-friend-memory`
- Latency/tokens: 30832 ms · 1319 input · 1579 output

### ET VARMT RUM ELLER EN VEJ UD

**Future normal:** I Tallinn justerer boliger automatisk varme, opladning og apparater, når elnettet er presset. Beboeren kan kun vælge få undtagelser, fordi hver undtagelse lægger ekstra belastning på det lokale net.

**Human cost:** Automatikken hjælper med at undgå større udfald, men den gør almindelige behov som varme, mad og bevægelsesfrihed til valg, der kan gå ud over andre.

**Decision:** Du skal vælge, om dit hjem skal følge sparetilstanden helt eller hvilken enkelt funktion der skal prioriteres.

En isstorm har lagt sig over Tallinn, og elnettet i jeres kvarter er presset mellem klokken 18 og 22. Hjemmets energisystem sænker automatisk temperaturen, begrænser komfuret og udsætter opladning. På skærmen står der, at I kan vælge én undtagelse. Din far er på besøg og skal have sin elektriske kørestol opladet til en vigtig genoptræning tidligt næste morgen. Samtidig ligger din datter med feber i det værelse, som systemet vil gøre koldest.

**Det står på spil:** Hvis I bruger mere strøm nu, får jeres familie en nødvendig lettelse, men I bidrager til belastningen i et kvarter, hvor andre hjem også automatisk mister varme og strøm til hverdagsting.

**Hvad vælger du, at hjemmet skal prioritere?**

A. **FØLG SPARETILSTANDEN HELT** — I lægger ikke ekstra pres på nettet, men din fars kørestol bliver ikke fuldt opladet, og din datter må sove i et koldere rum.
B. **SLÅ SPARETILSTANDEN FRA I HELE HJEMMET** — I beholder varme, madlavning og opladning som normalt, men jeres hjem bruger mest strøm netop i de timer, hvor kvarteret skal holde sammen på kapaciteten.
C. **PRIORITÉR KØRESTOLENS OPLADNING** — Din far kan selv komme til genoptræning næste morgen, men din datters værelse bliver koldt, og resten af hjemmet må undvære de andre funktioner.
D. **PRIORITÉR VARME I DIN DATTERS VÆRELSE** — Din datter kan sove varmt med feber, men din far risikerer at misse genoptræningen, fordi han ikke kan komme sikkert frem i sin kørestol.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 3/5 |
| Role fit | 4/5 |
| Human relevance | 5/5 |
| Plausibility | 4/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 4/5 |
| Language fit | 4/5 |
| Natural conflict | 1/5 |
| Originality vs examples | 3/5 |

- Production-worthy: nej
- Example copying: too close
- Note: Outputtet kopierer energieksemplets struktur tæt og opfinder én undtagelse i et fire-timers vindue. Det er en tydelig game mechanic, selv om familiens behov er menneskeligt relevante.

## 16. For alle — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Mennesker kan se lokale simuleringer af politiske beslutninger, før de bliver vedtaget (`policy-simulations`)
- Sted: Stockholm, Sverige
- Golden examples: `public-neighbour-energy` + `decisionmaker-automated-decisions`
- Latency/tokens: 22273 ms · 1389 input · 1030 output

### DIN ROLIGE GADE BLIVER EN ANDENS OMVEJ

**Future normal:** Før lokale afstemninger kan Stockholms borgere åbne en simulation af deres eget kvarter og se sandsynlige følger gade for gade: rejsetider, støj, uheld og hvem der mister adgang.

**Human cost:** Simulationerne gør konsekvenserne svære at ignorere, men de gør også naboers sårbarhed til noget, man kan veje op mod sin egen hverdag.

**Decision:** Du skal stemme om, hvordan en trafikeret strækning ved Medborgarplatsen skal bruges, når den ene kørebane fjernes.

Stockholm skal fjerne en kørebane ved Medborgarplatsen for at mindske varme og partikler. I den lokale beslutningssimulation ser du, at en grøn cykel- og opholdsstrækning vil gøre din egen gård mærkbart roligere. Men modellen viser også, at varebiler til et nærliggende plejehjem får længere rute, og at den hurtigste alternative vej lægger mere støj foran en kommunal boligblok. Du kan se udviklingen time for time, også på den morgen hvor en beboer i boligblokken normalt sover efter nattevagt.

**Det står på spil:** Du kan vælge en løsning, der giver renere og tryggere byrum tæt på dig, eller begrænse den belastning, som flyttes over på mennesker, der ikke selv har valgt den.

**Hvilken brug af den frigivne kørebane stemmer du for?**

A. **GRØN CYKEL- OG OPHOLDSSTRÆKNING** — Dit område får mindre trafik, køligere sommerdage og en sikker cykelrute, men plejehjemmets leverancer og gennemkørende biler flyttes til andre beboeres gader.
B. **BUSSPOR HELE DØGNET** — Flere kan komme hurtigt frem uden bil, og omvejene bliver mindre, men din egen gade får fortsat støj og ingen ny plads til ophold eller træer.
C. **LEVERINGS- OG HANDICAPSPOR** — Plejehjemmet og lokale forretninger bevarer nem adgang, men den største del af trafikken og luftforureningen bliver liggende i kvarteret.
D. **BILFRI STRÆKNING MED FASTE LEVERINGSTIDER** — Gaden bliver mest rolig og sikker for gående, men leverancer samles på få tidspunkter, og ansatte samt beboere med begrænset mobilitet må indrette deres dage efter dem.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 3/5 |
| Role fit | 4/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 5/5 |

- Production-worthy: nej
- Example copying: none
- Note: Et godt nutidigt bypolitisk dilemma med fire stærke positioner. Simulationen viser blot konsekvenserne; dilemmaet ville være næsten identisk uden den valgte 2046-development.

## 17. Borger — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Genetiske risikoprofiler kan sige noget om sygdom flere årtier frem (`genetic-risk-decades`)
- Sted: Gdansk, Polen
- Golden examples: `citizen-climate-twin` + `professional-early-diagnosis`
- Latency/tokens: 12517 ms · 1344 input · 682 output

### DEN FREMTID, HUN IKKE HAR BEDT OM

**Future normal:** I 2046 kan borgere i Polen få genetiske risikoprofiler, der estimerer sandsynligheden for bestemte sygdomme årtier før de første symptomer.

**Human cost:** Tidlig viden kan gøre det muligt at planlægge behandling, økonomi og familieliv, men den kan også ændre, hvordan man ser på et raskt menneske og de valg, det menneske får lov at træffe frit.

**Decision:** Du skal beslutte, om du vil fortælle din voksne datter, hvad din fælles genetiske profil sandsynligvis betyder for hende.

På en sundhedsklinik i Gdansk har du fået din opdaterede risikoprofil. Den viser en høj sandsynlighed for, at du udvikler en arvelig hjertesygdom omkring pensionsalderen. Klinikken forklarer, at din 27-årige datter sandsynligvis har arvet samme variant. Hun har fravalgt adgang til familiens genetiske data, fordi hun netop søger lån med sin partner til at åbne en lille restaurant i Wrzeszcz. Hvis hun kender risikoen, kan hun begynde forebyggelse og indrette sit liv efter den. Men hun vil også få en oplysning, hun udtrykkeligt har sagt, at hun ikke vil have.

**Det står på spil:** Du kan give din datter mulighed for at handle mange år før sygdommen, eller respektere hendes ret til ikke at lade en mulig fremtid styre et raskt liv.

**Fortæller du hende om fundet?**

A. **FORTÆL HENDE ALT NU** — Hun får mulighed for forebyggelse og langsigtet planlægning, men hendes restaurantdrøm og selvbillede kan straks blive præget af en sygdom, der måske først kommer om årtier.
B. **RESPEKTÉR HENDES FRAVALG** — Hun beholder retten til ikke at vide og kan træffe sine valg uden risikoen over sig, men mister måske årtiers mulighed for at forebygge.
C. **FORTÆL KUN, AT DER ER EN FAMILIERISIKO** — Du åbner døren til handling uden at lægge hele prognosen på hende, men efterlader hende med en urolig advarsel og uden den klarhed, hun kunne bruge.
D. **DEL FUNDET MED HENDES PARTNER I STEDET** — Partneren kan tage hensyn til risikoen i fælles økonomiske og familiemæssige valg, men du bryder din datters fortrolighed og lader en anden bære viden om hendes krop.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 3/5 |
| Discussion value | 5/5 |
| Language fit | 5/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 4/5 |

- Production-worthy: nej
- Example copying: mild structural similarity
- Note: Meget stærk scene om genetisk viden og retten til ikke at vide. Valg D bryder åbenlyst datterens fortrolighed og er derfor ikke et oprigtigt attraktivt valg; C nærmer sig en workaround.

## 18. Borger — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Syntetisk video og lyd kan være næsten umulig for mennesker at skelne fra optagelser (`synthetic-media-indistinguishable`)
- Sted: São Paulo, Brasilien
- Golden examples: `citizen-climate-twin` + `decisionmaker-anonymous-credibility`
- Latency/tokens: 12112 ms · 1374 input · 619 output

### VIDEOEN FRA METROEN

**Future normal:** I 2046 kan syntetiske videoer og stemmer efterligne rigtige mennesker så præcist, at øjne og ører sjældent kan afsløre forskellen.

**Human cost:** Det beskytter ingen længere blot at have en optagelse som bevis. I konflikter kan selv ægte minder, stemmer og billeder gøres mistænkelige.

**Decision:** Du vælger, om du vil dele en video, der kan få din bror frikendt eller knuse hans mulighed for at få et roligt liv bagefter.

Din lillebror er blevet anholdt efter uro på en metrostation i São Paulo. Politiet har en video, der tilsyneladende viser ham kaste en flaske mod en betjent. På din mors gamle telefon finder du en anden video fra samme minut: Den viser ham hjælpe en ældre mand væk fra trængslen. Familien ved, at videoen er ægte, men alle kan nu påstå, at den er skabt. En lokal nyhedskanal tilbyder at vise den i aften, hvis du giver den til dem. Din bror siger, at han ikke vil være ansigtet på endnu en viral kampagne, uanset om den forsvarer ham.

**Det står på spil:** Du kan gøre videoen til et offentligt forsvar for din bror, men samtidig gøre hans ansigt, stemme og hverdag til råstof for nye falske klip. Holder du den tilbage, kan hans sag blive sværere at tro på.

**Giver du videoen til nyhedskanalen?**

A. **GIV DEN TIL KANALEN UDEN FORBEHOLD** — Flere ser et muligt modbevis med det samme, men din bror bliver offentligt genkendelig og kan blive mål for falske videoer og chikane.
B. **GIV DEN KUN TIL HANS FORSVARER** — Videoen kan bruges i sagen med mindre offentlig eksponering, men den får ikke den folkelige opmærksomhed, som måske kunne lægge pres på politiet.
C. **DEL DEN SELV MED FAMILIE OG NABOER** — Du bevarer kontrollen over, hvem der først ser den, men den kan hurtigt miste sammenhæng, blive kopieret og blive opfattet som familiens egen manipulation.
D. **HOLD VIDEOEN HELT TILBAGE** — Du respekterer din brors ønske om ikke at blive en offentlig figur, men I opgiver det stærkeste billede af, hvor han var under uroen.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 5/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 5/5 |
| Language fit | 5/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 5/5 |

- Production-worthy: ja
- Example copying: none
- Note: Evalens stærkeste case. Syntetiske medier ændrer selve værdien og faren ved en ægte video, og alle fire distributioner har forskellige menneskelige priser.

## 19. Beslutningstager — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: Undervisning kan ændre tempo, forklaring og opgave automatisk fra elev til elev (`adaptive-lessons`)
- Sted: Melbourne, Australien
- Golden examples: `decisionmaker-anonymous-credibility` + `teacher-isolation-signal`
- Latency/tokens: 11265 ms · 1379 input · 591 output

### DEN OPGAVE, HAN ALDRIG FÅR AT SE

**Future normal:** Undervisningssystemer tilpasser i realtid tempo, forklaringer og opgaver til hver elevs forståelse og arbejdsform.

**Human cost:** Flere kan følge med fagligt, men elever kan også blive fastholdt i usynlige spor, som former deres muligheder og deres billede af egne evner.

**Decision:** Du skal beslutte, om en elev skal blive i sit personlige læringsforløb eller igen arbejde på samme opgave som klassen.

På en folkeskole i Melbourne følger 13-årige Noah matematik gennem skolens adaptive undervisning. Systemet har i måneder givet ham kortere opgaver, flere visuelle forklaringer og færre åbne problemer end resten af klassen. Han får bedre resultater og virker mindre presset. I dag spørger han, hvorfor hans ven ved nabobordet arbejder med en svær brokonstruktionsopgave, som han selv aldrig har fået tilbudt. Som skoleleder kan du se, at systemet vurderer, at Noah vil miste motivationen, hvis han får den nu.

**Det står på spil:** Du kan beskytte Noahs nyfundne faglige ro eller give ham adgang til den fælles udfordring, selv om han risikerer igen at føle sig som den, der ikke kan følge med.

**Hvad beslutter du for Noah i denne time?**

A. **LAD HAM BLIVE I SIT PERSONLIGE FORLØB** — Noah beholder et tempo, hvor han lykkes, men han må acceptere, at systemet vælger nogle af klassens muligheder fra for ham.
B. **GIV HAM SAMME OPGAVE SOM KLASSEN** — Noah får adgang til den samme faglige verden som vennerne, men kan stå offentligt med en opgave, han endnu ikke kan løse alene.
C. **LAD HAM VÆLGE MELLEM DE TO OPGAVER** — Noah får indflydelse på sin vej, men ansvaret for at vælge mellem tryghed og risiko lægges på en elev, der netop har fået at vide, at han er bagud.
D. **SÆT HAM SAMMEN MED VENNERNE OM OPGAVEN** — Noah kan deltage i den fælles udfordring med støtte, men vennerne kan komme til at se ham som den, der skal hjælpes, frem for som en ligeværdig makker.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 4/5 |
| Role fit | 3/5 |
| Human relevance | 5/5 |
| Plausibility | 5/5 |
| Decision clarity | 5/5 |
| Choice quality | 4/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 5/5 |
| Originality vs examples | 3/5 |

- Production-worthy: nej
- Example copying: mild structural similarity
- Note: Konflikten er naturlig og valgene forståelige, men perspektivet er reelt lærer/skoleleder snarere end den bredere beslutningstagerrolle. Strukturen ligger tæt på bibliotekets adaptive elev-eksempel.

## 20. Beslutningstager — TEKNISK GODKENDT

- Model: gpt-5.6-terra
- Development: AI kan udføre store dele af administrativt arbejde fra planlægning til dokumentation (`ai-administration`)
- Sted: Jakarta, Indonesien
- Golden examples: `decisionmaker-anonymous-credibility` + `teacher-ai-group-member`
- Latency/tokens: 15871 ms · 1403 input · 790 output

### DE SIDSTE LEJLIGHEDER HAR ALLEREDE ET NAVN

**Future normal:** I 2046 lader Jakartas forvaltning AI udarbejde planer, afgørelser, budgetter og sagsnotater på få timer. Menneskelige beslutningstagere godkender ofte tusindvis af sager med én underskrift.

**Human cost:** Byen kan reagere hurtigt på oversvømmelser og flytninger, men borgere, hvis liv ikke passer i registre og standardkategorier, risikerer at blive behandlet som fejl i stedet for som naboer.

**Decision:** Du skal vælge, hvilken gruppe der får de sidste permanente boliger i et nyt, højere boligområde.

Efter endnu en sæson med saltvand i Nordjakarta har AI-forvaltningen færdiggjort en flytteplan for 3.000 familier på én nat. Der er 120 lejligheder tilbage. Systemet har reserveret dem til familier med registreret adresse, skolebørn og dokumenteret arbejde i området. Uden for mødelokalet venter fiskere, hjemmebaserede arbejdere og lejere, som har boet ved kanalen i årevis, men mangler de dokumenter, AI'en kræver. Hvis du ændrer fordelingen, mister nogle af de registrerede familier den bolig, de allerede har fået besked om.

**Det står på spil:** Du kan belønne dem, der har fulgt den formelle vej, eller give plads til mennesker, som er mest udsatte, men næsten usynlige i byens data.

**Hvem skal have de 120 sidste lejligheder?**

A. **HOLD FAST I AI'ENS RÆKKEFØLGE** — Planen forbliver forudsigelig, og familier med dokumenter mister ikke deres løfte, men langvarige beboere uden papirer bliver henvist til midlertidige centre langt fra deres arbejde.
B. **GIV LEJLIGHEDERNE TIL DE MEST OVERSVØMMELSESTRUDEDE HUSSTANDE** — De mennesker, der lever farligst, kommer først i sikkerhed, men registrerede familier må se deres tildeling forsvinde, selv om de har planlagt skole og arbejde efter den.
C. **PRIORITÉR FAMILIER MED BØRN I LOKALE SKOLER** — Flest børn kan blive i deres kendte hverdag, men ældre, enlige og barnløse arbejdere får signalet, at deres tilknytning til kvarteret tæller mindre.
D. **RESERVÉR HALVDELEN TIL UREGISTREREDE NABOER, SOM LOKALE LEDERE KENDER** — Mennesker uden digitale spor får en reel vej ind, men lokale ledere får stor magt over, hvem der anses for at høre til, og nogle dokumenterede familier bliver forbigået.

### Redaktionel vurdering

| Dimension | Score |
|---|---:|
| Future significance | 3/5 |
| Role fit | 5/5 |
| Human relevance | 5/5 |
| Plausibility | 4/5 |
| Decision clarity | 5/5 |
| Choice quality | 5/5 |
| Discussion value | 5/5 |
| Language fit | 4/5 |
| Natural conflict | 2/5 |
| Originality vs examples | 5/5 |

- Production-worthy: nej
- Example copying: none
- Note: Beslutningstagerens agency og choices fungerer. Men 120 sidste lejligheder, allerede lovede pladser og flere grupper i kø gør konflikten til klassisk konstrueret ressourcefordeling; AI-administration er mest anledning.
