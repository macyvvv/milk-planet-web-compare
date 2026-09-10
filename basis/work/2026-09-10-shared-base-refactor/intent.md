# Change

Branch5 shared-base maintainability refactor for the three files modified in the preceding boundary repair.

## Viewing situation

- FACT: `proposal.css` and `proposal.js` are shared by 44 Branch5 HTML routes; `shop/gallery.js` is shared by 11 shop-top routes.
- FACT: The prior repair established semantic boundaries for visible titles and legacy image menus. This change must preserve those boundaries.
- USER: Refactor the three touched files after the critical maintainability review.
- CONSTRAINT: Existing store content, navigation destinations, carousel behavior, and visual direction are comparison assets and must remain unchanged.

## Business and human outcome

- INFERENCE: A maintainer should locate shared navigation data, initialization boundaries, and gallery dependencies without reconstructing them from nested functions or legacy snippets.
- INFERENCE: Repeat-safe initialization and selectors that match actual markup reduce regressions across many store pages.
- CONSTRAINT: Refactoring must not trade maintainability for a new visual direction or broad cross-page CSS rewrite.

## Source lock

- FACT: `proposal/branch5/proposal.css`, `proposal.js`, and `shop/gallery.js` are the only functional target files.
- FACT: `proposal/branch5/shop/<store>/index.html` uses `#gallery > ul.gallery2 > li` for the shop gallery.
- FACT: Existing menu URLs, external shop URLs, and current visual declarations are the source of truth.

## Hierarchy

1. Preserve the existing page-family selector boundaries.
2. Keep navigation data separate from DOM construction and event wiring.
3. Make shared behavior safe when loaded more than once or when an optional dependency is absent.
4. Keep CSS declaration values unchanged; clean only structure that has no visual meaning.

## Commitments

1. Extract navigation data and submenu construction helpers without changing generated labels or URLs.
2. Add explicit initialization guards and safe event-target handling to shared JavaScript.
3. Guard gallery dependencies, use the actual `gallery2` markup, and coalesce scroll work per animation frame.

## Deliberate exclusions

- USER: Do not change the three pages' content or introduce new HTML pages.
- CONSTRAINT: Do not remove all `!important` declarations, split `proposal.css`, or change legacy CSS precedence in this packet.
- CONSTRAINT: Do not alter carousel configuration, store-local CSS, image assets, or external destinations.
- CONSTRAINT: Do not add a new dependency, build step, or framework.

## Tradeoffs and unknowns

- TRADEOFF: The gallery selector is corrected to the actual `gallery2` markup; a hidden legacy `.gallery` consumer outside the audited 11 routes would no longer receive the fade helper.
- UNKNOWN: `flipLeft` styles were not found in the audited Branch5 shop CSS, so the selector correction may have no visible effect until a consumer defines that class.
- TRADEOFF: Full CSS decomposition and `!important` reduction remain a separate high-risk change because the shared file overrides legacy store styles.
