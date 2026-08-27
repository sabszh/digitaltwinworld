# World 2046 — simplified generator A/B/C report

## Konklusion

Setup C (simplified prompt/schema + `gpt-5.6-terra`) gav de bedste dilemmaer. Forskellen fra B var især tydelig i dilemmaets styrke, choice-kvalitet og diskussionsværdi. Terra var til gengæld ca. 3,4× langsommere og, med den transparente pris-proxy nedenfor, ca. 8× dyrere per genereret dilemma end simplified Luna.

Acceptance rate er ikke brugt som kvalitetsmål. Den redaktionelle grænse for et “godt dilemma” er her et gennemsnit på mindst 4,0/5 på de syv dimensioner. A og B gav hver 3/10 gode dilemmaer; C gav 7/10.

## Hvad blev simplificeret?

- Den kreative model returnerer kun title, scener, stake, question, core tension, fire choices, location type og et place hint.
- ID, pressure, severity, problem area, role, region, land, by, koordinater, target groups, taxonomy, tags og technology tilføjes i kode.
- Alle responses for det valgte future pressure sendes til forfatteren; den må vælge eller lave en nærliggende udvikling.
- Audience-profiler påvirker perspective, agency, relationer, stakes og sprog, men filtrerer ikke future pressures.
- De 40 `valueImpacts` er flyttet til et separat Luna-kald, som ikke må omskrive dilemmaet.
- Runtime-valideringen for den nye sti kontrollerer schema, tekstgrænser, fire unikke IDs, taxonomy/geography, tydelig forkert børne-authority og åbenlyst unsafe indhold. De gamle semantiske regex-gates bruges kun i baseline A.
- Geografi planlægges fra eksisterende lokationsdata. `placeHint` slås op efter forfatterkaldet; hvis opslaget ikke finder et reelt sted, bruges byens koordinater uden popup.

## Bounded metode

- 10 roller og 10 forudberegnede planer.
- Præcis ét authoring-kald per rolle per setup.
- Samme serialiserede plan genbrugt i A, B og C.
- Ingen retries, regenerationer eller erstatning af afviste outputs.
- 30 authoring-kald i alt: `{ A: 10, B: 10, C: 10 }`.
- D blev ikke kørt. Sol var valgfri, og 10 ekstra kald ville ikke være “let” eller nødvendigt for at afgøre Luna/Terra-spørgsmålet.

## Kvantitativ sammenligning

| Setup | Prompt/schema | Model | Accepted | Gode (≥4,0) | Gns. latency | Input tokens | Output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| A | Baseline | gpt-5.6-luna | 7/10 | 3/10 | 16,1 s | 52.990 | 18.992 |
| B | Simplified | gpt-5.6-luna | 9/10 | 3/10 | 10,5 s | 11.710 | 11.062 |
| C | Simplified | gpt-5.6-terra | 10/10 | 7/10 | 36,1 s | 11.710 | 19.050 |

Den simple prompt reducerede Luna-input med 78 % og latency med 35 %. Den forbedrede ikke antallet af redaktionelt gode dilemmaer i denne lille stikprøve, men fjernede meget metadataarbejde og flere tekniske afvisninger. Terra brugte samme lave inputmængde som B, men væsentligt flere output/reasoning-tokens.

### Prisestimat

Der findes ikke en offentlig prisreference for aliaserne `gpt-5.6-luna` og `gpt-5.6-terra`, som kan verificeres. For at undgå falsk præcision bruger tabellen en eksplicit proxy:

- Luna: $0,25 / 1M input tokens og $2 / 1M output tokens.
- Terra: $1,25 / 1M input tokens og $10 / 1M output tokens.
- Separat value-scoring er ikke med i de målte authoring-tal, fordi det ville bryde evalens maksimum på ét kald per rolle/setup. Production får derfor en lille ekstra Luna-omkostning og latency.

| Setup | Est. pris/genereret | Est. 5 genereringer | Est. pris/redaktionelt godt | Est. 5 gode dilemmaer inkl. forventede fejlskud |
|---|---:|---:|---:|---:|
| A | $0,0051 | $0,0256 | $0,0171 | $0,0854 |
| B | $0,0025 | $0,0125 | $0,0084 | $0,0418 |
| C | $0,0205 | $0,1026 | $0,0293 | $0,1465 |

