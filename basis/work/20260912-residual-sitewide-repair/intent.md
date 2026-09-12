# Change

2026-09-12: Resolve approved residual Branch5 site-wide defects outside the cast page.

## Viewing situation

- USER: Resolve the remaining site-wide issues found in the previous Branch5 audit.
- FACT: The previous audit found an unavailable `w_shop.png`, duplicate HTML attributes, missing footer alternatives, invalid line-break closing tags, and a duplicate recruit ID.
- CONSTRAINT: `currently/` and `proposal/branch5/shop/<store>/menu/` are comparison references and remain unchanged.

## Business and human outcome

- USER: Visitors can understand the shop list, use shared footer shop links with assistive technology, and reach the recruit content without ambiguous anchors.
- INFERENCE: Removing broken decorative references and repairing structure reduces presentation noise and increases trust in the site as a decision-support surface.

## Source lock

- FACT: No canonical `w_shop.png` exists in either the Branch5 asset set or the current comparison asset set.
- FACT: `proposal/branch5/images/index.png` is the shared patterned background used by neighboring legacy menu CSS files; it is not a substitute for the missing shop ornament.
- FACT: The 13 shop wrappers are intended to carry both `shop` and `content` classes because both selector families are used by `shop.css`.
- FACT: The two recruit blocks share the `#about` presentation rules, but only one unique fragment target is needed.

## Hierarchy

1. Page title and shop/recruit section identity.
2. Shop cards and their existing store-specific content.
3. Shared footer shop links.
4. Recruit copy and application content.

## Commitments

1. Remove broken references without inventing replacement visual assets.
2. Repair HTML structure while preserving existing content, links, classes, order, and visual rules.
3. Re-run complete static checks and representative browser checks at 390px, 768px, and 1440px.

## Deliberate exclusions

- No changes to `currently/**`.
- No changes to `proposal/branch5/shop/<store>/menu/**`, which remains the image-menu comparison source.
- No deletion or replacement of stale legacy `.js` or CSS files in the comparison source.
- No new external dependency, image-generation step, publish, push, PR, merge, or deployment.

## Tradeoffs and unknowns

- INFERENCE: Removing the unavailable shop ornament is safer than substituting an unrelated logo or generating a new decorative asset.
- UNKNOWN: The historical source of `w_shop.png` is not recoverable from the repository; the missing asset also exists in the read-only current CSS without a local file.
- UNKNOWN: External font, analytics, and social embed availability remains outside local verification.

## Principle under test

- STRUCTURAL: Fix the active consumer and its semantic contract first; do not repair comparison-only remnants by changing the comparison source.

## No-change option

- Keep all residual findings and report them. Rejected because active duplicate attributes, missing accessibility labels, and a broken active CSS reference remain user-visible or structurally unsafe.

## Transfer boundary

- Apply the active-consumer versus comparison-source distinction to future asset audits. Do not generalize removal of missing decorative assets where a canonical source exists.
