# Independent audit

This is a same-agent post-build audit. It is not independent human approval.

## Compared sources

- Original live endpoints under `https://milk-planet.com/planet-group/images/`.
- `proposal/branch5/planet-group/shop.js` generated basenames.
- The pre-change local Branch5 asset directory.

## Viewports

- NOT RUN at 390px, 768px, and 1440px because the browser protocol was unavailable in this turn. The change adds only exact image files and does not alter layout or behavior.

## Retrieval and integrity

- PASS — all 13 files were downloaded from `https://milk-planet.com/planet-group/images/{basename}.jpg` on 2026-09-12.
- PASS — all 13 responses were HTTP 200 with `image/jpeg` and all downloaded files were identified as JPEG images.
- PASS — all 13 files are 620×430. SHA-256 values:
  - `milk.jpg` `c356e6c2c0344b8db79cc5ba6aa9e745de31a77d860fc2c1a4c06bba021c533d`
  - `cybar.jpg` `4b5eac24854b26880c7d42f6e22d5742fcb5f6d1a61955a5bef2fe1df7cbb07f`
  - `chocolat.jpg` `efac67045ba9dd5395657211ebe8d28c37a1d26945e3e9b9c96bea3243eaffcc`
  - `cphanare.jpg` `ff139ea6837aa0bfb4115532b3d03164c19e17d4f4be46126f3390774592e150`
  - `shandy.jpg` `dffed499188e085f3ef2c3ab84fafbaee4e1020bad893fc78033c0f670491006`
  - `melty.jpg` `40f57053d236d229cc5ada8d987687515942f5253327ef494d1ed32f00c229ca`
  - `bloody.jpg` `0cef63ca39369129c4242149134068b5bdd0b3d99e2526551df1e4b3bb647017`
  - `roysuga.jpg` `43b767a78244bcd1b2afc6a1c0b9ba7dd766b12979302a1853bc09d669a18c52`
  - `tweeny.jpg` `e2c6944f922b145f0d02737b2b78783861f0745bdf9a4a01b5c58f2c1a4da472`
  - `cybarb.jpg` `3f1637624e9279aea67bc95c8bbabba87ca0578ebbece3f1a81a7643d6b1c5be`
  - `cybarb2.jpg` `8b7597ca6aef804386625b8f7d4984665772f9b4540dd7b2d4f09248308ed5c5`
  - `cybarl.jpg` `5247e7419f7740d47daec4be664939d1bf272d2a195048bc072c612ca31f9357`
  - `planetplanet.jpg` `f64cf91916b22c93e7318b0dbd5752db45e9222d24b01c09c715c4d8ee1a84c1`

## Runtime coverage

- PASS — the 13 basenames in `proposal/branch5/planet-group/shop.js` now have matching local files.
- PASS — no HTML, CSS, JS, URL, or store data changed.
- NOT RUN — browser protocol was unavailable in this turn; static integrity and repository validators are the available substitutes. A browser check remains a release follow-up if the environment becomes available.

## Static checks

- PASS — 13 generated basenames have matching local files.
- PASS — all 13 target files are JPEG images and 620×430.
- PASS — `node --check proposal/branch5/planet-group/shop.js`.
- PASS — repository contract, static contract, skill-package validation, work-packet validation, and `git diff --check` after the state correction.

## Browser observations

- NOT RUN — browser protocol unavailable. No HTML, CSS, JS, or layout code changed.

## Accessibility and content checks

- PASS (scope) — no text, labels, links, alt text, or document structure changed.

## Findings

- PASS — the local generated image requests now have exact corresponding files.
- PASS — the recovered files came from the original legacy URL rather than filename-based substitution.

## Residual risks

- The original `aisatsu.png`, `close.png`, `index.png`, and `open.png` endpoints still return 404 and remain a separate CSS/asset cleanup decision.
- External source freshness and asset rights ownership remain unknown.
