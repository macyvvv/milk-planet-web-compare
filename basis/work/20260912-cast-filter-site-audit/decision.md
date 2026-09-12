# Decision

## Scope

- Repair the Branch5 cast store controls and filter lifecycle.
- Run a whole-site audit over all Branch5 HTML pages, linked CSS/JS, local image/media references, navigation/anchors, generated references, and required responsive/browser checks.
- Record findings in this packet. Only findings that are required to complete the requested repair may be fixed in this change.

Change class: PHILOSOPHY_LEARNING

## Target files

- `proposal/branch5/cast/index.html`
- `proposal/branch5/cast/cast.css`
- `proposal/branch5/cast/castlist.js`
- `basis/work/20260912-cast-filter-site-audit/*`
- `basis/decision_log.md` if the functional/structural decision is confirmed.

Target excluded: `currently/**`, original menu-image comparison roots, external services, deployment configuration.

## State

State: AUDITED

## Gate status

- Source lock: PASS — source assets, requirements, and comparison baseline identified.
- Content and task: PASS — user requested cast repair plus whole-site audit.
- Structure: PASS — cast markup/data boundaries are deterministic; whole-site static inventory completed with residual findings recorded below.
- Intent: PASS — existing information hierarchy is preserved; no new visual direction is introduced.
- Independent audit: PASS — cast behavior, assets, responsive widths, runtime logs, and Branch5 references were rechecked.
- Release: NOT RUN — no external release requested.

## Definition of done

- Filter icons render from valid local image sources at usable sizes at 390px, 768px, and 1440px.
- Selecting each store updates the selected state and displays only matching cast cards; direct hash navigation works.
- Cast generation preserves the existing data and card order.
- Branch5 all-page audit has an inventory, executed checks, findings, confidence, severity, and residual risks.
- `python3 tools/validate_repo_contract.py` passes.
- Work packet validator passes for the final state.
- No unrelated files are modified.
- Release states remain explicitly unrequested/unverified.
- Residual site-wide findings remain outside this packet's repair scope and are not represented as fixed.

## Philosophy gate

- Coverage: `proposal/branch5/cast/`, all Branch5 HTML routes, shared Branch5 assets and scripts, `currently/cast/` as a read-only comparator, and shared consumers of `proposal.js`/`proposal.css`.
- LOCAL: Empty store-logo markup and cast filter initialization are local to the cast page.
- STRUCTURAL: Shared-page audits must validate active consumers and runtime-generated references, not only filenames or source strings.
- UNKNOWN: Browser interaction coverage depends on whether a browser connection is available during verification.

## Coverage

- Existing modified page: `proposal/branch5/cast/index.html`.
- Comparison baseline: `currently/cast/index.html` and `currently/cast/cast.css`.
- Shared consumers: Branch5 HTML files loading `proposal.css`, `proposal.js`, shared assets, and global navigation.

## Parking lot

- Deployment/publish verification.
- Unrelated historical assets and stale generated reports unless they are actively referenced or cause a validator failure.
- Full content freshness review of external business data.
