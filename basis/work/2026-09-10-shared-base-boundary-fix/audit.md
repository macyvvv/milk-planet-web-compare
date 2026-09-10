# Independent audit

## Compared sources

- `DESIGN.md`
- Published Branch5 shared-base routes under `proposal/branch5/`
- `proposal/branch5/proposal.css`
- `proposal/branch5/proposal.js`
- `proposal/branch5/shop/gallery.js`
- Canonical image menus under `proposal/branch5/shop/<store>/menu/`

## Viewports

- 390px: PASS — Shinjuku shop top has no horizontal overflow; SEO-only heading is out of layout; HTML menu remains readable; legacy JPEG menu remains one column.
- 768px: PASS — Shinjuku shop top has no horizontal overflow; SEO-only heading is out of layout; legacy JPEG menu remains one column.
- 1440px: PASS — Shinjuku shop top has `scrollWidth=1440` and the shop information block uses its local block layout; legacy JPEG menu retains a two-column grid; HTML menu retains its visible sticky title.

## Static checks

- `node --check proposal/branch5/shop/gallery.js` PASS.
- `node --check proposal/branch5/proposal.js` PASS.
- `python3 tools/validate_static_contract.py proposal/branch5/shop` PASS (39 HTML pages in validator scope).
- `python3 tools/validate_repo_contract.py` PASS.
- `python3 skills/planet-web-workflow/scripts/validate_work_packet.py basis/work/2026-09-10-shared-base-boundary-fix --state AUDITED` PASS.
- Selector audit: no `h1.seo_h1` remains in shared visible-title CSS; the title behavior query is `h1.title` only; all image-grid rules use `#shopinfo:has(> .menu)`.

## Browser observations

Post-build local browser audit completed against a repository-root HTTP server so existing `vendor/` assets were available.

- 44/44 Branch5 routes navigated successfully.
- 44/44 routes passed locator smoke checks without a route-level exception.
- 11/11 shop-top pages expose `h1.seo_h1`, `#shopinfo`, and their existing carousel container without visible-title class injection.
- 11/11 legacy image-menu pages retain `h1.title`, `#shopinfo`, and direct child `.menu` images.
- 15/15 HTML-menu routes retain `h1.title` and do not acquire the legacy image grid.
- Shinjuku shop top at 390/768/1440px: `scrollWidth` equals the viewport width; `h1.seo_h1` is `position:absolute; left:-9999px`; `#shopinfo` is `display:block`.
- Shinjuku legacy menu at 390/768/1440px: `#shopinfo` is `display:grid`, image counts remain 10, and no horizontal overflow was observed.
- Shinjuku HTML menu at 390/768/1440px: visible `h1.title` remains sticky, and no horizontal overflow was observed.
- Shinjuku shop-top screenshot at 1440px retains the original hero/carousel composition without the former SEO-title block.
- Local browser console: no `SyntaxError` or other error was recorded on the final shop-top observation.

## Accessibility and content checks

PASS — visible menu headings, SEO heading text, alt text, carousel controls, navigation, and store-specific copy were preserved in the route smoke audit. Keyboard interaction and formal accessibility evaluation remain limited.

## Findings

PASS — shared selector boundaries were corrected without changing store content or carousel sources. The remaining HTML semantic issues are outside this scope.

## Residual risks

- `:has()` compatibility outside the audited modern browser environment is not formally measured.
- Formal W3C validation is not available locally; repository static-contract validation is the equivalent automated check used here.
- Local lightbox image UI assets (`vendor/images/*`) remain absent from the repository-root test server, but this change does not alter lightbox behavior or assets.
- Shop-top HTML semantic cleanup remains outside this approved scope.
