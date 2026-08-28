# Future development role audit

## Scope

Offline review of development-to-role suitability, with special attention to children aged 7–11. This changes only curated metadata; it does not add prompt rules, runtime semantic validation or model retries.

## Finding

`suitableRoles` intentionally acts as stochastic weighting rather than a hard filter. That preserved thematic breadth, but it also meant several developments about employment liability, career changes, organisational operations and municipal participation could still be selected for a child. Terra would then have to invent authority the child does not have or move the real decision to an adult.

## Change

The clearly adult-authority developments are now explicitly unsuitable for `Barn`. Examples include employment negotiation and measurement, supervision of workplace AI, personal liability for automated work, continuous municipal participation and household energy budgets expressed as an administrative allocation.

The change does not remove any major future theme from children. Tests require:

- at least 60 suitable developments remain available to `Barn`;
- every `FutureTheme` remains represented among those developments;
- the identified adult-authority and inferred-distress developments cannot be selected for `Barn`.

The intent is not to make children's futures smaller. It is to give Terra a development whose consequence a child can personally see and act in, while AI, climate, health, privacy, robots, truth, education, work and democracy all remain available through child-scale situations.
