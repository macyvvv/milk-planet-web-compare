# Retrospective

## Observed event

The cast page showed tiny store controls and mixed-store cards after a store selection. The initial repair made the filter's data matching deterministic, but browser verification exposed that hidden cards still occupied the page.

## Detection phase

The remaining defect was found during post-implementation browser verification at 390px. A class-based count suggested correct filtering, while computed `display` showed that `#boxes div` overrode `.hidden`.

## Missed gate or cause

- The original CSS audit did not compare selector specificity for the filter state against the card layout rule.
- The original implementation coupled empty images, parent background logos, and card generation through `document.write()`.
- A static reference scan alone would not prove that generated cards were actually hidden or that a missing image was visible in the current DOM.

## Generalizable rule

For static interactive pages, verify the full state contract: control value → rendered class → computed visibility → URL state. For generated markup, inspect the final DOM and computed styles after initialization; do not treat matching classes as proof of visual behavior.

## Skill or validator change

No global Skill or validator was changed in this packet. The rule above is recorded for the next shared-page audit; promoting it to a reusable validator requires more cross-page evidence and a separate scope decision.

## Follow-up

Create a separate approved packet for the open REQUIRED site-wide findings, beginning with active `shop/index.html`, shared `footer.html`, and the nine legacy `menu/index_0.html` routes.

## Principle update

The useful abstraction is not “make icons larger.” It is “make the interactive state explicit at every layer that can suppress or reveal content, while preserving the existing source data and page hierarchy.”
