# Change

Branch5 shared-base boundary repair for the 44 pages that load `proposal.css` and `proposal.js`, plus the 11 shop-top pages that load `gallery.js`.

## Viewing situation

- FACT: The shared title rule currently selects both `h1.title` and `h1.seo_h1`.
- FACT: The 11 shop-top pages use `h1.seo_h1` as a visually hidden SEO heading, while menu pages use `h1.title` as the visible page heading.
- FACT: The shared `#shopinfo` grid rule targets both image-menu pages and shop-top information pages.
- FACT: The shop-top pages load a `gallery.js` file whose first two lines are non-JavaScript editor text.
- USER: Repair the shared-base defects identified by the complete impact audit.

## Business and human outcome

- CONSTRAINT: A shop visitor must see the store hero, store identity, access information, and menu route without an SEO-only heading creating a large unintended title region.
- INFERENCE: Removing unintended desktop overflow and title displacement reduces friction before a visitor can compare a shop or check visit information.
- CONSTRAINT: Existing shop-specific imagery, carousel order, menu routes, and store identity remain intact.

## Source lock

- FACT: `proposal/branch5/proposal.css`, `proposal.js`, and `shop/gallery.js` are the deployed shared sources for this scope.
- FACT: `proposal/branch5/shop/<store>/menu/` remains the canonical image-menu comparison source and is not edited.
- FACT: `DESIGN.md`, the existing shop pages, and the published browser observations are the visual and structural references.

## Hierarchy

1. Keep the store hero and store-specific carousel as the first visual entry point.
2. Keep visible menu-page titles under the shared title behavior.
3. Keep SEO-only headings available to assistive/semantic consumers without applying the visible title layout.
4. Keep shop-top information layout separate from the image-menu grid.

## Commitments

1. Restrict shared title CSS/JS behavior to `h1.title`.
2. Restrict the shared image grid to `#shopinfo` containers that directly contain legacy `.menu` images.
3. Remove only the invalid editor text from `gallery.js`, then verify all 11 consumers and preserve carousel behavior.

## Deliberate exclusions

- Do not change any store carousel source, slide order, or commented-out candidate slide.
- Do not modify canonical JPEG menu pages, menu images, store-local CSS, or HTML menu content.
- Do not change SEO heading text, metadata, navigation destinations, or external social embeds in this change.
- Do not regenerate or maintain `proposal.min.css`; no page in the audited scope references it.

## Tradeoffs and unknowns

- FACT: `:has(> .menu)` is supported by the target modern browser environment and allows the page-family boundary to be expressed without adding a marker class to 11 legacy pages.
- TRADEOFF: The selector is more explicit than the former broad `#shopinfo` rule but depends on modern CSS support; the existing fallback is the original local shop CSS.
- UNKNOWN: Formal W3C validation is not available in the local toolchain; equivalent static checks and browser observations are required.
