# Independent audit

## Compared sources

- Active consumers: `proposal/branch5/index.html`, `footer.html`, `shop/index.html`, `shop/shop.css`, `recruit/index.html`, and `recruit/recruit.css`.
- Regression reference: the pre-change Git versions and the Branch5 page-family CSS/HTML relationships.
- Boundary reference: `currently/**` and `proposal/branch5/shop/<store>/menu/**` were inspected as comparison sources and not modified.

## Viewports

- Real-browser verification used a fresh local origin at 390px, 768px, and 1440px.
- Shop list: 13 `.shop.content` wrappers at all widths; the missing title ornament pseudo-element reports `content: none` and `background-image: none`.
- Recruit: two `.about` blocks and one unique `#about` target at all widths.
- Recruit and shop visual screenshots were captured at 390px and 1440px; both retained the existing page-family composition without fabricated replacement art.

## Static checks

- `python3 tools/validate_repo_contract.py`: PASS (`22 files`, `11 directories`).
- `python3 skills/planet-web-workflow/scripts/validate_work_packet.py basis/work/20260912-residual-sitewide-repair --state AUDITED`: PASS.
- `git -c core.fsmonitor=false diff --check`: PASS.
- `node --check proposal/branch5/cast/castlist.js`: PASS.
- Active Branch5 HTML local `src`/`href` references: 0 missing across 57 HTML files.
- Exact active duplicate IDs: 0.
- Duplicate `class` attributes: 0.
- Invalid `</br>` tags: 0.
- Missing image `alt` attributes in active HTML: 0.
- CSS reference scan: 9 missing references remain, all classified as excluded stale legacy CSS: 2 inactive cast `.pullhead` assets, 4 inactive recruit assets, and 3 legacy image-menu `system.css` references.

## Browser observations

- Shop page loaded without browser errors. The 13 store wrappers retain both `shop` and `content` classes; the title has no broken `w_shop.png` request or decorative pseudo-element.
- Recruit page loaded without browser errors. `#about` count was 1 and `.about` count was 2 at 390px, 768px, and 1440px; horizontal overflow was not observed in the page layout.
- Footer loaded 11 linked store-logo images, all with useful alternatives; missing-alt count was 0.
- Cast regression loaded 133 cards. All six controls were clicked through their visible labels and produced the expected counts:
  - ShandyLove / `shandy`: 35
  - milk planet / `shinjuku`: 36
  - Chocolatplanet / `chocolat`: 15
  - MeltyMousse / `melty`: 13
  - RoyalSugar / `roysuga`: 20
  - TweenyHeartCafe / `tweeny`: 14
- Every cast filter state had zero hidden cards with a non-`none` computed display, and the selected radio/hash remained aligned.
- Browser error logs for shop, recruit, and cast: empty.

## Accessibility and content checks

- Footer logo links now expose store identity through `alt` text without changing destinations.
- The recruit page keeps one fragment target while both content blocks receive the shared `.about` styling contract.
- The shop wrapper class repair restores both selector families without changing store order or copy.
- No text, prices, links, store order, comparison assets, or current-site references were changed by this packet.

## Philosophy continuity

- `LOCAL`: The missing ornament reference is removed only from its active Branch5 consumer; title text and existing cutline treatment remain.
- `STRUCTURAL`: Invalid HTML attributes, ambiguous IDs, and missing alternatives are repaired at their active semantic boundaries.
- `UNKNOWN`: The historical source and rights for `w_shop.png` remain unresolved, so no substitute image was invented.
- `ACCOUNTABILITY`: The previous `eventlist.js` finding was corrected after confirming that the references are inside comments; static audits now distinguish active consumers from stale comparison text.

## Cross-page regression

- `currently/**` is unchanged.
- `proposal/branch5/shop/<store>/menu/**` is unchanged.
- Cast filter behavior remains intact after the site-wide repairs.
- Public GitHub Pages deployment was not changed or re-verified because release was not requested.

## Findings

### Fixed in this packet

- `REQUIRED / CONFIRMED`: Removed the active `w_shop.png` references from desktop and mobile shop-title pseudo-element rules without fabricating an asset.
- `REQUIRED / CONFIRMED`: Added alternatives to all 11 linked footer store logos.
- `REQUIRED / CONFIRMED`: Repaired the duplicate recruit ID while preserving shared styling for both blocks.
- `REQUIRED / CONFIRMED`: Combined the 13 shop wrapper class attributes into valid HTML.
- `REQUIRED / CONFIRMED`: Normalized five invalid `</br>` tags to `<br>`.

### Intentionally excluded residuals

- `ADVISORY / LOW`: 2 missing `close.png`/`open.png` references in inactive cast legacy rules.
- `ADVISORY / MEDIUM`: 4 missing star/cutline/close/open references in inactive recruit legacy rules.
- `ADVISORY / LOW`: 3 missing `images/index.png` references in legacy image-menu `system.css` files.
- `ADVISORY / LOW`: 9 `eventlist.js` references inside commented-out legacy menu markup; the referenced files are 404 HTML snapshots, but not active consumers.

These remain outside the approved packet because changing comparison roots would weaken the repository's current-versus-proposal evidence boundary.

## Residual risks

- The public URL still serves the previously published revision until a separate publish operation is requested.
- External fonts, analytics, social embeds, and every external destination remain outside local-network verification.
- The 1440px shop document reports a larger document scroll width than its client width despite no overflowing element rectangle being found; this is retained as a low-priority layout investigation rather than changed speculatively in this packet.
