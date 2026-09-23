# Dilemma content follow-up

## Formål

Denne opfølgning undersøger effekten af at kuratere developments og golden examples efter den første 20-case-eval. Den ændrer ikke production-prompten, tilføjer ikke semantiske runtime-validatorer og bruger ingen retries eller regeneration.

## Kørsel

- Model: `gpt-5.6-terra`
- Første opfølgning: 10 præcist valgte generationer, ét kald per case
- Målrettet verifikation: 4 generationer, ét kald per case
- Alle rå outputs er bevaret uredigeret i `dilemma-content-followup-raw.json` og `dilemma-content-verification-raw.json`
- Ingen af kørslerne blev brugt som automatisk acceptance gate

## Redaktionel vurdering af 10-case-opfølgningen

Klart stærke cases:

- Lærer/pædagog + offentlige kølerum: naturlig konflikt om omsorg, fællesskab og privatliv.
- Medarbejder + personlig data-agent: tydelig personlig pris og reel handlekraft.
- For alle + personlige politiske simulationer: stærkt 2046-spørgsmål og høj diskussionsværdi.
- Beslutningstager + AI-administration: menneskeligt ansvar blev bevaret på institutionsniveau.

Tilbageværende problemer:

- Barn + AI-simulation af livsvalg gav reelt kun to positioner forklædt som fire.
- Chaufførløs transport indførte en kunstig hastesituation.
- Syntetiske skuespillere gled over i jobknaphed og et åbenlyst uetisk valg.
- Enkelte outputs genindførte kunstig eksklusivitet eller snævre tidsvinduer.

## Målrettet verifikation efter kuratering

| Rolle | Development | Resultat |
|---|---|---|
| Barn | Digitale versioner af afdøde | Produktionsværdig. Nyt scenarie, forståeligt børneperspektiv og fire reelle måder at håndtere samme relationelle konflikt på. |
| Barn | AI simulerer livsvalg | Ikke produktionsværdig. Modellen skabte fortsat to aktiviteter med fire begrundelser/workarounds. Development er derfor fjernet fra børne-seeds. |
| Ung | Langvarige sociale robotrelationer | Produktionsværdig. Naturlig konflikt om kontinuitet, nye relationer og identitet uden en kunstig “kun én ledsager”-regel. |
| For alle | Hjem reagerer på elnettet | Produktionsværdig. Klima, søvn, gæster og familieforpligtelser skaber en naturlig pris; tidsvinduet følger energisystemet frem for en opfundet deadline. |

## Konklusion

Kuratering af inputbiblioteket og example-selection forbedrede de målrettede problemområder uden at gøre production-prompten større. Tre af fire afsluttende verifikationscases var redaktionelt brugbare. Den fjerde viste, at `ai-simulates-life-choices` ikke er et stabilt børne-development og er nu udelukket for rollen Barn, mens børn fortsat kan møde AI-forudsigelser gennem mere konkrete developments.

Resultatet er lovende, men dokumenterer ikke endnu ensartet høj kvalitet på tværs af alle roller og developments. Den oprindelige 20-case-eval var 7/20 produktionsværdig; denne opfølgning bør derfor ses som konkret forbedring af kendte fejlmønstre, ikke som bevis for at generatoren er færdig.
