# Retrospective

## Observed event

The complete impact audit showed that one shared title selector served two different semantic roles: visible menu titles and SEO-only shop headings. A second broad selector applied an image-menu grid to shop-top information containers. The shop gallery helper also contained editor text that made the JavaScript invalid.

## Detection phase

Detected during Observe / Orient through route inventory, source inspection, browser DOM observations, responsive screenshots, and syntax validation.

## Missed gate or cause

The earlier shared-base implementation was validated by page appearance but did not require a selector-to-page-family matrix or syntax validation for every shared consumer. The audit also exposed that browser console logs must be isolated per route to avoid conflating repeated errors. The repaired scope was then checked through a repository-root local server, 44 route smoke checks, and representative responsive screenshots.

## Generalizable rule

Every shared CSS/JS change must be checked against the complete consumer graph and semantic page-family matrix. A selector that spans visible content and SEO-only content is not a safe shared boundary. Shared scripts require syntax checks before visual review, and console evidence must be attributable to one route.

## Skill or validator change

This packet records the rule for the next skills maintenance pass. It is not a skills-file change in the current implementation scope. The current shared-base repair itself passed the independent audit gate.

## Follow-up

Add a reusable consumer-matrix check and per-route browser log isolation to the Planet workflow/validator after this repair is independently audited.
