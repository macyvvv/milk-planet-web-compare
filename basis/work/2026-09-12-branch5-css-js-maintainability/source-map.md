# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/proposal.css` | shared layout, navigation, title transition, responsive overrides | shared presentation layer | 構造監査・値を変えない範囲のみ実装 | source CSS | 779 lines / 19,900 bytes / 343 `!important`; cascade-changing cleanup deferred |
| `proposal/branch5/proposal.js` | navigation generation, fixed header, anchors, accordions, carousels | shared behavior layer | consumer-aware guard and maintainability review | source JS | 379 lines / 13,732 bytes; 55 raw HTML references |
| `proposal/branch5/analytics.js` | delegated UI/form/outbound tracking | shared behavior layer | duplicate-registration guard if baseline permits | source JS | 145 lines / 4,768 bytes; 55 raw HTML references |
| `proposal/branch5/event.js` | Slick and Modaal initialization | optional-plugin behavior layer | per-plugin dependency and repeat-init guard | source JS | 86 lines / 3,461 bytes; 12 raw HTML references |
| `proposal/branch5/eventlist.js` | event markup and event image list generation | shared event data/rendering layer | implicit-global and invalid-state review | source JS | 189 lines / 4,709 bytes; root file is the active shop-top source |
| `proposal/branch5/shop/gallery.js` | lightbox options and gallery fade | shop-top behavior layer | dependency, selector, and repeat-init review | source JS | 44 lines / 1,133 bytes; 11 shop-top references |
| `proposal/branch5/shop/*.css` | shared shop list and store-top presentation | page-family presentation | consumer/load-order audit; no normalization | source CSS | `shop.css` 898 lines; store-local CSS retains identity |
| `proposal/branch5/shop/menu-html-common.css` | semantic HTML menu presentation | HTML-menu shared presentation | consumer/load-order audit | source CSS | 66 lines / 7,799 bytes / 27 `!important` |
| `proposal/branch5/shop/*/menu/index_0.html` | preserved JPEG menu comparison pages | regression source | verify only | image-menu source | local `../eventlist.js` references are inside HTML comments in the affected pages; they are not active script loads |
| `proposal/branch5/shop/*/menu-html/index*.html` | semantic HTML menu variants | regression source | verify only | HTML-menu source | visible `h1.title` and shared menu CSS must remain intact |
| `proposal/branch5/shop/*/eventlist.js` | captured 404 HTML responses with a `.js` suffix | stale external snapshot artifact | exclude from executable checks; retain pending deletion approval | historical artifact | 9 files fail JS syntax; current shop-top pages resolve the root `proposal/branch5/eventlist.js`; legacy JPEG-menu references are comments |
| `proposal/branch5/common.js`, `common.min.css`, `proposal.min.css`, `style.min.css`, `shop_menu_override.css` | possible unused legacy assets | deletion candidates | direct URL/consumer audit only | unknown | literal source scan found no active Branch5 consumer for these names; deletion is not assumed |
