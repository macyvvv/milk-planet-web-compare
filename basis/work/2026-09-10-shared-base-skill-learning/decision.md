# Decision

## Scope

Update the existing reusable Planet Skills with the generalized lessons from the shared-base refactor. Do not change implementation files or validators.

## Target files

- `skills/planet-web-workflow/SKILL.md`
- `skills/visual-fidelity/SKILL.md`
- `basis/decision_log.md`
- `basis/work/2026-09-10-shared-base-skill-learning/`

## State

State: LEARNED

## Gate status

- Source lock: PASS — responsible Skills and preceding evidence packet were inspected.
- Content and task: PASS — user requested Skill learning organization; scope is limited to reusable guidance.
- Structure: PASS — workflow gates stay in `planet-web-workflow`; post-build criteria stay in `visual-fidelity`.
- Intent: PASS — no store-specific preference is generalized.
- Independent audit: PASS — Skill package, repo contract, work packet, and detailed Skill validation completed.
- Release: NOT RUN — commit, push, PR, merge, and publish are not requested.

## Definition of done

- Shared consumer inventory, selector-to-markup, dependency, idempotence, and route-timeout rules are recorded in the responsible Skills.
- Skill descriptions and routing remain discriminating and non-duplicative.
- Skill package, repo contract, work packet, and diff checks pass.
- The reason and boundary of the Skill update are recorded in `basis/decision_log.md`.

## Parking lot

- Add a deterministic consumer-matrix or selector-to-markup validator only after more evidence shows stable machine-checkable patterns.
- Add a formal browser route harness with bounded navigation and per-route log attribution as a separate tooling change.
