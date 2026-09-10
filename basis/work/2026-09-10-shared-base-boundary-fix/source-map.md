# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/proposal.css` | Shared title, menu-grid, and layout overrides | shared presentation layer | Narrow selectors by semantic/page-family boundary | source CSS | 44 HTML consumers; selector changes require cross-family regression. |
| `proposal/branch5/proposal.js` | Header/title shrink behavior and carousel initialization | shared behavior layer | Select visible titles only | source JS | 44 HTML consumers; menu navigation and carousel behavior must remain unchanged. |
| `proposal/branch5/shop/gallery.js` | Lightbox/fade helper for shop galleries | store-top behavior layer | Remove invalid editor-only prefix | source JS | 11 shop-top consumers; no behavior rewrite in scope. |
| `shop/<store>/index.html` | Store hero, SEO heading, shop information, carousel | store-top page family | Preserve content and carousel; receive corrected shared boundaries | existing HTML | 11 pages; local `.seo_h1` hidden rule remains authoritative. |
| `shop/<store>/menu/index.html` | Canonical JPEG menu sheets | comparison source | Verify only; do not edit | image-menu source | 11 pages; `.menu` direct-child marker preserves the grid. |
| `shop/<store>/menu-html/index*.html` | Semantic menu variants | visible title page family | Verify only; retain `h1.title` behavior | HTML menu source | 15 pages; no content or image role changes. |
