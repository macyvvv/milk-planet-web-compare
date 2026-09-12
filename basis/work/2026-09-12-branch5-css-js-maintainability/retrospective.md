# Retrospective

## Observed event

The repository had pre-existing uncommitted Branch5 work, superseded proposal branches, canonical documents still naming branch1, a large shared CSS cascade, and `.js` paths containing captured 404 HTML responses.

## Detection phase

Detected during preflight and Observe: dirty-tree checkpoint, path verification, document/validator synchronization, CSS/JS inventory, reference scan, and syntax inspection.

## Missed gate or cause

The previous refactor history shows that link-only inspection and single-page browser checks are insufficient for shared web assets. Filename-based assumptions also misclassify captured remote error pages as executable JavaScript.

## Generalizable rule

Before refactoring a shared static site, freeze existing work, separate current scope from historical branches, inventory every consumer and load order, validate file content rather than extension, and distinguish safe runtime guards from cascade or deletion changes.

## Skill or validator change

This packet applies the existing Planet workflow and visual-fidelity routing. A future validator may add content-signature checks for script/style assets, but that is not introduced inside this implementation packet without a separately tested design.

## Follow-up

Use the packet's consumer matrix for every subsequent shared CSS/JS batch. Keep CSS cascade reduction, dead-file deletion, `document.write` replacement, formal validators, and performance budgets as separate approved work.

## Implementation outcome

- The low-risk batch was detected and completed in Act without changing markup, content, URLs, or CSS declarations.
- The browser Check exposed an existing planet-group generated-image gap that was not part of this refactor and cannot be safely repaired by naming similarity alone.
- The reusable rule is to treat generated asset URLs as a separate content/asset lineage check; passing source-level CSS/JS checks does not imply that document.write-generated image URLs exist.
- The nine store-local eventlist.js files were reclassified from UNKNOWN to stale, non-executed snapshots after checking the actual HTML comment context and current shop-top script paths.
- The mitigation for missing images is an explicit source/owner gate, not reuse of a same-named image from a different page family.
