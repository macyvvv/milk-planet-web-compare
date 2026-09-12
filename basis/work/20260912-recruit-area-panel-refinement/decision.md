# Decision

Change class: LOCAL UI REFINEMENT

## State

State: RELEASED

## Scope

- `proposal/branch5/recruit/recruit.css`の店舗画像の縦寸法を修正する。
- `proposal/branch5/recruit/index.html`の福岡エリアを店舗画像と連絡先のペア構造へ変更する。
- `currently/`、既存画像、募集原稿、応募先URLは変更しない。

## Target files

- `proposal/branch5/recruit/index.html`
- `proposal/branch5/recruit/recruit.css`
- `basis/work/20260912-recruit-area-panel-refinement/*`

## Gate status

- Source lock: PASS
- Content and task: PASS
- Structure: PASS
- Intent: PASS
- Independent audit: PASS
- Release: PASS — PR #66 was merged and the GitHub Pages deployment completed successfully.

## Definition of done

- 店舗画像が表示幅に応じた16:9の高さで表示される。
- 福岡の各店舗画像と連絡先が同じカード内で対応する。
- 東京・大阪のエリア共通連絡先と既存リンクを保持する。
- 390px / 768px / 1440pxで横溢れと縦長化がない。
- static contract、repo contract、work packetがPASSする。

## Parking lot

- 募集条件・応募先URLの運用上の鮮度確認。
- 公開後の応募先クリック率と応募完了率の計測。
