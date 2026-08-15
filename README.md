# World 2046

Interaktiv webprototype af en varm, futuristisk 3D worldbuilding-oplevelse. Brugeren vælger rolle, rejser via en roterende globus til fem steder i verden og løser korte fremtidsdilemmaer om AI, robotter, data, klima, sundhed, arbejde, mobilitet og digital tillid.

## Kør lokalt

```bash
npm install
npm run dev
```

Åbn `http://localhost:3001`.

## Samtykke og lokale sessionsdata

Når en besøgende aktivt giver samtykke efter rapporten, gemmes rejsen som standard i `.data/consented-sessions.jsonl`. Sæt `SESSION_DATA_PATH` i `.env.local`, hvis udstillingscomputeren skal bruge en anden permanent placering. Afviste sessions skrives ikke til disk.

## Satellitkort

Prototypen bruger satellit-closeups med denne fallback-rækkefølge:

1. Mapbox Satellite
2. Google Satellite
3. ArcGIS World Imagery

Hvis du vil bruge Mapbox Satellite, så opret en Mapbox public access token og læg den i `.env.local`:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=din_mapbox_token
```

Hvis du vil bruge Google Satellite i stedet, så opret en Google Maps Platform API key med Maps Static API aktiveret:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=din_google_maps_key
```

Når Mapbox-token findes, bruger `SatelliteCloseup` automatisk Mapbox Static Images API med `mapbox/satellite-v9`. Uden Mapbox-token prøver den Google Static API. Uden begge falder den tilbage til ArcGIS tiles.

## Hvad prototypen gør

- Intro med 3D-globus og dansk tone of voice.
- Rollevalg: ung, forælder, lærer/pædagog, arbejdsgiver, medarbejder, borger eller beslutningstager.
- Fem dilemmaer pr. session, med første scenarie fast i Danmark.
- Valg og egne løsninger gemmes i lokal Zustand session state.
- Slutrapport opsummerer værdiprofil, AI-holdning, styringsstil og løste dilemmaer.
- Dev/debug-panel viser session JSON, valgte områder, lande og aggregerede værdier.

## Randomisering

Randomiseringen ligger i `src/lib/randomizer.ts` og bruger lokale templates fra `src/data/dilemmaTemplates.ts` samt lokationer fra `src/data/locations.ts`.

Regler i første version:

- Første dilemma er i Danmark og bruger et let uddannelsesscenarie.
- Efter første dilemma vælges globalt.
- Samme problemområde gentages ikke direkte.
- Samme land gentages ikke direkte.
- Kun `low` og `medium` severity bruges.
- Templates er knyttet til gyldige lokationstyper, problemområder og teknologier.

Antallet af dilemmaer styres via `SESSION_DILEMMA_COUNT` i `src/data/taxonomies.ts`.

## Fremtidig AI-generering

`src/lib/aiDilemmaGenerator.ts` indeholder input/output-typer, guardrails og en mock-funktion. Den returnerer pt. lokale templates, men kan senere erstattes af en API-route, der kalder OpenAI og validerer output mod de samme regler:

- egnet til målgruppen
- ikke voldeligt, traumatiserende eller katastrofisk
- realistisk muligt i 2046
- tilknyttet ét af de syv problemområder
- 3-4 balancerede svarmuligheder
- indirekte værdimåling uden ét rigtigt svar
