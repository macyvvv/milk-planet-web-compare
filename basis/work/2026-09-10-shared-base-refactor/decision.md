# Decision

## Scope

Apply a conservative maintainability refactor to the three previously touched shared files. Preserve all current visual declarations, page content, destinations, and carousel configuration.

## Target files

- `proposal/branch5/proposal.css`
- `proposal/branch5/proposal.js`
- `proposal/branch5/shop/gallery.js`
- `basis/decision_log.md`
- `basis/work/2026-09-10-shared-base-refactor/`

## State

State: AUDITED

## Gate status

- Source lock: PASS — target files and their 44/11 consumer groups were inspected.
- Content and task: PASS — refactor scope preserves content, URLs, and current page-family boundaries.
- Structure: PASS — helper/data extraction, initialization guards, dependency guards, and CSS-only structural cleanup are bounded.
- Intent: PASS — no new visual direction or store normalization is introduced.
- Independent audit: PASS — representative responsive browser checks, gallery scroll behavior, console observation, and static validation completed; the partial 44-route sequential smoke limitation is recorded in `audit.md`.
- Release: NOT RUN — commit, push, PR, merge, and publish are not included in this approval.

## Definition of done

- Navigation labels and destinations are equivalent in generated DOM behavior.
- Shared initializers are repeat-safe and event handlers do not assume `event.target` is an Element.
- Gallery options do not throw when lightbox is unavailable; the fade helper targets actual `gallery2` items and coalesces scroll work.
- CSS declaration values and page-family boundaries remain unchanged, apart from merging adjacent equivalent media blocks and removing dead whitespace/comments.
- Syntax checks, repository/static validators, diff checks, full route smoke, and representative 390/768/1440px browser checks pass.
- Audit observations, residual risks, retrospective, and release state are recorded.

## Parking lot

- Remove or reduce the 342 `!important` declarations only after a per-selector cascade baseline is captured.
- Split `proposal.css` into shared semantic layers only after all consumers and load order are mapped.
- Move navigation data to a generated/source-controlled data file only if a single source of truth is required across other branches.
- Add formal W3C validation and performance measurement to the repository toolchain.
