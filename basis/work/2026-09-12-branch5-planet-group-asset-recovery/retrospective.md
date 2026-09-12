# Retrospective

## Observed event

The Branch5 planet-group page displayed broken thumbnails because its 13 generated JPEG files were absent from the local mirror.

## Detection phase

The gap was identified from the runtime-generated URLs and then checked against the original site's legacy endpoint rather than relying only on the local capture.

## Cause

The legacy `planet-group/shop.js` referenced 13 static JPEG basenames that were omitted from the local capture. The original endpoints still exist, so this was a capture completeness failure rather than source deletion or a Branch5 renderer regression.

## Missed gate or cause

The earlier asset audit checked the local mirror and Git history but did not revalidate the historical public URL. A generated-asset check must include the original URL when local source absence is the finding.

## Skill or validator change

No shared Skill or validator was changed. The packet records the required source-status, Content-Type, signature, dimension, and provenance checks for a future mirror validator.

## Generalizable rule

For static mirrors, validate generated URLs against the original source before classifying an asset as unavailable. Require HTTP status, Content-Type, file signature, dimensions, and provenance before committing a recovered binary asset.

## Follow-up

Handle the four missing PNG endpoints separately. Do not replace them by filename similarity or hide their unresolved status inside this recovery packet.
