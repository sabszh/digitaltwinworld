# World 2046

Interaktiv webprototype af en varm, futuristisk 3D worldbuilding-oplevelse. Brugeren vælger rolle, rejser via en roterende globus til fem steder i verden og løser korte fremtidsdilemmaer om AI, robotter, data, klima, sundhed, arbejde, mobilitet og digital tillid.

## Kør lokalt

```bash
npm install
npm run dev
```

Åbn `http://localhost:3001`.

## Samtykke og lokale sessionsdata

Når en besøgende aktivt giver samtykke efter rapporten, gemmes rejsen som standard i `.data/sessions/`. Hver deltager får sin egen fil: `world2046-<session-id>.json`. Sæt `SESSION_DATA_PATH` i `.env.local`, hvis udstillingscomputeren skal bruge en anden mappe. Afviste sessions skrives ikke til disk.

Hver fil indeholder en komplet, samtykket rejse med samtykke- og tidsmarkering, passagerens valgte rolle/alder/svar, værdiprofilen og fem dilemma-poster. En dilemma-post gemmer både det valgte svar og et deltager-vendt snapshot af det, der blev vist: titel, scene, hvad der stod på spil, ankomsttekst, sted/koordinater og alle fire svarmuligheder. De skjulte værdiscores for de fire muligheder gemmes ikke i dette snapshot.

## Kort

Prototypen bruger Mapbox til globussen. Læg en public access token i `.env.local`:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=din_mapbox_token
```

## Termoprinter

World 2046 tegner det færdige værdikort som et 384 px sort/hvidt billede, passende til 57/58 mm-papir på 384-dot-printere som 5801/5802. Opret først en lokal macOS CUPS-kø med producentens driver og sæt dens kønavn i `.env.local`:

```bash
THERMAL_PRINTER_NAME=GEZHI_micro_printer
```

Appen sender billedet til CUPS med 58 mm-mediet. Det lader den installerede driver håndtere Bluetooth-forbindelsen og gør dansk/engelsk, Gejst-logoet og typografien ensartet.

## Hvad prototypen gør

- Intro med 3D-globus og dansk tone of voice.
- Rollevalg: barn, ung, forælder, lærer/pædagog, fagperson eller for alle.
- Fem dilemmaer pr. session, med første scenarie fast i Danmark.
- Valg og egne løsninger gemmes i lokal Zustand session state.
- Slutrapport opsummerer værdiprofil, AI-holdning, styringsstil og løste dilemmaer.
- Dev/debug-panel viser session JSON, valgte områder, lande og aggregerede værdier.

## Generering

Dilemmaer og slutrapport genereres og valideres på serveren. Hvis genereringen fejler, viser oplevelsen en fejl og lader brugeren prøve igen; den erstatter ikke indholdet med lokale skabeloner.
