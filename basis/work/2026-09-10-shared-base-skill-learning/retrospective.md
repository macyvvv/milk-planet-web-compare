# Retrospective

## Observed event

The implementation passed representative visual checks but the full sequential browser smoke run encountered external-resource load and CDP completion timeouts. Source inspection also found a gallery behavior selector that did not match the rendered markup.

## Detection phase

Detected during Observe / Orient and the post-build Check phase of the preceding shared-base refactor.

## Missed gate or cause

The prior workflow required broad browser and syntax checks but did not explicitly require a consumer matrix, selector-to-markup comparison, optional dependency guard, idempotence check, or separate status for DOM reachability versus load completion.

## Generalizable rule

Shared-base work requires impact inventory before implementation and independent evidence after implementation. Partial browser completion must be reported as partial, not upgraded to PASS by visual plausibility.

## Skill or validator change

The reusable rules were added to `planet-web-workflow` and `visual-fidelity`; no validator was changed because the observed checks still require page-specific semantic judgment.

## Follow-up

When the pattern recurs, evaluate a deterministic consumer/selector validator and a bounded, route-isolated browser harness.
