# Decision

## Scope

Implement the approved shared-base boundary repair for the Branch5 audit scope. Change only `proposal.css`, `proposal.js`, `shop/gallery.js`, this work packet, and the decision log entry required to record the adopted boundary.

## Target files

- `proposal/branch5/proposal.css`
- `proposal/branch5/proposal.js`
- `proposal/branch5/shop/gallery.js`
- `basis/decision_log.md`
- `basis/work/2026-09-10-shared-base-boundary-fix/`

## State

State: AUDITED

## Gate status

- Source lock: PASS — shared sources, 44 consumers, 11 gallery consumers, and canonical image-menu boundaries were inventoried.
- Content and task: PASS — user approved the audit-derived repair; store content and carousel behavior are excluded.
- Structure: PASS — the title and image-grid rules have distinct semantic/page-family boundaries.
- Intent: PASS — the change restores the intended hierarchy without inventing visual direction or flattening store identity.
- Independent audit: PASS — static checks, 44-route local smoke audit, and 390/768/1440px browser checks completed.
- Release: NOT RUN — external release was not part of this approval.

## Definition of done

- `h1.seo_h1` no longer receives shared visible title CSS or title-shrink JS.
- `h1.title` behavior remains present on all 31 visible-title pages.
- The image grid applies to the 11 legacy image-menu pages without applying to shop-top information pages.
- `gallery.js` passes JavaScript syntax validation and all 11 shop-top consumers load it without the prior syntax error.
- Carousel sources, order, menu images, metadata, and external links are unchanged.
- Static validators pass.
- Browser audit covers 390px, 768px, and 1440px for representative page families and all 44 routes for smoke observations.
- Residual risks and any unverified W3C-equivalent checks are recorded in `audit.md`.

## Parking lot

- HTML semantic cleanup of the 11 legacy shop-top pages (`article`/`main`, heading levels, malformed attribute spacing).
- Per-route console-log isolation in the browser audit harness.
- Formal W3C validation and field performance measurement.
