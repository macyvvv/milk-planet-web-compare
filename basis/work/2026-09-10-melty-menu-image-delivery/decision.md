# Decision

## Scope

Create responsive WebP derivatives for the seven Melty menu sheets and update only `index_3.html` to select them with `picture`, `srcset`, and `sizes`. Preserve the existing JPEG assets and page structure.

## Target files

- `proposal/branch5/shop/melty/menu-html/index_3.html`
- `proposal/branch5/shop/melty/menu/images/optimized/*.webp`
- `basis/work/2026-09-10-melty-menu-image-delivery/`

## State

State: LEARNED

## Gate status

- Source lock: PASS — seven canonical JPEG menu sheets and their existing roles were identified.
- Content and task: PASS — optimization changes delivery format and candidate size only; no menu content is rewritten.
- Structure: PASS — WebP source, JPEG fallback, intrinsic dimensions, lazy policy, and responsive sizes are defined.
- Intent: PASS — Melty's image-led composition and source order remain unchanged.
- Independent audit: PASS — static, visual, responsive, navigation, accessibility, and browser delivery checks are recorded in `audit.md`.
- Release: NOT RUN — external release follows the independent audit.

## Definition of done

- Seven menu sheets have valid WebP 480/720 derivatives; canonical JPEGs remain unchanged.
- `index_3.html` selects WebP where supported and falls back to the original JPEG.
- `srcset`/`sizes` select candidates consistent with the 390, 768, and 1440px layouts.
- Intrinsic dimensions, no-crop rendering, lazy loading, and first-image priority are preserved.
- Browser checks confirm no horizontal overflow, no image failure, no layout shift caused by missing dimensions, working anchors, and accessible navigation.
- Static checks and work-packet audit pass before PR and merge.

## Parking lot

- Automated derivative regeneration when canonical JPEGs change.
- Real-user performance measurement and GitHub Pages cache/waterfall monitoring.
- AVIF comparison after WebP rollout is stable.
