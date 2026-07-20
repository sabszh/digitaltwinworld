import { locationTypesByProblemArea, problemAreas } from "@/data/taxonomies";
import { buildAudiencePromptSection } from "@/lib/prompts/audiencePromptProfiles";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { FutureTechnology, LocationType, ValueProfile } from "@/types/world2046";

export const valueKeys = [
  "trust",
  "freedom",
  "equality",
  "efficiency",
  "humanContact",
  "safety",
  "innovation",
  "sustainability",
  "localControl",
  "transparency",
] as const satisfies Array<keyof ValueProfile>;

type BuildDilemmaPromptOptions = {
  technologies: FutureTechnology[];
  locationTypes: LocationType[];
};

export function buildDilemmaPrompt(input: DilemmaGenerationRequest, options: BuildDilemmaPromptOptions) {
  const previousSummary =
    input.previousDilemmas.map((item) => `${item.city}, ${item.country}: ${item.problemArea} / ${item.technology}`).join("\n") ||
    "Ingen endnu.";
  const usedCountries = [...new Set(input.previousDilemmas.map((item) => item.country))];
  const geographyRule =
    input.previousDilemmas.length === 0
      ? "Dette er runde 1: country SKAL være Danmark."
      : `Dette er runde ${input.previousDilemmas.length + 1}: country MÅ IKKE være Danmark og MÅ IKKE være et af disse lande: ${usedCountries.join(", ")}. Vælg et større, plausibelt sted i en anden verdensregion.`;
  const personaContext = input.persona
    ? `Personaen brugeren rejser som: "${input.persona.title}" - ${input.persona.text}`
    : `Brugerrolle: ${input.role}`;

  return `Du designer World 2046, en dansk interaktiv fremtidssimulation.

Opgave:
1. Vælg et realistisk, konkret sted på jorden, der matcher ét problemområde og én lokationstype.
2. Stedet må gerne være globalt og varieret, men undgå lande/problemområder brugt lige før.
3. Generér et dilemma, der specifikt udspringer af stedet, byen og lokationstypen, og som taler direkte til personaen nedenfor.
4. Generér også en konkret konsekvens for hver svarmulighed.
5. Generér en kort sanselig landingsscene: vejr/lyd/lugt og én konkret situation i gang, ingen beslutning endnu.
6. Skriv på dansk, kort og præcist.

${personaContext}
${buildAudiencePromptSection(input.role)}

Foretrukken severity: ${input.preferredSeverity}
Geografiregel: ${geographyRule}
Tidligere dilemmaer:
${previousSummary}

Tilladte problemområder: ${problemAreas.join(", ")}
Tilladte lokationstyper pr. område: ${JSON.stringify(locationTypesByProblemArea)}
Tilladte lokationstyper samlet: ${options.locationTypes.join(", ")}
Tilladte teknologier: ${options.technologies.join(", ")}
Værdinøgler til valueImpacts: ${valueKeys.join(", ")}

Krav til indhold:
- Vælg ét reelt eller meget plausibelt offentligt/urbant sted med navn, by, land og omtrentlige koordinater.
- Overhold geografireglen præcist. Hvis den siger uden for Danmark, må country aldrig være Danmark.
- Dilemmaet skal være realistisk i 2046, konkret og lokalt forankret.
- Dilemmaet skal tydeligt passe til målgruppeprofilen ovenfor.
- Undgå katastrofer, vold, traumer og horror.
- Lav præcis 4 svarmuligheder.
- Svarmulighederne skal være balancerede; ingen må fremstå som åbenlyst korrekt.
- valueImpacts må kun bruge værdier fra -2 til 2.

Krav til tekstlængder:
- title må højst være 54 tegn og skal være en spændingsfuld overskrift.
- scenePrompt skal være 2 korte, konkrete sætninger på højst 360 tegn samlet.
- question må højst være 130 tegn og SKAL starte med "Hvordan kan jeg" eller "Hvordan vil jeg".
- landingScene må højst være 320 tegn: 2.-persons sanselig ankomst, én konkret situation i gang, ingen beslutning.
- landingDetail må højst være 90 tegn: én ren vejr- eller lyddetalje.
- Hver choice.label må højst være 46 tegn.
- Hver choice.description må højst være 125 tegn og skal forklare valget i hverdagssprog.
- Hver choice.consequence må højst være 190 tegn.

Krav til variation:
- Undgå at title, scenePrompt og question siger det samme med andre ord.
- scenePrompt skal beskrive situationen og friktionen, ikke gentage titlen.
- question skal spørge til den konkrete beslutning, ikke gentage teknologiens navn hvis den allerede står i title.
- choice.consequence skal nævne den lokale effekt af netop dét valg: hvem får mere/mindre ansvar, hvad ændres i hverdagen, og hvilken ny risiko opstår.
- choice.consequence må ikke starte med "Du valgte", og må ikke være generisk værditekst.

Returnér kun JSON, intet andet.`;
}
