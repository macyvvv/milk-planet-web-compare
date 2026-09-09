# Retrospective

## Observed event

The first implementation rendered correctly at a glance but contained an empty introductory wrapper that inflated the first section's spacing, and the category index was placed after the long main menu sheet. The footer iframe also produced horizontal overflow because shared footer padding was applied outside a `width: 100%` box.

## Detection phase

- Footer overflow: Check / Independent audit.
- Empty wrapper and late category index: Check / mobile browser visual review.

## Missed gate or cause

The pre-build intent gate established source preservation and semantic structure, but it did not explicitly require a first-viewport information-path review or a padded full-width iframe check. The initial implementation followed the source order but treated the category index as a secondary block rather than as a task accelerator.

## Generalizable rule

For image-led static pages:

1. inspect the first viewport as a task path, not only as a visual composition;
2. place navigation before the first long content surface when users may need to jump categories;
3. flag empty structural wrappers as spacing defects;
4. audit every full-width iframe or replaced element with padding under `box-sizing: content-box` as a likely overflow boundary;
5. verify mobile, tablet, and desktop widths after any structural move.

## Skill or validator change

This case is recorded for the Planet workflow as a reusable audit rule. The next workflow/visual-fidelity update should add an explicit first-viewport path check, empty-wrapper check, and padded full-width embedded-element check to the post-build gate. No shared CSS change is required for this page-local defect.

## Follow-up

- Add a formal W3C validator integration to the repository parking lot.
- When the page family is next generalized, add an automated check for empty layout wrappers and `width: 100%` elements with non-border-box padding.
