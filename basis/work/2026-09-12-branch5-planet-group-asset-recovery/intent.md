# Change

Recover the 13 missing `planet-group` store thumbnails in `proposal/branch5/`.

## Goal

- Remove the existing local 404s caused by `proposal/branch5/planet-group/shop.js`.
- Use the original site's exact legacy filenames and image bytes.
- Preserve the current page structure, store order, labels, URLs, and `currently/`.

## Viewing situation

- FACT: the legacy `shop.js` emits one thumbnail for each of 13 stores.
- FACT: the local capture omitted those files even though the original legacy endpoints still serve them.
- CONSTRAINT: the visual composition and existing filename contract must remain unchanged.

## Business and human outcome

- USER: visitors should see the intended store thumbnails instead of broken image states.
- INFERENCE: removing broken thumbnails protects trust and store-selection comprehension.
- CONSTRAINT: source identity must be preserved; no same-name asset substitution is acceptable.

## Source lock

- The original endpoints are `https://milk-planet.com/planet-group/images/{name}.jpg`.
- On 2026-09-12 all 13 endpoints returned HTTP 200, `image/jpeg`, and valid JPEG signatures.
- The existing `shop.js` already generates these exact basenames; no script change is required.

## Deliberate exclusions

- Do not modify `currently/`.
- Do not substitute recruitment or store-detail images.
- Do not retrieve or invent `aisatsu.png`, `close.png`, `index.png`, or `open.png`; their original endpoints remain HTTP 404 and require a separate CSS/asset decision.
- Do not change CSS, HTML, layout, or JavaScript in this packet.

## Hierarchy

1. Preserve the existing renderer and its 13 filename references.
2. Restore exact original JPEGs at the expected local paths.
3. Record provenance and integrity before release.

## Commitments

1. Stage downloads outside the repository.
2. Validate status, Content-Type, signature, dimensions, and hashes.
3. Run repository and work-packet checks after placement.

## Tradeoffs and unknowns

- TRADEOFF: binary assets increase repository size by approximately 464KB.
- UNKNOWN: the original site's future freshness and rights owner are not recorded in the repository.
