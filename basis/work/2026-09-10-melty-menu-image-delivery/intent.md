# Change

MeltyMousse menu image delivery optimization for `index_3.html`.

## Viewing situation

- FACT: `index_3.html` presents seven tall menu sheets as the primary content.
- FACT: the current source JPEGs total approximately 4.99MB and are 1200×1697, while the page renders most sheets at 720px or less.
- CONSTRAINT: the existing visual composition, image order, and source JPEGs must remain intact.

## Business and human outcome

- USER: reduce first-view and full-page menu transfer cost without changing the established Melty presentation.
- INFERENCE: smaller image candidates reduce wait time and data use before a visitor can read prices or decide whether to visit.
- CONSTRAINT: the optimization must not introduce a second editable content source or alter menu meaning.

## Source lock

- FACT: `proposal/branch5/shop/melty/menu/images/menu1.jpg` through `menu6.jpg` and `menu4.5.jpg` are the canonical menu sheets.
- FACT: the existing JPEG files remain the fallback and rollback source.
- FACT: WebP derivatives were measured at quality 82 with visual inspection of text, lace, illustrations, and promotional photography.

## Hierarchy

1. Keep the existing title, category index, and menu-sheet order.
2. Deliver only the image candidate appropriate to the rendered width.
3. Keep the first menu sheet eager and defer the remaining sheets until needed.

## Commitments

1. Add WebP sources through `picture` with an unchanged JPEG fallback.
2. Use responsive `srcset`/`sizes` candidates and preserve intrinsic dimensions to prevent layout shift.
3. Verify transfer candidates, image integrity, visual fidelity, anchors, navigation, and responsive overflow before release.

## Deliberate exclusions

- Do not overwrite or delete canonical JPEGs.
- Do not crop, retouch, recolor, or transcribe the menu sheets.
- Do not modify shared CSS, other stores, or the existing `index.html`.
- Do not add preload hints for every image; lazy loading remains the primary below-the-fold control.

## Tradeoffs and unknowns

- FACT: WebP quality 82 reduces bytes substantially in local conversion tests while retaining readable menu text at the tested display sizes.
- TRADEOFF: additional derivative files increase repository asset count and require regeneration when source JPEGs change.
- UNKNOWN: exact field performance varies by browser cache, connection, and GitHub Pages edge; local byte comparison is not a substitute for real-user metrics.
