# Independent audit

## Compared sources

- `AGENTS.md`, `basis/README.md`, `basis/WBS.md`, `basis/current_state.md`, `basis/system_spec.md`, and `DESIGN.md`
- Branch5 CSS/JS inventory and `consumer-matrix.md`
- Prior shared-base boundary and maintainability packets, including their known regression and timeout risks
- `proposal/branch5` HTML, CSS, JavaScript, vendor references, and current working-tree diff

## Viewports

- NOT RUN — implementation has not completed. Required widths are 390px, 768px, and 1440px.
- Planned representative families: root, shop list, Shinjuku shop top, Bloody shop top, JPEG menu, HTML menu, cast, event, recruit, planet-group, and okyuji.

## Static checks

- PASS — `python3 tools/validate_repo_contract.py` after the branch5 scope synchronization.
- PASS — `python3 tools/validate_static_contract.py proposal/branch5` baseline.
- PASS — `python3 tools/validate_skill_packages.py` baseline.
- PASS — `python3 tools/validate_work_packets.py` before this packet was added.
- PARTIAL — `node --check` exposes nine store-local `.js` paths containing captured 404 HTML; the root active `proposal/branch5/eventlist.js` and other executable files are checked separately in the implementation phase.
- PASS — `git diff --check` for the scope/documentation checkpoints.

## Browser observations

- NOT RUN — the implementation audit will use a repository-root local HTTP server so vendor-relative paths resolve correctly.
- Browser completion will distinguish visual completion from external-resource timeout. A timeout on one route will not be promoted to a site-wide PASS.

## Accessibility and content checks

- NOT RUN — no content, URL, title, alt text, menu variant, or store-specific expression is intended to change.
- Planned checks include visible title/SEO heading separation, keyboard menu operation, generated submenu labels/URLs, event node presence, gallery item count, and no horizontal overflow.

## Findings

- OPEN — CSS/JS inventory and consumer matrix show a high-risk shared cascade and several legacy artifacts; implementation must remain staged.
- OPEN — nine store-local `eventlist.js` files are 404 HTML snapshots, not executable JS. Their live execution status is not inferred from the extension; reference context is recorded in `source-map.md`.
- OPEN — literal unreferenced candidates exist, but deletion is deferred pending direct-URL and historical-asset checks.

## Residual risks

- External fonts, widgets, and vendor scripts can prevent complete browser load states.
- Broad `!important` precedence and differing relative CSS load orders remain unchanged.
- `document.write`-based scripts and legacy menu snapshots remain high-risk behavior boundaries.
- Formal W3C, real-network performance, and business KPI validation remain outside this packet.
- This document is the same-agent pre-audit record until a post-build review is completed; the final audit must explicitly state whether the reviewer was independent.

