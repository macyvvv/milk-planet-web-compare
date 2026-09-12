# Change

Branch5-only CSS/JS maintainability audit and conservative refactor after the existing-work checkpoint and retirement of proposal branches 1–4.

## Viewing situation

- FACT: The repository now contains `currently/` and `proposal/branch5/`; proposal branches 1–4 were removed in an approved, separate local commit.
- FACT: Branch5 contains 57 HTML pages, 59 CSS files, 20 JavaScript files, and 1,191 image files.
- FACT: Shared `proposal.css`, `proposal.js`, and `analytics.js` are referenced across the main Branch5 page families; shop gallery behavior is shared by 11 store-top pages.
- FACT: The prior shared-base work found selector-boundary, optional-dependency, repeat-initialization, and load-timeout risks. It explicitly deferred `!important` reduction and CSS decomposition.
- FACT: Nine store-local files named `eventlist.js` are captured 404 HTML responses. Their menu-page references are inside HTML comments; store-top pages resolve to the root `proposal/branch5/eventlist.js` instead.
- USER: Review the whole Branch5 CSS/JS surface for waste and ad-hoc behavior, then implement the safe part without repeating the previous regression.
- CONSTRAINT: `currently/`, vendor assets, original image-menu pages, and store-specific visual identity remain unchanged.

## Business and human outcome

- INFERENCE: A maintainer should be able to identify the active shared layer, its consumers, and its dependency assumptions without relying on filename intuition.
- INFERENCE: Guarded, repeat-safe shared behavior reduces cross-store regressions and lowers the cost of future content updates.
- CONSTRAINT: Visual stability and route continuity are higher priority than reducing line count or making the code look uniform.

## Source lock

- FACT: Visual and store-specific decisions are governed by `DESIGN.md` and the Branch5 source pages.
- FACT: `proposal/branch5/proposal.css`, `proposal.js`, `analytics.js`, `event.js`, `eventlist.js`, `shop/gallery.js`, and the Branch5 CSS family are the implementation evidence surface.
- FACT: Existing public paths, menu variants, store-local CSS, external destinations, and event content are preserved unless a later packet explicitly changes them.

## Hierarchy

1. Preserve data, content, URL, store identity, and page-family behavior.
2. Establish an exact consumer/load-order/dependency baseline before changing shared code.
3. Apply only behavior-preserving JS guards and structural cleanup whose effect is evidenced.
4. Treat cascade-changing CSS work and file deletion as separate decisions, not cleanup by assumption.
5. Verify representative page families and all Branch5 static routes before release status is considered.

## Commitments

1. Record consumer counts, selector-to-markup mapping, load order, optional dependencies, and repeat-initialization risks.
2. Add narrowly scoped dependency guards and idempotence protections where the existing execution contract is already clear.
3. Remove implicit globals and dead control-flow scaffolding only when the generated output and timing remain equivalent.
4. Keep a rollback point for every implementation batch and use `git diff --check`, syntax checks, repository validators, static route checks, and browser checks.

## Deliberate exclusions

- CONSTRAINT: Do not edit `currently/`, vendor assets, original image-menu source, or Branch5 content solely to improve consistency.
- CONSTRAINT: Do not reduce or reorder the broad `!important` cascade, split `proposal.css`, replace jQuery, or rewrite `document.write` in this packet.
- CONSTRAINT: Do not delete Branch5 files merely because a literal source scan finds no reference; direct URL and comparison-asset status must be separately proven.
- CONSTRAINT: Do not normalize store-local CSS, typography, backgrounds, logos, menu content, or visual asymmetry into a generic design system.
- CONSTRAINT: Do not add dependencies, a build system, bundling, or a framework.
- CONSTRAINT: Do not push, create a PR, merge, or publish.

## Tradeoffs and unknowns

- TRADEOFF: Conservative guards may leave some legacy duplication and unused artifacts in place, but they reduce the probability of changing a comparison page accidentally.
- UNKNOWN: Some captured 404 payloads may be intentionally retained as historical snapshots; their direct public-URL importance is not established.
- UNKNOWN: Formal CSS dead-selector analysis, W3C validation, and real-network performance are not provided by the current local toolchain.
- TRADEOFF: CSS cleanup is limited to evidence-backed no-op structure changes; visual cascade reduction remains a separate high-risk packet.
