# Retrospective

## Observed event

The three shared files mixed data, DOM generation, event wiring, dependency assumptions, and legacy whitespace. The gallery helper selected `.gallery li` even though the audited pages render `ul.gallery2`.

## Detection phase

Detected during Observe / Orient through shared-consumer inventory, source inspection, and comparison of selectors with actual shop-top markup.

## Missed gate or cause

The earlier boundary repair focused on semantic selector scope and syntax validity, but did not include a dedicated maintainability pass for initialization idempotence, optional dependency guards, or selector-to-markup correspondence.

## Generalizable rule

Every shared-script refactor must record its consumer count, guard repeat initialization, guard optional globals, and verify each behavior selector against representative rendered markup. CSS cleanup must separate no-op structure cleanup from cascade-changing refactors.

## Skill or validator change

This packet records the reusable rule for the next skills maintenance pass. No skill file is changed in this bounded refactor.

## Follow-up

The independent audit passed for the representative responsive gate. Promote consumer-matrix and selector-to-markup checks into the Planet workflow validator in a future skills maintenance packet. Keep CSS cascade reduction as a separately approved packet. Treat external-resource load timeouts as attributed partial results rather than route-wide PASS.
