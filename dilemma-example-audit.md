# Golden example audit

## Scope

Offline review of the active golden-example library after the bounded Terra evaluations. No model calls, production-prompt changes, runtime heuristics or regeneration were used.

The review focused on whether each example teaches Terra:

- one decision the selected role can make;
- four choices that keep the same situation as given;
- a visible human cost in every choice;
- no transfer of the decision to a child, patient, trainer or other third party;
- no artificial deadline, reserved place or invented scarcity.

## Corrected findings

1. Related-example fallback could select an example based on the same development as the target. The fallback now applies the same development exclusion as the preferred path, with a regression test.
2. The youth body-sensor example transferred the decision to the trainer. The player now chooses a reduced role and accepts both lost status and the sensor's judgment.
3. The adaptive-teaching example transferred the teacher's decision to the pupil. The teacher now chooses a distinct level of responsibility and owns the consequence.
4. The remote-treatment example transferred the professional decision to the patient. Its four choices now place final authority differently between the local professional and remote specialist.
5. The unsolicited-public-help example offered a human meeting without data as a workaround. It was replaced by a continuous-democracy example with four genuine forms of participation.
6. The child night-school example taught a “little of both” compromise and an exit from the situation. It was replaced by a child-readable dilemma about live AI fact-checking, truth and a grandparent's memory.

## Current evidence

- All active examples still have a valid role, development, future normal, human cost, decision and exactly four choices.
- The library-selection tests prove that the two example slots are distinct and do not reuse the target development, including the fallback path.
- This audit improves the editorial inputs but does not prove generation consistency by itself. The next broad live evaluation should only happen when a new bounded evaluation is explicitly wanted; these changes do not trigger one automatically.
