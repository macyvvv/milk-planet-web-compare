# Decision

## Scope

- Resolve active Branch5 residual findings from the previous whole-site audit.
- Preserve all comparison-only sources and stale legacy remnants under the repository contract.
- Re-audit active local references, structure, accessibility, syntax, and representative browser states.

Change class: PHILOSOPHY_LEARNING

## Target files

- `proposal/branch5/index.html`
- `proposal/branch5/footer.html`
- `proposal/branch5/recruit/index.html`
- `proposal/branch5/recruit/recruit.css`
- `proposal/branch5/shop/index.html`
- `proposal/branch5/shop/shop.css`
- `basis/work/20260912-residual-sitewide-repair/*`
- `basis/decision_log.md`

Target excluded: `currently/**`, `proposal/branch5/shop/<store>/menu/**`, external services, deployment configuration.

## State

State: AUDITED

## Gate status

- Source lock: PASS — affected active consumers, comparison boundaries, and existing asset evidence were rechecked.
- Content and task: PASS — user approved the residual-fix scope.
- Structure: PASS — repair preserves links, store order, content, and comparison-source boundaries; active HTML structure checks are clean.
- Intent: PASS — no new visual direction or fabricated asset is introduced.
- Independent audit: PASS — static and real-browser checks are recorded in `audit.md`; excluded stale comparison references are classified separately.
- Release: NOT RUN — no external release requested.

## Definition of done

- Active Branch5 CSS and HTML local references have no missing targets.
- Shop title has no broken `w_shop.png` reference and no unnecessary empty decorative box.
- Footer store-logo links have useful alt text.
- Recruit has a unique about ID while both about blocks retain intended styling.
- Shop wrappers have valid combined class attributes.
- All five invalid `</br>` tags are normalized.
- `currently/` and image-menu comparison roots are unchanged.
- Static checks, contract validation, work-packet validation, and browser checks at 390/768/1440 pass or are explicitly recorded.
- No publish, push, PR, or merge is performed.

## Philosophy gate

## Coverage

- Coverage: active Branch5 root, footer, recruit, shop list, shared CSS, and comparison-source boundaries.
- LOCAL: Missing shop ornament treatment and recruit about styling are page-family-specific.
- STRUCTURAL: Duplicate attributes and missing accessibility metadata are repaired at their active HTML contract.
- UNKNOWN: Historical source and rights for the missing `w_shop.png` are unresolved.

## Parking lot

- Repair or retire legacy comparison-root `eventlist.js` and `system.css` remnants only if the repository contract is explicitly changed.
- External dependency and live deployment verification.
