# Decision

Change class: SHARED_BASE_REFACTOR

## Scope

Audit all CSS and JavaScript under `proposal/branch5/`, then implement only evidence-backed, behavior-preserving maintainability changes in the shared and page-family files. Keep all page content, URLs, store identity, menu variants, vendor assets, and comparison sources stable.

Execution is staged:

1. Freeze the existing-work and branch-retirement checkpoints.
2. Capture the CSS/JS inventory, consumer matrix, selector map, load order, dependency assumptions, and baseline failures.
3. Implement low-risk JS guards, idempotence protections, and implicit-global cleanup only where execution order is known.
4. Apply CSS structural cleanup only if declaration values, selector boundaries, and computed-style baselines remain unchanged.
5. Re-run static checks, all-route reference checks, and representative browser checks at 390px, 768px, and 1440px.
6. Record residual risks and keep cascade-changing work in the parking lot.

## Target files

- `proposal/branch5/**/*.css` — audit surface; only explicitly evidenced no-op structural edits may be implemented.
- `proposal/branch5/**/*.js` — audit surface; implementation is limited to guards, repeat-safety, and proven equivalent cleanup.
- `basis/README.md`, `basis/WBS.md`, `basis/current_state.md`, `basis/system_spec.md`, `basis/page_list.md`, `basis/cast_photos.md`, `basis/operations.md`, `basis/mece_coverage_matrix.md`, `proposal/GA4_GTM_TRACKING_SETUP.md`, and `tools/validate_repo_contract.py` — already synchronized for branch5-only scope in the preceding documentation checkpoint.
- `basis/work/2026-09-12-branch5-css-js-maintainability/` — evidence and release record.

## State

State: AUDITED

## Gate status

- Source lock: PASS — branch5-only target, currently/vendor/original-menu exclusions, inventory, and consumer matrix are recorded.
- Content and task: PASS — the requested CSS/JS maintainability review is bounded; content, URLs, and store-specific expression are preserved.
- Structure: PASS — staged execution, rollback checkpoints, selector/load-order mapping, and explicit high-risk exclusions are defined.
- Intent: PASS — the visual direction remains the Branch5 source and `DESIGN.md`; no generic normalization is introduced.
- Independent audit: PASS (NON-INDEPENDENT SAME-AGENT REVIEW) — required visual-fidelity and sequential perspective checks are recorded in audit.md; independent human approval is not claimed.
- Release: PASS — local implementation commit is complete; push, PR, merge, and publication are not requested and remain outside this scope.

## Definition of done

- The branch5-only consumer matrix and baseline are complete and reproducible.
- Any changed shared JS is dependency-safe and repeat-safe, with equivalent generated labels, URLs, event content, and page-family behavior.
- No changed CSS declaration value or selector boundary causes an unexplained visual difference.
- `node --check` passes for executable Branch5 JS; known captured 404 payloads are separately reported rather than silently treated as valid JS.
- `python3 tools/validate_repo_contract.py`, `python3 tools/validate_static_contract.py proposal/branch5`, `python3 tools/validate_skill_packages.py`, `python3 tools/validate_work_packets.py`, and `git diff --check` pass.
- Representative root, shop top, JPEG menu, HTML menu, cast, event, recruit, planet-group, and okyuji routes are checked at 390px, 768px, and 1440px where applicable.
- Full Branch5 static route checks report missing resources and external timeouts by route; no blanket PASS is claimed for incomplete external-resource browser runs.
- The required sequential reviews are recorded: strategy, process, architecture, development, security, data, DevOps, UI/UX, knowledge, quality, and operations.
- Audit, retrospective, release state, rollback target, and residual risks are documented.

## Parking lot

- Reduce or remove `!important` only after a selector-level cascade and computed-style baseline.
- Split `proposal.css` or consolidate store CSS only after load order and all active consumers are proven.
- Remove `common.js`, minified legacy CSS, `shop_menu_override.css`, or captured 404 payloads only after direct URL, Git-history, and comparison-asset decisions are recorded.
- Replace `document.write` in cast, event, and planet-group scripts only as a separately tested behavior change.
- Add a CSS parser/dead-selector checker, formal W3C validation, accessibility automation, and performance budgets only as separate toolchain scope.
