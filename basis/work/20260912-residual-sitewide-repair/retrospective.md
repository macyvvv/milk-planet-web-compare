# Retrospective

## Observed event

The initial cast repair exposed additional active Branch5 defects: a missing shop ornament asset, invalid duplicate attributes, a duplicate recruit ID, missing footer alternatives, and invalid line-break markup.

## Detection phase

The issues were found during the site-wide static reference/structure audit and then verified against real browser states at 390px, 768px, and 1440px.

## Missed gate or cause

- The first audit treated every textual CSS/HTML reference as an active consumer before checking comment scope and page-family ownership.
- Legacy HTML had been preserved from the source without a semantic HTML pass for duplicate attributes, IDs, alternatives, and obsolete line-break tags.
- A missing decorative asset had no canonical source, but the active CSS still attempted to request it.

## Generalizable rule

Resolve the active consumer and semantic contract first. For repository-wide scans, strip comments, resolve the actual page consumer, and classify comparison remnants before assigning severity or changing files.

## Skill or validator change

Keep the work-packet audit explicit about active versus stale references. Future asset scans should report both raw findings and active-consumer classifications, and the audit must record any correction to an earlier classification.

## Follow-up

Legacy image-menu `system.css` and commented `eventlist.js` remnants remain a separate comparison-source decision. The 1440px shop scroll-width discrepancy also needs a bounded layout investigation before any CSS change.

## Principle update

For the Planet web workflow, “site-wide audit” means inventory plus consumer classification plus representative runtime verification; raw grep counts alone are not sufficient evidence of a user-facing failure.
