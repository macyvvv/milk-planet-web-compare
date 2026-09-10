# Independent audit

## Compared sources

- Previous released page: `proposal/branch5/shop/melty/menu-html/index_3.html` before the delivery-only change.
- Canonical source sheets: `proposal/branch5/shop/melty/menu/images/menu1.jpg`, `menu2.jpg`, `menu3.jpg`, `menu4.jpg`, `menu4.5.jpg`, `menu5.jpg`, and `menu6.jpg`.
- The seven JPEGs remain unchanged and remain the `<img src>` fallback. The change adds a WebP delivery layer; it does not rewrite menu content, crop the sheets, or alter section order.

## Viewports

Browser checks were run at requested viewport widths 390px, 768px, and 1440px.

| Requested width | `clientWidth` | `scrollWidth` | Horizontal overflow | Main sheet candidate | Special-sheet candidate |
| ---: | ---: | ---: | :--- | :--- | :--- |
| 390 | 375 | 375 | No | `menu1-720.webp` | `menu5-480.webp` |
| 768 | 753 | 753 | No | `menu1-720.webp` | `menu5-720.webp` |
| 1440 | 1425 | 1425 | No | `menu1-720.webp` | `menu5-720.webp` |

The 15px difference between requested width and `clientWidth` is the browser scrollbar. Candidate selection can vary with browser heuristics, cache, and device pixel ratio; every selected candidate was a valid declared WebP asset and no layout overflow occurred.

## Static checks

- Seven `<picture>` blocks were found, one for each menu sheet; each declares WebP candidates and retains a JPEG fallback.
- All 14 WebP files are valid WebP images. The 480px candidates are 480×679 and the 720px candidates are 720×1018.
- Canonical JPEG total: 4,993,082 bytes.
- WebP 480px total: 272,052 bytes, a 94.6% reduction against the JPEG total.
- WebP 720px total: 445,622 bytes, a 91.1% reduction against the JPEG total.
- Both deployed candidate sets total 717,674 bytes, an 85.6% reduction against the canonical JPEG total.
- `python3 tools/validate_repo_contract.py`: PASS.
- `node --check proposal/branch5/proposal.js`: PASS.
- `git diff --check`: PASS for the task changes; the repository still emits the pre-existing fsmonitor IPC warning.

## Browser observations

- Chrome selected local WebP candidates through `picture`/`srcset`; all seven menu images completed successfully after their sections were reached.
- Direct navigation to `#main-menu`, `#newcomer`, `#drink`, `#champagne`, `#food`, and `#special` resolved to the intended sections, and the corresponding images completed.
- The navigation menu opened with `aria-expanded="true"` and the label `めにゅうを閉じる`, then closed with `aria-expanded="false"` and the label `めにゅうを開く`; the closed menu was hidden.
- Mobile visual inspection at 390px preserved the pink Melty identity, logo/title hierarchy, category index, image-led menu presentation, readable sheet text, and uncropped image boundaries.
- No horizontal overflow was observed at any tested viewport.
- Browser console audit returned no warnings or errors.

## Accessibility and content checks

- Existing heading hierarchy, link targets, navigation semantics, alt text, and visible page copy were preserved.
- Intrinsic `width`/`height` attributes remain on every fallback `<img>`, so image loading has a reserved aspect ratio.
- The first sheet remains eager and receives `fetchpriority="high"`; subsequent sheets remain lazy-loaded.
- WebP is used only as an alternate source. Browsers without WebP support can use the original JPEG fallback.
- A formal external W3C validator was not run because this repository has no integrated validator command; the repository contract and browser checks were used as the available static/behavioral gates.

## Findings

- PASS — The page remains structurally and visually equivalent while reducing image transfer candidates substantially.
- PASS — Right-sized 480/720px candidates are based on the page's actual rendered width rather than blindly replacing the source files.
- PASS — Text-heavy menu sheets remained legible at the tested mobile display size after quality-82 WebP conversion.
- PASS — The canonical JPEGs are preserved, making the change reversible and avoiding a content-authority change.

## Residual risks

- Exact user-perceived speed improvement depends on cache state, browser support, connection quality, and GitHub Pages delivery; no real-user waterfall or RUM data is available.
- WebP derivatives must be regenerated if a canonical JPEG changes. Automated regeneration is intentionally left in the parking lot.
- Formal W3C validation remains a follow-up once an approved validator is available in the repository workflow.
