# Independent audit

## Compared sources

- `DESIGN.md`
- `proposal/branch5/proposal.css`
- `proposal/branch5/proposal.js`
- `proposal/branch5/shop/gallery.js`
- 44 Branch5 HTML consumers and 11 shop-top gallery consumers

## Viewports

- PASS — representative shop-top, JPEG menu, and HTML menu pages were checked at 390px, 768px, and 1440px. No horizontal overflow was observed. `h1.seo_h1` remained absolute/visually hidden on shop-top; `h1.title` remained sticky on both menu families; legacy JPEG menus remained a grid.

## Static checks

- PASS — `node --check proposal/branch5/proposal.js`, `node --check proposal/branch5/shop/gallery.js`, `python3 tools/validate_static_contract.py proposal/branch5/shop`, `python3 tools/validate_repo_contract.py`, `python3 tools/validate_skill_packages.py`, `python3 tools/validate_work_packets.py`, and `git diff --check` passed. The work packet validator passed at `DECIDED` before implementation; it is rerun at `AUDITED` after this record is updated.

## Browser observations

- PASS — representative browser observations completed with a temporary repository-root HTTP server. Across the three widths, shop-top exposed 6 `#gallery > ul.gallery2 > li` items and 2 generated navigation submenus; JPEG menu retained 10 direct child `.menu` images and `display:grid`; HTML menu retained one sticky `h1.title`. The gallery scroll handler was exercised to 3100px and applied `flipLeft` to all 6 gallery items. The final shop-top observation at 1440px reported `scrollWidth=1440` and no console errors/warnings.
- PARTIAL — a 44-route sequential smoke attempt reached all route entries in the harness, but external-resource-heavy pages caused navigation/CDP completion timeouts and some pages remained `interactive` during the short smoke window. This is not treated as a full-route browser PASS; static contract coverage and the representative browser gate are the reliable results for this packet.

## Accessibility and content checks

- PASS — generated navigation submenu count and labels/URL sources were preserved by source comparison; visible title roles, SEO heading separation, and gallery image elements remained present. The browser console was clean on the final representative route. Formal keyboard audit and W3C validation remain outside the local toolchain.

## Findings

- PASS — the bounded refactor did not introduce visual regression in the representative page families. The gallery selector now matches the rendered `gallery2` markup, and scroll work is coalesced without changing the activation threshold.

## Residual risks

- The broad CSS cascade remains intentionally unchanged; `!important` reduction and file decomposition require a separate baseline-driven change.
- `:has()` compatibility and formal W3C validation remain existing risks.
- If no `flipLeft` style is present in a consumer, the corrected gallery selector changes the activation target without producing a visible animation.
- External-resource-heavy pages may prevent a sequential browser harness from reaching `complete`; route-level automated smoke should use bounded load-state checks and per-route timeout attribution.
- The local Lightbox stylesheet still requests missing legacy assets under `vendor/images/` (`prev.png`, `next.png`, `loading.gif`, `close.png`); this predates the refactor and was not changed.
