# Independent audit

## Compared sources

- `proposal/branch5/shop/melty/menu-html/index_3.html`
- `proposal/branch5/shop/shandy/menu-html/index_3.html`
- `proposal/branch5/shop/shinjuku/menu-html/index_3.html`
- Shandy `menu2-hero.jpg` and existing store CSS
- Shinjuku `menu1-hero.jpg` and existing store CSS
- `DESIGN.md`, `basis/mece_coverage_matrix.md`, `skills/visual-fidelity/SKILL.md`

## Viewports

| Page | 390px | 768px | 1440px | Horizontal overflow |
| --- | --- | --- | --- | --- |
| Melty | PASS | PASS | PASS | None |
| ShandyLove | PASS | PASS | PASS | None |
| milkplanet新宿 | PASS | PASS | PASS | None |

Document widths were 375px, 753px, and 1425px respectively because the browser scrollbar occupies 15px. All pages retained one `h1`, valid same-page anchor targets, no duplicate IDs, and no missing image `alt` values.

## Static checks

- PASS: `python3 tools/validate_static_contract.py` for all three target pages.
- PASS: `python3 tools/validate_repo_contract.py`.
- PASS: `git diff --check`; the repository emits a pre-existing fsmonitor IPC warning but no whitespace failure.
- PASS: `Visual Variant 3` is absent from all three target titles.
- PASS: Shandy has one `main#menu-content`; Melty and Shinjuku retain one main landmark.
- NOT RUN: Formal W3C HTML/CSS validation. No approved repository-integrated validator is available.

## Browser observations

- PASS: Shandy title is now `システム&メニュー | ShandyLove` and the page body is exposed as `main#menu-content`.
- PASS: Shinjuku `.source-masthead` and its image have no CSS border, background, or corner radius at mobile and desktop widths.
- PASS: Shinjuku's original `menu1-hero.jpg` was not changed; the welcome image remains uncropped by this change.
- PASS: Melty selects responsive WebP candidates at 390 / 768 / 1440px and retains the JPEG fallback.
- PASS: At the top of each page, eager images loaded. Lazy images were intentionally incomplete until their sections were reached; after scrolling to the delayed Shinjuku asset, all images completed.
- PASS: Same-page navigation references resolved to existing IDs in all three pages.
- NOT RUN: Browser console log capture was not available through the selected audit surface. Earlier published-page audit had no console warnings or errors.
- NOT RUN: Full keyboard traversal and focus visibility were not repeated in this local correction pass.

## Accessibility and content checks

- PASS: Heading count, `main` landmarks, image `alt` presence, and same-page IDs passed the available DOM checks.
- PASS: Existing CSS contrast results remain unchanged: Melty title approximately 7.80:1, Shandy title approximately 9.67:1, and Shinjuku title approximately 5.01:1.
- LIMITATION: Text embedded inside menu images is not covered by CSS contrast measurement.
- LIMITATION: Melty remains image-led; its `alt` text is a summary and does not expose every price and menu item as HTML. This is an explicit source-authority tradeoff, not an accidental omission in this change.

## Findings

- PASS: The two concrete defects selected for this Scope are corrected: Shandy's public comparison label and missing main landmark, and Shinjuku's CSS-generated hero frame.
- IMPROVED WITH RESIDUAL RISK: Shinjuku no longer has a CSS border/rounded panel, but the JPEG's own background color differs subtly from the page background, so a rectangular color boundary remains visible. Further cropping or repainting would alter the source-derived hero and is excluded.
- PASS: No new generic decoration, invented copy, replacement logo, or image/HTML duplicate was added.
- PASS: Existing Shandy welcome sentence elements and all menu information remain unchanged.

## Residual risks

- Melty's image-led accessibility limitation remains and requires an explicit product/content-owner decision before claiming full content accessibility.
- Shinjuku's faint source logo remains a brand-visibility limitation; replacing it requires source-owner approval.
- Formal W3C validation, keyboard traversal, console capture, real-network performance, item-level source diff, and release ownership remain unverified.
- This change is local only. No commit, push, PR, merge, or published URL verification was performed.
