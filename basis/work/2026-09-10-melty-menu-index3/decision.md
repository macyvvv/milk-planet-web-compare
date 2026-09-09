# Decision

## Scope

Create `proposal/branch5/shop/melty/menu-html/index_3.html` as a source-led, image-preserving menu comparison page. Add only page-local CSS and semantic navigation needed for readability and access.

## Target files

- `proposal/branch5/shop/melty/menu-html/index_3.html`
- `basis/work/2026-09-10-melty-menu-index3/`

## State

State: RELEASED

## Gate status

- Source lock: PASS — existing Melty menu sheets, logo, lace transition, shared CSS, and store CSS were inspected.
- Content and task: PASS — all seven source sheets remain present; no image text is manually duplicated.
- Structure: PASS — planned semantic sections, anchors, alt summaries, and responsive source paths.
- Intent: PASS — image-led treatment follows the source's coupled typography, illustrations, and prices.
- Independent audit: PASS — static checks and browser checks were completed after the page was implemented; the empty intro wrapper and late category index were corrected during the audit loop.
- Release: PASS — commit, push, PR, merge, Pages deployment, and published URL verification are recorded in `release.md`.

## Definition of done

- `index_3.html` exists while `index.html` remains unchanged.
- All seven menu sheets and the existing Melty logo are referenced correctly.
- Category navigation resolves to unique section IDs.
- 390px, 768px, and 1440px views have no horizontal overflow or image cropping.
- Mobile navigation opens and closes accessibly.
- Image alt summaries, heading order, and contrast are checked.
- Work packet is validated and release states are recorded before merge.

## Parking lot

- Full item-level HTML transcription with an operational content ownership process.
- Formal W3C validator integration for the static HTML corpus.
- Automated image-to-HTML content diffing.