Det robuste tal er tokenforbruget; dollarbeløbene skal erstattes med de faktiske kontraktpriser for modelaliaserne.

## Redaktionelle scorer

Skala: 1–5. Kolonner: Future significance (FS), Dilemma strength (DS), Human relevance (HR), Plausibility (P), Choice quality (CQ), Discussion value (DV), World 2046 fit (W46).

### Setup A — baseline Luna

| Rolle / case | Status | FS | DS | HR | P | CQ | DV | W46 | Gns. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Barn — Hvem vil du være sammen med i varmen? | Accepted | 3 | 2 | 4 | 4 | 2 | 3 | 3 | 3,00 |
| Ung — Hvem får plads ved siden af hende? | Afvist: audience_language | 3 | 4 | 4 | 3 | 3 | 4 | 3 | 3,43 |
| Forælder — Hvem må kende dit barns vej? | Accepted | 4 | 3 | 4 | 3 | 3 | 4 | 4 | 3,57 |
| Lærer/pædagog — Skal Mika kende sin prognose? | Accepted | 5 | 4 | 5 | 4 | 4 | 5 | 5 | 4,57 |
| Fagperson — Må den ligne nok? | Accepted | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 4,14 |
| Arbejdsgiver — Skal Amina have ansvaret? | Afvist: missing_tradeoff | 5 | 4 | 5 | 4 | 2 | 4 | 5 | 4,14 |
| Medarbejder — Hvor skal dit arbejde høre hjemme? | Accepted | 3 | 3 | 5 | 4 | 4 | 4 | 3 | 3,71 |
| For alle — Skal jeres hjem gå først? | Accepted | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 3,71 |
| Borger — Skal Saras infektionsspor følge hende? | Accepted | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 3,86 |
| Beslutningstager — Hvem ejer dit arbejde? | Afvist: bad_location_fit | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3,86 |
| **Gennemsnit** | **7/10 accepted** | **3,9** | **3,4** | **4,4** | **3,6** | **3,4** | **4,0** | **3,9** | **3,80** |

### Setup B — simplified Luna

| Rolle / case | Status | FS | DS | HR | P | CQ | DV | W46 | Gns. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Barn — Det, sensoren ikke må vide | Afvist: bad_location_fit | 4 | 3 | 5 | 4 | 2 | 4 | 4 | 3,71 |
| Ung — Mormors hjem ved, når noget er galt | Accepted | 4 | 3 | 5 | 3 | 2 | 4 | 4 | 3,57 |
| Forælder — Dit barns læringsspor | Accepted | 4 | 3 | 5 | 4 | 2 | 4 | 4 | 3,71 |
| Lærer/pædagog — Når modellen kender barnet bedre end dig | Accepted | 5 | 4 | 5 | 4 | 3 | 5 | 5 | 4,43 |
| Fagperson — Den del, der ikke er godkendt | Accepted | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 4,14 |
| Arbejdsgiver — Den forudsigelse, du ikke må se | Accepted | 5 | 5 | 5 | 4 | 4 | 5 | 5 | 4,71 |
| Medarbejder — Når omsorg bliver målt på din stemme | Accepted | 5 | 3 | 5 | 3 | 2 | 4 | 5 | 3,86 |
| For alle — Når nettet går ned, hvem må kende dig? | Accepted | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 3,71 |
| Borger — Den kur, der følger dig hjem | Accepted | 4 | 3 | 5 | 3 | 2 | 4 | 4 | 3,57 |
| Beslutningstager — Når din agent siger ja på dine vegne | Accepted | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3,86 |
| **Gennemsnit** | **9/10 accepted** | **4,3** | **3,5** | **4,8** | **3,6** | **2,8** | **4,2** | **4,3** | **3,93** |

### Setup C — simplified Terra

