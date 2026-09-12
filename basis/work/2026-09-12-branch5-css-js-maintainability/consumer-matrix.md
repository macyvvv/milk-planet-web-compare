# Consumer matrix

Raw reference counts below include source tags found by repository text search; commented or legacy references are marked separately where known. The matrix is a guardrail, not proof that every reference executes.

| Shared source | Raw HTML references | Primary consumers | Load-order / dependency risk | Repeat-init risk | Verification |
| --- | ---: | --- | --- | --- | --- |
| `proposal.css` | 55 | root, shop list, shop tops, JPEG menus, HTML menus, support pages | imported alongside store-local CSS and vendor CSS in different relative paths | low at runtime; cascade order is high risk | exact href inventory + 390/768/1440 representative pages |
| `proposal.js` | 55 | same main page families | depends on DOM markup; optional `jQuery` and `Swiper` paths | navigation/header/anchor listeners need guards | selector-to-markup map + syntax + browser interaction |
| `analytics.js` | 55 | same main page families and footer | `gtag` is optional; `dataLayer` is created locally | document click/submit delegation can duplicate | dataLayer event count + duplicate-load fixture |
| `event.js` | 12 | root and 11 shop tops | requires jQuery, Slick, and Modaal | Slick/Modaal should not initialize twice | plugin-presence matrix + console observation |
| `eventlist.js` | 21 raw | root and 11 shop tops are active; 9 menu references are comment-contained | generated image URLs and pathname mapping | DOM insertion can duplicate generated lists if loaded twice | event node count before/after repeated execution |
| `shop/gallery.js` | 11 | all 11 shop tops | optional Lightbox and jQuery | scroll/load handlers can duplicate | gallery item count + scroll class + console |
| `style.css` | 14 | root and 11 shop tops plus support pages | page-local relative load order | mostly static | href inventory + visual sample |
| `menu-html-common.css` | 26 raw | semantic HTML menu variants and a few source/reference pages | local `system.css` order differs by variant | static | all 11 menu variants at required widths |

## Selector-to-markup checkpoints

- `h1.title` is the visible page title; `h1.seo_h1` on shop tops is a separate SEO role and must not inherit title behavior accidentally.
- `#shopinfo:has(> .menu)` identifies the legacy image-menu grid; shop-top information blocks must not receive it.
- `#gallery > ul.gallery2 > li` is the current shop gallery structure; `.gallery li` is not a valid substitute without evidence.
- `.swiper-container`, `.pullhead-toggle`, `#nav-toggle`, `#global-nav`, `#eventslider`, and `#eventtitle` are optional page-family targets and require presence checks.

## Load-order checkpoints

- Shop tops: jQuery → vendor Swiper/Slick/Modaal/Lightbox → root event list → `event.js` / gallery → analytics → proposal.
- HTML menus: page-local `system.css` and shared menu CSS → analytics → proposal; no event/gallery behavior is assumed.
- Support pages: each page-specific script is audited independently; shared code must tolerate absent optional markup and dependencies.
