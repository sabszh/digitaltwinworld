# Production dilemma flow audit

## Active path

The active `/api/dilemma` route follows the intended simplified architecture:

1. `selectDilemmaSeed` selects one curated development, one unused/varied location and two distinct golden examples.
2. `buildDilemmaPrompt` sends the role, city, development and examples to Terra.
3. The route makes one creative authoring call for that HTTP request.
4. `validateCreativeDilemma` checks schema, four `a/b/c/d` choices, taxonomy, obvious child authority and obvious unsafe content. It does not run the legacy semantic validator.
5. Luna scores value impacts without rewriting the dilemma.
6. Code derives metadata and trims display text at word boundaries.
7. Geocoding may improve the marker and exact place. A failed location lookup does not reject the dilemma.

## Retry and prefetch behaviour

- The server does not regenerate a rejected creative output inside the same request.
- The client remains on the travel state and retries a failed request in the background. This is the existing product behaviour that prevents a participant-facing “cannot find a location” popup.
- A successfully prefetched dilemma is reused after the participant answers.
- The prefetch projection contains a placeholder choice, but seed planning and the author prompt ignore selected choice, choice label, reflection and value impacts.
- Regression tests prove that changing the latest selected choice does not change the next seed or prompt.

## Remaining operational trade-off

Terra authoring, Luna value scoring and geocoding happen sequentially inside one route request. If Luna fails after Terra has produced a valid creative dilemma, the request fails and the client's next attempt authors a new dilemma. Avoiding that would require a deliberate product decision about cached creative drafts, utility-only retry or incomplete value scoring. No such retry/fallback behaviour was added during this audit.

## Completion evidence gap

The implementation and curated inputs now satisfy the intended simple architecture, and all technical checks pass. Consistent editorial quality across the stochastic development/role space cannot be proven through static inspection. The authoritative missing evidence is a new bounded, no-retry generation sample across all roles after the latest content changes. That evaluation has not been run automatically.