| Rolle / case | Status | FS | DS | HR | P | CQ | DV | W46 | Gns. |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Barn — Den kølige sovesal og armbåndet | Accepted | 4 | 3 | 5 | 3 | 3 | 4 | 4 | 3,71 |
| Ung — Farmors tryghed kræver adgang til dit værelse | Accepted | 5 | 4 | 5 | 3 | 4 | 5 | 5 | 4,43 |
| Forælder — Skal din datter være registreret som omsorgsgiver? | Accepted | 3 | 4 | 5 | 4 | 4 | 4 | 3 | 3,86 |
| Lærer/pædagog — Skal Alma blive i klassen? | Accepted | 5 | 4 | 5 | 4 | 2 | 5 | 5 | 4,29 |
| Fagperson — Den printede del i Odenses drikkevand | Accepted | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 4,14 |
| Arbejdsgiver — Hvem må stå med ansvaret, når nettet lukker? | Accepted | 4 | 4 | 5 | 3 | 4 | 4 | 4 | 4,00 |
| Medarbejder — Din faglighed deles | Accepted | 3 | 4 | 5 | 4 | 4 | 4 | 3 | 3,86 |
| For alle — Nøglen til varme i næste nedlukning | Accepted | 4 | 4 | 5 | 4 | 4 | 5 | 4 | 4,29 |
| Borger — Den antibiotika, der kræver dit liv som data | Accepted | 5 | 5 | 5 | 4 | 4 | 5 | 5 | 4,71 |
| Beslutningstager — Indblik i arbejdernes agenter | Accepted | 5 | 4 | 4 | 4 | 5 | 5 | 5 | 4,57 |
| **Gennemsnit** | **10/10 accepted** | **4,2** | **4,0** | **4,9** | **3,7** | **3,8** | **4,5** | **4,2** | **4,19** |

## Hvad viste forskellen mellem Luna og Terra?

På samme simple prompt var Terra mærkbart bedre. Den største forskel var choice quality: 3,8 mod Lunas 2,8. Terra skrev oftere fire positioner, der faktisk kostede noget forskelligt. Terra skabte også flere scener med en navngiven relation og en samfundsmæssig konsekvens, der kunne diskuteres bagefter.

Forskellen var ikke absolut. C's lærer-case bruger “bed om en menneskelig modvurdering”, som er en klassisk workaround. C's barnescene gør armbåndet til adgangsbillet til kølerummet, hvilket er en konstrueret mekanik. Flere C-felter ramte schemaets præcise maksimum og blev afskåret midt i et ord. En stærkere model erstatter altså ikke redaktionel kvalitetssikring.

## Validatorfund

- A's `missing_tradeoff` er for aggressiv: et stærkt dilemma blev afvist, fordi to descriptions ikke indeholdt et bestemt forbindelsesord, selv om konsekvenserne viste prisen tydeligt.
- A's `audience_language` afviste en forståelig unge-case. Det ligner en sproglig heuristik med lav sikkerhed, ikke en teknisk invariant.
- `bad_location_fit` afviste B's barnescene på en folkeskole, fordi pressure-planens problemområder ikke inkluderede uddannelse. Scenen var naturlig for rollen og presset. Her er plan/taxonomy-koblingen for snæver; validatoren er teknisk korrekt i forhold til planen, men produktmæssigt for aggressiv.
- Den simple validator accepterede omvendt semantiske svagheder, som den skal: workarounds, konstruerede regler og halvfærdige max-length-strenge er nu synlige for offline eval i stedet for at blive camoufleret som runtime acceptance.

## Højst tre næste forbedringer — ikke implementeret

1. Løsn planens kobling mellem pressure og location taxonomy: lad modellen vælge blandt lokationer, der passer rollen og scenen, og udled problem area efterfølgende. B's barn-case bør ikke afvises alene, fordi en klimakonflikt foregår på en skole.
2. Giv schemaet luft over displaygrænserne og trim ved ordgrænser i kode. Terra ramte flere hard caps præcist og leverede afskårne sætninger.
3. Lav én kort choice-instruktion mere præcis: hvert valg skal acceptere samme grundvilkår; “ny vurdering”, “lad en anden vælge” og adgangskrav opfundet til scenen er ikke positioner. Hold dette i prompt/offline eval, ikke som runtime-regex.

## Production-anbefaling

Brug den simplified arkitektur og Terra som default for creative authoring; behold Luna til value-scoring og andre utility-opgaver. C er dyrere og langsommere, men gav mere end dobbelt så mange redaktionelt gode dilemmaer som A eller B. Det er den bedste match til målet “billigste gode dilemma”, ikke “billigste generation”.

Inden bred production bør de tre fund ovenfor vurderes. I overensstemmelse med eval-reglen er ingen af dem implementeret efter kørslen.
