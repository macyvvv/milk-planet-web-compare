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

