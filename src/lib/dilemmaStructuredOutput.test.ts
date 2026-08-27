import { describe, expect, it } from "vitest";
import { validateAiDilemmaDetailed } from "@/lib/dilemmaStructuredOutput";
import type { DilemmaGenerationRequest } from "@/lib/dilemmaGenerationTypes";
import type { ValueProfile } from "@/types/world2046";

/** isChoice requires every value key to be present, so partial impacts are
 *  filled out here rather than in each fixture. */
function impacts(partial: Partial<ValueProfile>): ValueProfile {
  const zeroes = {
    trust: 0, freedom: 0, equality: 0, efficiency: 0, humanContact: 0,
    safety: 0, innovation: 0, sustainability: 0, localControl: 0, transparency: 0,
  };
  return { ...zeroes, ...partial };
}

const request: DilemmaGenerationRequest = {
  role: "Fagperson",
  language: "da",
  preferredSeverity: "medium",
  previousDilemmas: [],
};

/** A generated dilemma that passes every gate, so each test can break exactly
 *  one thing and know which rule fired. */
function baseline(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-1",
    problemArea: "Uddannelse og læring",
    validLocationTypes: ["folkeskole"],
    targetGroups: ["unge"],
    technologies: ["personlig læringsassistent"],
    tags: ["skole"],
    severity: "medium",
    title: "Computeren tvivler på Sofie",
    scenePrompt: "Skolens computer forudsiger, at Sofie vil få svært ved næste års undervisning. Tidlig hjælp virker ofte, men kan også forme hendes muligheder, før hun selv har prøvet.",
    landingScene: "Du åbner næste års undervisningsplan. Ved Sofies navn anbefaler computeren et lettere fagligt spor.",
    stake: "Sofie kan få hjælp tidligt, men din beslutning kan ændre, hvad hun og andre tror, hun kan blive til.",
    question: "Hvordan lader du vurderingen påvirke Sofies opgave?",
    locationType: "folkeskole",
    technology: "personlig læringsassistent",
    country: "Danmark",
    region: "Norden",
    city: "Herning",
    marker: { lat: 56.13, lng: 8.97 },
    coreTension: { want: "at Sofie får hjælp før hun mister modet", butAlsoWant: "at Sofie får lov at vise hvad hun kan", whyCannotHaveBoth: "En lettere opgave beskytter hende mod nederlag, men fjerner samtidig den udfordring, hvor hun kunne modbevise vurderingen." },
    logic: {
      rule: "Skolens computer forudsiger elevers behov og anbefaler sværhedsgraden på deres kommende opgaver.",
      benefit: "Elever kan få støtte, før gentagne nederlag får dem til at opgive et fag.",
      trigger: "Computeren anbefaler, at Sofie får en lettere opgave, selv om hun endnu ikke har prøvet den svære.",
      decision: "Læreren skal beslutte, hvordan forudsigelsen skal påvirke den opgave, Sofie møder.",
      choiceConstraint: "At skærme Sofie mod den svære opgave fjerner netop den mulighed, hvor hun kunne vise, at forudsigelsen tager fejl.",
    },
    futurePressureId: "automation",
    normalized2046: "Skolens computer forudsiger elevers kommende vanskeligheder og former deres opgaver, før problemerne viser sig.",
    choices: [
      { id: "a", label: "Følg anbefalingen", description: "Du giver Sofie en lettere opgave, men tager chancen for at vise, at vurderingen tager fejl.", consequence: "Sofie får en roligere start, men møder lavere forventninger, før hun selv har prøvet.", valueImpacts: impacts({ safety: 2, efficiency: 1, freedom: -1 }) },
      { id: "b", label: "Behold den svære opgave", description: "Du lader Sofie møde samme udfordring som de andre, men risikerer at overse en hjælp, der kunne virke.", consequence: "Sofie får mulighed for at overraske, men kan også opleve det nederlag, computeren advarede om.", valueImpacts: impacts({ freedom: 2, equality: 1, safety: -1 }) },
      { id: "c", label: "Fortæl om vurderingen", description: "Du viser Sofie forudsigelsen og beholder opgaven, men hun skal arbejde med computerens tvivl i hovedet.", consequence: "Sofie ved, hvad der påvirker dig, men vurderingen kan ændre hendes tro på sig selv.", valueImpacts: impacts({ transparency: 2, trust: 1, safety: -1 }) },
      { id: "d", label: "Skjul vurderingen", description: "Du beholder opgaven og holder forudsigelsen for dig selv, men skjuler noget, der former din støtte.", consequence: "Sofie møder opgaven uden mærkatet, men kan ikke forstå, hvorfor du behandler hende anderledes.", valueImpacts: impacts({ humanContact: 1, safety: 1, transparency: -2 }) },
    ],
    ...overrides,
  };
}

