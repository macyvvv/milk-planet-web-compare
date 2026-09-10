# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/proposal.css` | Shared navigation, page-family boundaries, title transition, and responsive overrides | shared presentation layer | Structural cleanup only | source CSS | Declaration values remain unchanged; broad `!important` cleanup is deferred. |
| `proposal/branch5/proposal.js` | Navigation data, header shrink, anchors, accordions, and carousel initialization | shared behavior layer | Extract helpers/data and add repeat-safe guards | source JS | 44 consumers; labels, URLs, and carousel options must remain unchanged. |
| `proposal/branch5/shop/gallery.js` | Lightbox options and shop gallery fade helper | shop-top behavior layer | Guard optional dependencies, match `gallery2`, coalesce scroll work | source JS | 11 consumers; actual markup is `#gallery > ul.gallery2 > li`. |
| `proposal/branch5/shop/<store>/index.html` | Store-top gallery markup and navigation shell | consumer evidence | Verify only | existing HTML | No HTML changes; representative and full route smoke audit required. |
| `proposal/branch5/shop/<store>/menu/index.html` | Canonical JPEG menu pages | regression source | Verify only | image-menu source | Legacy image-grid boundary must remain active. |
| `proposal/branch5/shop/<store>/menu-html/index*.html` | Semantic HTML menu pages | regression source | Verify only | HTML-menu source | Visible `h1.title` behavior must remain active. |
