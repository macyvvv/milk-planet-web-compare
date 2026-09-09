# Independent audit

## Compared sources

- FACT: the existing Melty source page is an image-led page with seven menu sheets: `menu1.jpg`, `menu2.jpg`, `menu3.jpg`, `menu4.jpg`, `menu4.5.jpg`, `menu5.jpg`, and `menu6.jpg`.
- FACT: the implementation keeps all seven sheets as images and adds only semantic headings, a local index, accessible summaries, and layout behavior around them.
- FACT: the existing Melty logo and lace transition are reused; no new hero image, illustration, price, or product copy was invented.
- OBSERVATION: the first menu sheet is presented as the primary lead after the title and category index; the two original-champagne sheets retain a two-column desktop presentation and become one column on narrow screens.

## Viewports

Browser viewport overrides were applied and reset after the checks.

| Width | Inner width | Client width | Document width | Horizontal overflow | First sheet width | Special grid |
| ---: | ---: | ---: | ---: | :---: | ---: | --- |
| 390 | 390 | 375 | 375 | No | 347 | 1 column |
| 768 | 768 | 753 | 753 | No | 720 | 1 column |
| 1440 | 1440 | 1425 | 1425 | No | 720 | 2 columns |

- FACT: all menu images use width-constrained, height-auto rendering; no CSS crop or `object-fit: cover` is used.
- FACT: all six category anchors plus the main-menu anchor resolved in browser checks; each target reached the expected section with the fixed-header offset.

## Static checks

- PASS: `python3 tools/validate_repo_contract.py` — `Checked 14 files and 7 directories.`
- PASS: `node --check proposal/branch5/proposal.js`.
- PASS: image reference and natural-size checks — seven menu sheets and the existing Melty logo resolve; every source sheet is 1200×1697.
- PASS: `git diff --check` apart from the pre-existing fsmonitor IPC warning, which does not indicate whitespace errors.
- NOT RUN: formal W3C validator. The repository has no integrated validator and no validator result was assumed; structural and browser checks are recorded instead.

## Browser observations

- PASS: desktop top view shows the existing Melty identity, restrained pink title surface, lace boundary, category index, and the first source menu sheet without a synthetic card frame.
- PASS: mobile view keeps the logo/title/header readable, places the category index immediately below the title, and reduces the source sheet to the available content width.
- PASS: the navigation button opens and closes at 390px. `aria-expanded`, `aria-label`, header state, and menu visibility changed together.
- PASS: direct navigation to `#main-menu`, `#newcomer`, `#drink`, `#champagne`, `#food`, and `#special` resolved to unique sections; lazy images loaded as their sections were reached.
- PASS: after the audit loop, the page has no horizontal overflow at 390, 768, or 1440px.

## Accessibility and content checks

- PASS: exactly one `h1` is present, followed by six category `h2` headings.
- PASS: the skip link targets `#menu-content`; the local index has a descriptive `aria-label`; the global navigation has a descriptive `aria-label`.
- PASS: all seven menu sheets have non-empty Japanese alt summaries describing their category and key price/content purpose; the existing logo has identity alt text.
- PASS: CSS text contrast measured above WCAG AA thresholds for the main combinations: ink on page background 10.16:1, deep pink on page background 6.94:1, and ink on title background 7.80:1.
- FACT: text embedded inside the source images is not independently assessed by CSS contrast measurement; preserving the source composition is an explicit tradeoff.

## Findings

1. Fixed during audit: the common footer iframe's padded box caused desktop horizontal overflow. A page-local `box-sizing: border-box` correction removed it without changing shared CSS.
2. Fixed during audit: an empty `.menu-intro` wrapper created avoidable leading space. It was removed so spacing comes from the actual section structure.
3. Fixed during audit: the category index originally followed the full main sheet. It now appears immediately after the title, reducing exploration cost for visitors seeking a specific category.
4. Accepted tradeoff: the page remains image-led, so exact menu text is not HTML-searchable. This avoids creating a second, potentially divergent price/content source.

## Residual risks

- Formal W3C validation remains a repository-level follow-up.
- Menu text and prices remain coupled to the seven source images; future content ownership should be decided before introducing an HTML transcription.
- Public GitHub Pages verification is pending the release step and is not inferred from the local browser result.