describe("validateAiDilemmaDetailed", () => {
  it("accepts a dilemma where the machine is in the options", () => {
    expect(validateAiDilemmaDetailed(baseline(), request)).toHaveProperty("dilemma");
  });

  it("rejects a shrug in place of a 2046 reality", () => {
    for (const normalized2046 of ["AI spiller en større rolle i skolen", "Teknologien", "Systemerne er blevet mere avancerede end før"]) {
      expect(validateAiDilemmaDetailed(baseline({ normalized2046 }), request)).toEqual({ reason: "generic_future" });
    }
  });

  it("rejects a future pressure that is not in the future space", () => {
    expect(validateAiDilemmaDetailed(baseline({ futurePressureId: "vandmangel-2046" }), request)).toEqual({
      reason: "bad_future_pressure",
    });
  });

  it("rejects a location type that does not belong to the problem area", () => {
    expect(validateAiDilemmaDetailed(baseline({ locationType: "hospital" }), request)).toEqual({ reason: "bad_location_fit" });
  });

  it("keeps scoring attached to each concrete action when the order is shuffled", () => {
    const result = validateAiDilemmaDetailed(baseline(), request);
    expect(result).toHaveProperty("dilemma");
    if (!("dilemma" in result)) return;
    // Order is randomised for the player; the pairing of position, label and
    // impacts must survive it, since that pairing is the whole score.
    for (const choice of result.dilemma.choices) {
      const original = baseline().choices.find((item) => item.id === choice.id);
      expect(choice.valueImpacts).toEqual(original?.valueImpacts);
    }
  });

  it("rejects a problem area the journey has already visited", () => {
    const previous = [{ ...baseline(), selectedChoiceId: "a", selectedChoiceLabel: "x" }].map((item) => ({
      dilemmaId: item.id,
      problemArea: "Uddannelse og læring" as const,
      region: item.region,
      country: item.country,
      city: item.city,
      locationType: item.locationType as "folkeskole",
      technology: item.technology as "personlig læringsassistent",
      question: item.question,
      presented: {
        title: item.title,
        scene: item.scenePrompt,
        choices: item.choices.map(({ id, label, description }) => ({ id, label, description })),
      },
      selectedChoiceId: "a",
      selectedChoiceLabel: "x",
      valueImpacts: impacts({}),
    }));
    expect(validateAiDilemmaDetailed(baseline({ country: "Kenya", region: "Afrika" }), { ...request, previousDilemmas: previous })).toEqual({
      reason: "problem_area_reused",
    });
  });

  it("rejects a title that names both sides of the tension", () => {
    for (const title of ["Valget mellem tryghed og personlig frihed", "Balancen mellem tryghed og privatliv"]) {
      expect(validateAiDilemmaDetailed(baseline({ title }), request)).toEqual({ reason: "title_names_tension" });
    }
  });

  it("rejects a question that fixes one side of the outcome", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ question: "Hvad gør du uden at læreren ændrer køen?" }),
        request,
      ),
    ).toEqual({ reason: "biased_question" });
  });

  it("rejects a choice set without a reason the actions compete", () => {
    const dilemma = baseline();
    dilemma.logic.choiceConstraint = "";
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "incoherent_logic:incomplete" });
  });

  it.each([
    [
      "reserved support slot",
      { scenePrompt: "Sofie har fået en særlig plads på støtteholdet, men pladsen bortfalder, hvis hun ikke siger ja nu." },
    ],
    [
      "arbitrary countdown",
      { logic: { ...baseline().logic, choiceConstraint: "Du skal vælge inden 10 minutter, før tiden løber ud." } },
    ],
    [
      "invented single slot",
      { coreTension: { ...baseline().coreTension, whyCannotHaveBoth: "Der er kun én plads, og den går ellers til en anden." } },
    ],
    [
      "game currency",
      { stake: "Du har kun 3 point til at vælge mellem hjælp og den svære opgave." },
    ],
  ])("rejects the artificial conflict mechanic %s", (_name, overrides) => {
    expect(validateAiDilemmaDetailed(baseline(overrides), request)).toEqual({ reason: "artificial_conflict" });
  });

  it("allows urgency caused by the real physical situation", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({
          problemArea: "Klima, energi og resiliens",
          validLocationTypes: ["kystby"],
          locationType: "kystby",
          title: "Vandet når huset",
          scenePrompt: "Havet stiger allerede ind over vejen. Familien kan redde minder fra huset eller hjælpe naboen ud, men ikke være begge steder samtidig.",
          landingScene: "Vandet løber ind i stuen. Din nabo kalder fra huset ved siden af.",
          stake: "Familiens billeder ødelægges i vandet, mens naboen har brug for din hjælp til at komme ud.",
          question: "Hvor går du hen?",
          coreTension: {
            want: "at redde familiens uerstattelige minder",
            butAlsoWant: "at hjælpe naboen sikkert ud",
            whyCannotHaveBoth: "Vandet stiger nu, og husene ligger i hver sin retning.",
          },
          logic: {
            rule: "Kystområdet lever med oversvømmelser, som beskyttelsen ikke længere kan holde helt ude.",
            benefit: "Byen bruger sin beskyttelse dér, hvor den redder flest hjem og mennesker.",
            trigger: "Vandet når familiens hus, samtidig med at naboen kalder efter hjælp.",
            decision: "Spilleren skal vælge, hvilket hus de går mod.",
            choiceConstraint: "Vandet stiger nu, og de to huse ligger i hver sin retning.",
          },
          normalized2046: "Kystområdet lever med jævnlige oversvømmelser, fordi byen ikke længere kan beskytte alle hjem helt.",
        }),
        request,
      ),
    ).toHaveProperty("dilemma");
  });

  it("rejects a collapsed human conflict", () => {
    expect(validateAiDilemmaDetailed(baseline({ coreTension: { want: "at Sofie får hjælp", butAlsoWant: "at Sofie får hjælp", whyCannotHaveBoth: "Tiden er knap." } }), request)).toEqual({
      reason: "unusable_choice_set:collapsed_human_conflict",
    });
  });

  it("rejects a choice with no value impact", () => {
    const dilemma = baseline();
    dilemma.choices[0].valueImpacts = impacts({});
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "bad_choices:relevant_values" });
  });

  it("rejects an option that presents a gain without a visible price", () => {
    const dilemma = baseline();
    dilemma.choices[0].description = "Du ringer Sofie op, så hun kan få hjælp med det samme.";
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "bad_choices:missing_tradeoff" });
  });

  it.each([
    ["Vis mere skolearbejde", "Du viser flere opgaver, men computeren lærer mere om dit privatliv."],
    ["Byg huset om", "Du bygger huset om, men bruger hele familiens opsparing på forsøget."],
    ["Lad tjenesten kende dig", "Du skjuler navnet offentligt, men tjenesten gemmer din identitet."],
    ["Spørg læreren", "Du beder læreren vælge for dig, men opgiver din egen beslutning."],
  ])("rejects the choice workaround %s", (label, description) => {
    const dilemma = baseline();
    dilemma.choices[0] = { ...dilemma.choices[0], label, description };
    expect(validateAiDilemmaDetailed(dilemma, request)).toEqual({ reason: "unusable_choice_set:workaround" });
  });

  it("still allows a title that names two people", () => {
    expect(validateAiDilemmaDetailed(baseline({ title: "Mødet mellem Sofie og hendes lærer" }), request)).toHaveProperty("dilemma");
  });

  it("allows a question title when the dilemma itself is coherent", () => {
    expect(validateAiDilemmaDetailed(baseline({ title: "Hvem hjælper Sofie i dag?" }), request)).toHaveProperty("dilemma");
  });

  it("checks the visible stake text for child language", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ stake: "Reservedelen kan kun bruges ét sted, så mælken eller isen må vente." }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "audience_language" });
  });

  it("rejects false civic authority for a child", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ landingScene: "Du sidder i Aalborgs ungebyråd og skal sætte dit kryds om en ny plan." }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "implausible_role" });
  });

  it("rejects medical authority for a child", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ scenePrompt: "På platformen skal du dele en test, før du må give andre medicinråd." }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "implausible_role" });
  });

  it("rejects a child question that takes too much working memory", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({ question: "Hvad vælger du at gøre med computeren, mens resten af klassen venter på jer?" }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "child_text_too_complex" });
  });

  it("accepts a short child-sized version of the same dilemma", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({
          title: "Hjælper du Sofie?",
          scenePrompt: "Skolens computer har lavet en hjælpekø. Sofie når måske ikke sin opgave.",
          landingScene: "I sidder med en skoleopgave. Sofie står sidst i computerens kø.",
          stake: "Sofie mangler hjælp, men de andre børn venter også.",
          question: "Hvad gør du nu?",
        }),
        { ...request, role: "Barn" },
      ),
    ).toHaveProperty("dilemma");
  });

  it("rejects a child dilemma with no visible AI or climate connection", () => {
    expect(
      validateAiDilemmaDetailed(
        baseline({
          title: "Hjælper du Sofie?",
          scenePrompt: "I skal vælge grupper. Sofie står alene ved bordet.",
          landingScene: "I sidder med en skoleopgave. Sofie mangler en gruppe.",
          stake: "Sofie vil være med, men din gruppe er næsten færdig.",
          question: "Hvad gør du nu?",
        }),
        { ...request, role: "Barn" },
      ),
    ).toEqual({ reason: "child_missing_everyday_future" });
  });

  it("rejects a visible stake that would be cut off in the card", () => {
    expect(validateAiDilemmaDetailed(baseline({ stake: "Sofie ".repeat(30) }), request)).toEqual({
      reason: "visible_text_too_long",
    });
  });
});
