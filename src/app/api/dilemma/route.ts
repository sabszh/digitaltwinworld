import { dilemmaTemplates } from "@/data/dilemmaTemplates";
import { locationTypesByProblemArea, problemAreas, userRoles } from "@/data/taxonomies";
import { generateDilemma } from "@/lib/randomizer";
import type { Choice, CompletedDilemma, FutureTechnology, GeneratedDilemma, LocationType, Persona, ProblemArea, UserRole, ValueProfile } from "@/types/world2046";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DilemmaRequest = {
  role: UserRole;
  persona?: Persona;
  previousDilemmas: CompletedDilemma[];
  preferredSeverity: "low" | "medium";
};

type AiDilemma = Omit<GeneratedDilemma, "role">;

const valueKeys = [
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

const technologies = [...new Set(dilemmaTemplates.flatMap((template) => template.technologies))] as FutureTechnology[];
const locationTypes = [...new Set(Object.values(locationTypesByProblemArea).flat())] as LocationType[];

const fallback = (input: DilemmaRequest, reason: string) =>
  NextResponse.json({
    source: "fallback",
    reason,
    dilemma: generateDilemma(input),
  });

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

function isChoice(value: unknown): value is Choice {
  if (!isRecord(value) || !isString(value.id) || !isString(value.label) || !isString(value.consequence) || !isRecord(value.valueImpacts)) return false;
  return Object.entries(value.valueImpacts).every(([key, impact]) => valueKeys.includes(key as keyof ValueProfile) && isNumber(impact) && impact >= -2 && impact <= 2);
}

function validateAiDilemma(value: unknown, input: DilemmaRequest): GeneratedDilemma | undefined {
  if (!isRecord(value)) return undefined;
  if (!isString(value.id) || !isString(value.title) || !isString(value.scenePrompt) || !isString(value.question)) return undefined;
  if (!problemAreas.includes(value.problemArea as ProblemArea)) return undefined;
  if (!locationTypes.includes(value.locationType as LocationType)) return undefined;
  if (!technologies.includes(value.technology as FutureTechnology)) return undefined;
  if (!isString(value.region) || !isString(value.country) || !isString(value.city)) return undefined;
  const previousCountries = new Set(input.previousDilemmas.map((item) => item.country));
  if (input.previousDilemmas.length === 0 && value.country !== "Danmark") return undefined;
  if (input.previousDilemmas.length > 0 && (value.country === "Danmark" || previousCountries.has(value.country))) return undefined;
  if (!isRecord(value.marker) || !isNumber(value.marker.lat) || !isNumber(value.marker.lng)) return undefined;
  if (Math.abs(value.marker.lat) > 90 || Math.abs(value.marker.lng) > 180) return undefined;
  if (!Array.isArray(value.validLocationTypes) || !Array.isArray(value.targetGroups) || !Array.isArray(value.technologies) || !Array.isArray(value.tags)) return undefined;
  if (!Array.isArray(value.choices) || value.choices.length !== 4 || !value.choices.every(isChoice)) return undefined;

  const exactPlace = isRecord(value.exactPlace)
    ? {
        id: isString(value.exactPlace.id) ? value.exactPlace.id : value.id,
        name: isString(value.exactPlace.name) ? value.exactPlace.name : value.city,
        address: isString(value.exactPlace.address) ? value.exactPlace.address : undefined,
        region: value.region as string,
        country: value.country as string,
        city: value.city as string,
        lat: value.marker.lat,
        lng: value.marker.lng,
        locationType: value.locationType as LocationType,
        problemAreas: [value.problemArea as ProblemArea],
      }
    : undefined;

  return {
    id: value.id,
    problemArea: value.problemArea as ProblemArea,
    validLocationTypes: (value.validLocationTypes as unknown[]).filter((item): item is LocationType => locationTypes.includes(item as LocationType)),
    targetGroups: value.targetGroups as GeneratedDilemma["targetGroups"],
    technologies: (value.technologies as unknown[]).filter((item): item is FutureTechnology => technologies.includes(item as FutureTechnology)),
    severity: value.severity === "medium" ? "medium" : "low",
    title: value.title,
    scenePrompt: value.scenePrompt,
    question: value.question,
    choices: value.choices,
    tags: value.tags.filter(isString),
    country: value.country,
    city: value.city,
    region: value.region,
    locationType: value.locationType as LocationType,
    technology: value.technology as FutureTechnology,
    role: input.role,
    marker: { lat: value.marker.lat, lng: value.marker.lng },
    exactPlace,
    landingScene: isString(value.landingScene) && value.landingScene.length <= 260 ? value.landingScene : undefined,
    landingDetail: isString(value.landingDetail) && value.landingDetail.length <= 90 ? value.landingDetail : undefined,
  };
}

function buildPrompt(input: DilemmaRequest) {
  const previousSummary = input.previousDilemmas.map((item) => `${item.city}, ${item.country}: ${item.problemArea} / ${item.technology}`).join("\n") || "Ingen endnu.";
  const usedCountries = [...new Set(input.previousDilemmas.map((item) => item.country))];
  const geographyRule =
    input.previousDilemmas.length === 0
      ? "Dette er runde 1: country SKAL være Danmark."
      : `Dette er runde ${input.previousDilemmas.length + 1}: country MÅ IKKE være Danmark og MÅ IKKE være et af disse lande: ${usedCountries.join(", ")}. Vælg et større, plausibelt sted i en anden verdensregion.`;
  const personaContext = input.persona
    ? `Personaen brugeren rejser som: "${input.persona.title}" — ${input.persona.text}`
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
Foretrukken severity: ${input.preferredSeverity}
Geografiregel: ${geographyRule}
Tidligere dilemmaer:
${previousSummary}

Tilladte problemområder: ${problemAreas.join(", ")}
Tilladte lokationstyper pr. område: ${JSON.stringify(locationTypesByProblemArea)}
Tilladte teknologier: ${technologies.join(", ")}
Værdinøgler til valueImpacts: ${valueKeys.join(", ")}

Krav:
- Vælg ét reelt eller meget plausibelt offentligt/urbant sted med navn, by, land og omtrentlige koordinater.
- Overhold geografireglen præcist. Hvis den siger uden for Danmark, må country aldrig være Danmark.
- scenePrompt må højst være 170 tegn og må kun indeholde én ide.
- question må højst være 130 tegn og SKAL starte med "Hvordan kan jeg" eller "Hvordan vil jeg", talt fra personaens perspektiv — ikke et binært ja/nej-spørgsmål.
- landingScene må højst være 260 tegn: 2.-persons sanselig ankomst (sted, år, vejr/lyd), én konkret situation i gang, ingen beslutning.
- landingDetail må højst være 90 tegn: én ren vejr- eller lyddetalje.
- title må højst være 54 tegn.
- Hver choice.label må højst være 46 tegn.
- Hver choice.description må højst være 86 tegn.
- Hver choice.consequence må højst være 190 tegn.
- Undgå lange forklaringer, institutionshistorik og gentagelser af stednavn.
- Undgå at title, scenePrompt og question siger det samme med andre ord.
- title skal være en spændingsfuld overskrift, ikke bare "{teknologi} i {lokation}".
- scenePrompt skal beskrive situationen og friktionen, ikke gentage titlen.
- question skal spørge til den konkrete beslutning, ikke gentage teknologiens navn hvis den allerede står i title.
- choice.consequence skal nævne den lokale effekt af netop dét valg: hvem får mere/mindre ansvar, hvad ændres i hverdagen, og hvilken ny risiko opstår.
- choice.consequence må ikke starte med "Du valgte", og må ikke være generisk værditekst.
- Undgå katastrofer, vold, traumer og horror.
- Dilemmaet skal være realistisk i 2046, konkret og lokalt forankret.
- Lav præcis 4 svarmuligheder.
- Svarmulighederne skal være balancerede; ingen må fremstå som åbenlyst korrekt.
- valueImpacts må kun bruge værdier fra -2 til 2.
- Returnér kun JSON, intet andet.`;
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    problemArea: { type: "string", enum: problemAreas },
    validLocationTypes: { type: "array", items: { type: "string", enum: locationTypes }, minItems: 1 },
    targetGroups: { type: "array", items: { type: "string" }, minItems: 1 },
    technologies: { type: "array", items: { type: "string", enum: technologies }, minItems: 1 },
    severity: { type: "string", enum: ["low", "medium"] },
    title: { type: "string", maxLength: 54 },
    scenePrompt: { type: "string", maxLength: 170 },
    question: { type: "string", maxLength: 130 },
    choices: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", enum: ["a", "b", "c", "d"] },
          label: { type: "string", maxLength: 46 },
          description: { type: "string", maxLength: 86 },
          consequence: { type: "string", maxLength: 190 },
          valueImpacts: {
            type: "object",
            additionalProperties: false,
            properties: Object.fromEntries(valueKeys.map((key) => [key, { type: "number", minimum: -2, maximum: 2 }])),
            required: valueKeys,
          },
        },
        required: ["id", "label", "description", "consequence", "valueImpacts"],
      },
    },
    tags: { type: "array", items: { type: "string" } },
    country: { type: "string" },
    city: { type: "string" },
    region: { type: "string" },
    locationType: { type: "string", enum: locationTypes },
    technology: { type: "string", enum: technologies },
    marker: {
      type: "object",
      additionalProperties: false,
      properties: {
        lat: { type: "number", minimum: -90, maximum: 90 },
        lng: { type: "number", minimum: -180, maximum: 180 },
      },
      required: ["lat", "lng"],
    },
    exactPlace: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        address: { type: "string" },
      },
      required: ["id", "name", "address"],
    },
    landingScene: { type: "string", maxLength: 260 },
    landingDetail: { type: "string", maxLength: 90 },
  },
  required: ["id", "problemArea", "validLocationTypes", "targetGroups", "technologies", "severity", "title", "scenePrompt", "question", "choices", "tags", "country", "city", "region", "locationType", "technology", "marker", "exactPlace", "landingScene", "landingDetail"],
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<DilemmaRequest>;
  if (!body.role || !userRoles.includes(body.role) || !Array.isArray(body.previousDilemmas)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const input: DilemmaRequest = {
    role: body.role,
    persona: body.persona,
    previousDilemmas: body.previousDilemmas,
    preferredSeverity: body.preferredSeverity === "medium" ? "medium" : "low",
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback(input, "missing_openai_api_key");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        temperature: 0.95,
        messages: [
          { role: "system", content: "Du returnerer kun valid JSON, der matcher schemaet. Ingen markdown." },
          { role: "user", content: buildPrompt(input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "world2046_dilemma",
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });

    if (!response.ok) return fallback(input, `openai_${response.status}`);

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!isString(content)) return fallback(input, "empty_openai_response");

    const parsed = JSON.parse(content) as AiDilemma;
    const dilemma = validateAiDilemma(parsed, input);
    if (!dilemma) return fallback(input, "invalid_ai_dilemma");

    return NextResponse.json({ source: "openai", dilemma });
  } catch {
    return fallback(input, "openai_exception");
  }
}
