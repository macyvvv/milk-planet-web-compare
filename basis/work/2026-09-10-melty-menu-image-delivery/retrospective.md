# Retrospective

## Observed event

The Melty page was image-led and its seven canonical JPEG sheets totaled 4,993,082 bytes. Replacing the design or rewriting the image content would have created unnecessary visual risk, so the performance issue was isolated to asset delivery. Measured WebP candidates reduced the deployed candidate set to 717,674 bytes while preserving the original JPEGs as fallback.

## Detection phase

The issue was detected during performance-oriented review after the page structure had already been accepted visually. Source-byte measurement, candidate-size measurement, and browser `currentSrc` inspection were used before release. Visual inspection of text-heavy 480px and 720px derivatives was required because a technically smaller asset can still be unacceptable if menu text becomes hard to read.

## Missed gate or cause

The earlier page workflow did not make image transfer budget, responsive candidate sizing, and actual browser-selected `currentSrc` explicit gates. It also did not record the conversion-toolchain compatibility risk: one attempted converter was incompatible with the local Node runtime, so the final derivatives were generated with a compatible sharp-based CLI.

## Generalizable rule

For image-led pages:

1. Measure canonical asset bytes before proposing visual or structural changes.
2. Derive responsive widths from actual rendered bounds and retain a canonical fallback.
3. Inspect text-heavy assets at their real display widths before accepting lossy conversion.
4. Verify browser `currentSrc`, image completion, overflow, anchors, and lazy-loading behavior—not only source-file references.
5. Record conversion-toolchain assumptions and failures so the optimization is reproducible.

## Skill or validator change

The reusable workflow should include an image-delivery gate covering source-byte baseline, candidate-width rationale, fallback preservation, visual legibility, `currentSrc` selection, and a post-build browser audit. A shared skill/validator edit is not included in this page-scoped change; the rule is recorded here for the next skills maintenance pass.

## Follow-up

- Add automated derivative regeneration and stale-asset detection.
- Add a repeatable performance report using browser waterfalls or real-user data.
- Compare AVIF only after WebP delivery is stable and text legibility remains documented.
