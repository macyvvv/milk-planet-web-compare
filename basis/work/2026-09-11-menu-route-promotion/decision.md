# Decision

Change class: MENU_ROUTE_PROMOTION

## Scope

11店舗の画像版`menu/index.html`を`menu/index_0.html`へ保存し、監査済みHTML版を同じ`menu/index.html`へ配置する。`menu-html`、元画像、店舗CSS、共通CSS/JSは変更しない。

## Target files

- `proposal/branch5/shop/*/menu/index.html` → `index_0.html`
- `proposal/branch5/shop/*/menu/index.html`（新規HTML版）
- 必要な新規作業packet

## State

State: LEARNED

## Gate status

- Source lock: PASS — 11店舗の画像版とHTML候補、最大番号variantを確定
- Content and task: PASS — HTML候補を原典と照合し、画像内情報の役割を確認する
- Structure: PASS — 移動後の相対パス変換規則を確定
- Intent: PASS — 保存・昇格・店舗固有判断の境界を確定
- Independent audit: PASS — Shandyの語中分断を最小修正後、3店舗の最大番号variantを3幅で再確認
- Release: NOT RUN — commit / push / PR / merge / publishは別承認

## Definition of done

- 11店舗の既存画像版が`index_0.html`として保持される
- 11店舗の新しい`index.html`が存在する
- Shandy / Shinjuku / Meltyは最大番号variantを監査して反映する
- 相対パス、画像、CSS、JSに404がない
- 390 / 768 / 1440pxで横溢れ・画像欠落・主要構造欠陥がない
- HTMLと画像の重複、店舗固有性、情報完全性を監査packetへ記録する

## Parking lot

- 画像版の公開リンクを明示的に提供するかどうか
- canonical HTML 8店舗の内容修正を追加で行う必要性
- 共通CSS / JSの整理
