# Decision

## Scope

Update the shared system submenu's ten visible store labels under one naming policy. The initial candidate is `店舗名｜地域`; if browser evidence shows harmful wrapping or redundancy, use the same official-identifier-only rule for every entry. Preserve all destinations, ordering, generated submenu behavior, and other navigation groups.

## Target files

- `proposal/branch5/proposal.js`
- `basis/decision_log.md`
- `basis/work/2026-09-10-system-menu-region-labels/`

## State

State: AUDITED

## Gate status

- Source lock: PASS — store title/address evidence and the shared menu source were inspected.
- Content and task: PASS — user selected the uniform region-label direction and specified `ラオス`.
- Structure: PASS — only display strings in `SYSTEM_MENU_ITEMS` are in scope.
- Intent: PASS — improves scan consistency without inventing a new visual direction.
- Independent audit: PASS — the initial suffix variant and the approved fallback were checked in the browser at required widths; the final no-suffix variant avoids the observed word fragmentation and preserves existing store identifiers.
- Release: NOT RUN — external release is not included in this approval.

## Definition of done

- All ten system-menu labels use the same final display rule: the official store identifier only.
- `CyBAR planet LAOS` remains the identifier, with no additional suffix.
- Existing URLs, order, submenu count, ARIA state, and remote shopping labels remain unchanged.
- No clipping, unintended overflow, or unacceptable wrapping occurs at 390px, 768px, or 1440px.
- JavaScript, repo, static, Skill, and work-packet checks pass; audit and residual risks are recorded.

## Decision update after browser audit

- FACT: At 390px, the suffix variant wrapped long overseas labels into multiple lines and split `ラオス` within the word.
- DECISION: Adopt the approved fallback: remove the auxiliary region suffix from all ten entries. Keep `BKK` and `LAOS` because those are already part of the existing store identifiers.
- REASON: The fallback provides one consistent display rule, preserves official identifiers and URLs, and reduces mobile navigation density.

## Parking lot

- Reconsider whether official overseas identifiers should be shortened if user testing shows BKK/バンコク repetition is confusing.
- Move store display metadata to a shared data source only if another page family needs the same region model.
