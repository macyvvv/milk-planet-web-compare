# Independent audit

## Compared sources

- `proposal/branch5/cast/index.html`, `cast.css`, and `castlist.js` were compared with the pre-change Git version and the read-only `currently/cast/` reference.
- Branch5 inventory covered 57 HTML files, 59 CSS files, and 20 JavaScript files under `proposal/branch5/`.
- The audit treated generated cast cards and active consumers separately from commented-out markup and stale CSS selectors.

## Viewports

- Browser verification used the local Branch5 server at 390px, 768px, and 1440px widths.
- Store control box/icon sizes were observed as 50.83px at 390px, 70px at 768px, and 120px at 1440px.
- Screenshots were captured at all three widths during the browser audit; the 390px and 1440px captures were used for visual confirmation of the control row and filtered cards.

## Static checks

- `python3 tools/validate_repo_contract.py`: PASS.
- `git -c core.fsmonitor=false diff --check`: PASS.
- Active local HTML `src`/`href` references: 0 missing.
- Cast assets: 6 store logos and 133 cast-card images loaded as local assets; all 139 images reported `complete` with non-zero natural width in the browser.
- `proposal/branch5/cast/castlist.js`: `node --check` PASS.
- Whole Branch5 JavaScript syntax scan: 11/20 pass; 9 files fail because they are HTML/XSERVER 404 documents saved with a `.js` extension.
- CSS local-reference scan: 11 missing references remain across active or legacy/stale CSS; their classifications are listed in Findings.

## Browser observations

- All six controls resolved to exactly one radio and were clicked through the visible label contract.
- Results after each selection were:
  - ShandyLove / `shandy`: 35 cards
  - milk planet / `shinjuku`: 36 cards
  - Chocolatplanet / `chocolat`: 15 cards
  - MeltyMousse / `melty`: 13 cards
  - RoyalSugar / `roysuga`: 20 cards
  - TweenyHeartCafe / `tweeny`: 14 cards
- Every result contained only its selected store class. Hidden cards with a non-`none` computed display count: 0 for every selection.
- URL hash and checked radio stayed aligned for all six selections.
- An invalid hash fell back to Shandy and was normalized to `#shandy`.
- Cast-page browser error log: empty.
- The published URL was not re-verified after the local change because publish/deploy was not requested.

## Accessibility and content checks

- The six store controls now use real radios, associated labels, visible images, focus-visible styling, and `aria-hidden` state on filtered cards.
- Cast card data and the existing generation order were preserved; the parser-time `document.write()` calls were replaced by DOM construction without changing the source arrays.
- Active HTML local references have no missing targets.
- `footer.html` contains 11 linked store-logo images without `alt` text, leaving those footer links without useful image alternatives.

## Philosophy continuity

- `LOCAL`: Empty store images, parent-background controls, the hidden/display cascade, and parser-time card generation were local to the cast page and were repaired locally.
- `STRUCTURAL`: A filter is valid only when control value, rendered card class, hidden-state CSS, and URL state form one deterministic contract. The audit therefore checked computed visibility, not only class names.
- `UNKNOWN`: External font, analytics, TikTok, and other third-party runtime availability was not fully verified because network access is unavailable in the shell and deployment was not requested.

## Cross-page regression

- No files under `currently/` were changed.
- No unrelated proposal files were changed; the only implementation files are the three cast files. Audit evidence and decisions are confined to this packet and `basis/decision_log.md`.
- Existing Branch5 site-wide findings remain open and are not described as resolved by this change.

## Findings

### Fixed in this change

- `REQUIRED / CONFIRMED`: Store logos had no image source and the filter depended on fragile parent/class assumptions. The controls now use six valid logo sources and deterministic radio values.
- `REQUIRED / CONFIRMED`: `#boxes div { display:inline-block; }` overrode `.hidden`, so non-selected cards remained displayed. The scoped hidden rule now removes them from layout.
- `REQUIRED / CONFIRMED`: `document.write()` generated cards during parsing and made filter initialization brittle. Cards are now appended through a bounded DOM helper.
- `REQUIRED / CONFIRMED`: Cast X links referenced a missing `twi.png` while hiding their text. They now render as a CSS X badge with a 26px target.

### Open site-wide findings

- `REQUIRED / HIGH`: `proposal/branch5/shop/shop.css` references the missing `w_shop.png` at desktop and mobile paths. The active `shop/index.html` title ornament therefore cannot render.
- `REQUIRED / HIGH`: Nine legacy `shop/*/menu/index_0.html` routes reference same-directory `eventlist.js` files whose contents begin with `<!DOCTYPE html>` and are XSERVER 404 documents, not JavaScript. The current `menu/index.html` routes are separate HTML-menu implementations, but direct legacy routes remain broken.
- `REQUIRED / HIGH`: `proposal/branch5/recruit/index.html` defines `id="about"` twice (lines 61 and 67), making fragment targeting and ID-based behavior ambiguous.
- `REQUIRED / HIGH`: `proposal/branch5/shop/index.html` uses two `class` attributes on 13 store wrappers (`class="shop" class="content"`). Browser parsing drops one class attribute, so the intended combined structure is not represented reliably.
- `REQUIRED / MEDIUM`: `proposal/branch5/footer.html` has 11 linked store-logo images without `alt` attributes. This is an accessibility failure for the shared footer iframe.
- `REQUIRED / MEDIUM`: Legacy `system.css` files for `shop/shinjuku/menu`, `shop/chocolat/menu`, and `shop/shandy/menu` reference missing `images/index.png`. The references are used by the legacy image-menu family and should be repaired or intentionally retired together with those routes.
- `ADVISORY / MEDIUM`: `proposal/branch5/recruit/recruit.css` references missing `../images/star.png`, `images/cutline.png`, `images/close.png`, and `images/open.png`; the matching `.taigu`, `.top`, and `.pullhead` structures are absent from the active recruit page, so these are stale/inactive CSS references.
- `ADVISORY / LOW`: `proposal/branch5/cast/cast.css` still contains two missing `../images/close.png` / `open.png` references under the inactive legacy `.pullhead` rules. They do not affect the current cast DOM.
- `ADVISORY / LOW`: Five `</br>` closing tags remain in `index.html`, `shop/index.html`, and `recruit/index.html`; they should be normalized to `<br>` when those files are next edited.

## Residual risks

- The public GitHub Pages URL still serves the previously published revision until a separate publish operation is requested and completed.
- The whole-site audit is static plus representative browser verification; third-party network integrations and every route's visual state remain `NOT RUN`.
- Open REQUIRED findings should be handled in a separate approved work packet so legacy comparison routes, shared footer behavior, and shop-page structure are not mixed into the cast repair.

## Audit correction — 2026-09-12 follow-up

- The nine `shop/*/menu/index_0.html` `eventlist.js` references are inside HTML comments and are not runtime consumers of the active Branch5 pages.
- Reclassify that earlier finding from `REQUIRED / HIGH` to `ADVISORY / LOW` stale comparison remnants. The legacy menu roots remain unchanged under the repository contract.
- The active residual issue in this packet was the missing `w_shop.png` reference in `proposal/branch5/shop/shop.css`; it is handled by `20260912-residual-sitewide-repair`.
