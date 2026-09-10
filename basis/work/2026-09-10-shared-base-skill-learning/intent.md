# Change

Generalize the shared-base refactor findings into the repo-local reusable Skills.

## Viewing situation

- FACT: The preceding refactor exposed reusable risks in shared CSS/JS: incomplete consumer inventory, selector-to-markup drift, repeated initialization, unguarded optional globals, and conflation of DOM reachability with page-load completion.
- USER: Organize learnings that should be recorded in Skills.
- CONSTRAINT: Keep repo-specific facts in `basis/`; do not turn a single store preference into a universal design rule.

## Business and human outcome

- INFERENCE: Future page work should detect cross-page regressions before visual polish and should report incomplete browser evidence honestly.
- INFERENCE: A concise shared-base gate improves repeatability, handoff, and maintenance cost across Planet pages.

## Source lock

- FACT: `skills/planet-web-workflow/SKILL.md` owns OODA/PDCA order, gates, and evidence.
- FACT: `skills/visual-fidelity/SKILL.md` owns post-build visual, structural, and browser audit criteria.
- FACT: `skills/README.md` owns routing and Skill/basis responsibility boundaries.

## Hierarchy

1. Keep reusable workflow rules in Skills.
2. Keep the observed route counts, selectors, URLs, and remaining risks in `basis/work/` and `basis/decision_log.md`.
3. Keep validators unchanged unless the rule can be checked deterministically without encoding one page's implementation.

## Commitments

1. Add a shared consumer-matrix and selector-to-markup preflight to `planet-web-workflow`.
2. Add dependency, idempotence, scroll-cost, and partial-route evidence rules to the two responsible Skills.
3. Validate Skill packages, repo contract, work packets, and the changed references.

## Deliberate exclusions

- Do not create a new Skill; the existing workflow and visual audit responsibilities already cover this learning.
- Do not add store names, prices, URLs, or fixed route counts to reusable instructions.
- Do not change application code, CSS, HTML, validators, CI, or release state in this packet.

## Tradeoffs and unknowns

- TRADEOFF: Rules are explicit enough to prevent the observed failures but leave implementation choices open for different JS/CSS stacks.
- UNKNOWN: A future deterministic validator may be justified after the same evidence pattern recurs; this change records the manual gate only.
