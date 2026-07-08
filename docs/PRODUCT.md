# World 2046

**World 2046** is an interactive web experience that puts people inside the future they are helping to build. Instead of asking "what do you think will happen in the future?", it asks a more personal question:

> *How might I navigate the future I am helping create?*

The user travels — via a digital time machine — to the year 2046, arrives as a **persona** built from their own values and hopes/fears, and is dropped into short, concrete dilemmas set in real cities around the world. Each dilemma is about how AI, robots, data, climate, health, work, mobility, or digital trust reshape an everyday moment. The user answers with a choice or in their own words (typed or spoken), and after five stops receives a personal **future profile**: a narrative report that reflects their values back to them, quoting their own words.

It is built by Gejst Studio as a reflective, theatrical tool for thinking about the future — not a quiz with right answers, but a way to notice what you actually value when you're forced to decide.

## The experience

The product is designed as a piece of dramaturgy, not a form. Every phase has a distinct beat:

1. **Intro** — a scroll-driven, cinematic landing built around a rotating 3D globe (Mapbox satellite, with a Three.js fallback), setting the tone before anything is asked of the user.

2. **Persona builder** — instead of picking a role from a dropdown, the user answers three short questions:
   - *Who are you travelling as?* (a role: young person, parent, teacher, employer, employee, citizen, decision-maker, or "everyone")
   - *What matters most to you in a good future?*
   - *What do you hope or fear most about 2046?*

   These answers (typed or spoken) are sent to an AI persona generator, which writes a short second-person persona — a name, a one-paragraph description weaving in the user's own words, and a handful of character traits. If no AI is configured, a local template does the same job. This persona travels with the user for the rest of the session and is woven into every dilemma and every landing scene that follows.

3. **Time machine** — activating the persona plays a "charging" transition: a rising sound sweep, a year counter animating from 2026 to 2046, and journey narration ("Leaving the last stop… travelling through time… finding the next situation").

4. **Landing** — on arrival, the user gets a short, sensory scene before any decision is asked of them: the place, the year, their persona, a line of weather/ambient detail, and one concrete situation already in motion (e.g. *"You land in Aarhus, 2046. Rain hangs in the air. In the schoolyard, an AI assistant quietly adjusts the lesson in real time."*). This is generated per-dilemma, either by the AI alongside the dilemma itself or composed locally from templates.

5. **Dilemma** — a concrete decision framed as *"How might I…"* rather than a binary right/wrong question, always spoken from the persona's perspective (e.g. *"How might I, as this curious parent, make sure the robot doesn't replace the moments that matter?"*). The user picks one of four balanced choices, or writes/speaks their own answer instead. No option is the "correct" one — each just nudges the user's value profile in a different direction.

6. **Consequence** — the outcome of that specific choice, plus an optional, always-skippable reflection prompt: *"What would you have wished someone had decided differently here?"* Reflections (typed or spoken) are folded into the final report.

7. **Repeat** — steps 3–6 run five times. The first stop is always in Denmark; every later stop is a different country and a different problem area, so users see a spread of places and stakes rather than five variations on the same theme.

8. **Future profile report** — a personal, AI-written narrative in second person that reflects the user's values back to them: a headline, a short story of who they are becoming in this 2046, up to three verbatim quotes pulled from their own typed or spoken answers, the patterns across their choices, and a value-profile chart. If AI isn't available, a locally computed summary and the user's own quotes still make it into the report — nothing about the ending depends on a live model.

## What the product measures — and what it deliberately doesn't

Every choice — whether a preset option or something the user wrote themselves — nudges a profile of ten value axes: trust, freedom, equality, efficiency, human contact, safety, innovation, sustainability, local control, and transparency. From this, the report infers things like whether someone's stance on AI reads as progressive, pragmatic, or restrictive, and whether they lean toward community or individual choice, trust or control.

There is deliberately no scoring, no "correct" answer, and no leaderboard. The point isn't to test the user — it's to give them (and whoever they share the report with) a mirror for values that are otherwise hard to name.

## Interaction model

- **Choose or speak.** Every open answer — persona questions, dilemma answers, reflections — can be typed or recorded with the browser's built-in speech recognition (Danish or English, depending on the session language). If the browser doesn't support voice or the microphone is blocked, the text field still works; nothing is voice-only.
- **Two languages.** UI chrome supports Danish and English. AI-generated content (dilemmas, personas, reports) is written in whichever language the session is set to.
- **Always reversible.** A user can back out of the last dilemma and its impact on their value profile is cleanly undone; restarting clears everything and starts a fresh session.
- **Graceful without AI.** Every AI-backed step — persona, dilemma, sensory landing, final report — has a local, template-based fallback that activates automatically if no AI key is configured or a request fails. The product works end to end either way; only the specificity and voice of the writing changes.

## Look and feel

The visual language is a warm, dark, glass-and-light sci-fi HUD: satellite-real locations viewed through a glowing globe, panels with corner-bracket framing and a scanline hairline like a viewfinder, Orbitron for headlines, Space Grotesk for body copy, and Share Tech Mono for labels, badges, and readouts. Sound is fully procedural — button taps, a time-machine charge-up, an arrival chime, and location-aware ambient soundscapes — so nothing depends on external audio assets.

## Who it's for

The tone of voice and the choice of roles (young person, parent, teacher/pedagogue, employer, employee, citizen, decision-maker) suggest a broad general-public audience — this reads as a piece for public engagement, workshops, or exhibitions about the future of technology and society, rather than a narrow enterprise tool. The Danish-first language and the fixed first stop in Denmark suggest its home context is Danish public conversation about AI, robots, data, climate, health, work, mobility, and digital trust, built to travel to a global audience from there.
