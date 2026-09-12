# Change

2026-09-12: Cast store-filter repair and Branch5 whole-site audit.

## Viewing situation

- USER: The published cast page has store icons that are too small and store filtering that does not work.
- FACT: The published page at `https://macyvvv.github.io/milk-planet-web-compare/proposal/branch5/cast/index.html` showed a very small store-icon row and mixed-store cast cards while `#shandy` was present.
- CONSTRAINT: `currently/` is a read-only comparison baseline. Only `proposal/branch5/` may be changed within approved scope.

## Business and human outcome

- USER: A visitor can identify the store filter, choose one store, and see only that store's cast members.
- INFERENCE: Reliable cast discovery reduces uncertainty before a visit and supports the site's confirmation/decision role.
- FACT: The Branch5 audit must distinguish real failures from unused or historical assets.

## Source lock

- FACT: Store filter labels and cast-area names are defined in `proposal/branch5/cast/index.html` and `castlist.js`.
- FACT: Store logo assets are `proposal/branch5/images/list_*.png` and are 300x300 RGBA PNGs.
- FACT: `DESIGN.md`, `basis/system_spec.md`, and `basis/README.md` define Branch5 as a static comparison proposal and require responsive verification at 390px, 768px, and 1440px.
- FACT: The original `currently/cast/` page is a comparison reference, not a modification target.

## Hierarchy

1. Page title and page context.
2. Store filter controls with recognizable logos and clear selected state.
3. Cast cards limited to the selected store.
4. Cast identity, birthday, and social link.
5. Global navigation and footer.

## Commitments

1. Make each store filter a real, visible, keyboard-operable control backed by the existing store logo asset.
2. Make filtering deterministic from the selected store value and URL hash, without relying on a stale DOM snapshot or parser-time `document.write()` side effect.
3. Audit all Branch5 HTML/CSS/JS/image references and key page states, recording every finding by severity and confidence.

## Deliberate exclusions

- No changes to `currently/`.
- No new external dependency.
- No redesign of the cast-card visual language or store-specific assets.
- No push, pull request, merge, or publish operation.
- No correction of live business content unless it is a broken local reference or a direct functional defect in approved scope.

## Tradeoffs and unknowns

- INFERENCE: Replacing parser-time card injection with DOM construction is a bounded robustness change, but it must preserve the existing cast order and card content.
- UNKNOWN: The exact live deployment commit cannot be verified from the network in the shell; the public screenshot was observed before the browser connection dropped.
- UNKNOWN: Full browser interaction at all required widths may be limited by browser availability; any unverified route or width must remain explicitly marked `NOT RUN`.

## Principle under test

- STRUCTURAL: A static page should not use an empty image element plus a parent background as the primary interactive store control, nor use parser-time generated children as the only filter target.

## No-change option

- Keep the current implementation and report the defect. Rejected because the requested primary interaction remains unusable.

## Transfer boundary

- Apply the DOM/data separation rule to other shared interactive controls only when the same failure pattern is observed. Do not normalize all page-specific markup without evidence.
