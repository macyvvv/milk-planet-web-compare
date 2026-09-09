# Decision

## Scope

新宿`menu-html/index_3.html`だけを修正する。ロゴとタイトル面の背景整合、タイトルの公開文言、ポイント閾値の改行、青系文字のコントラストを対象とする。

## Target files

- `proposal/branch5/shop/shinjuku/menu-html/index_3.html`
- `basis/work/2026-09-09-shinjuku-index3-identity-a11y-fix/`

## State

State: LEARNED

## Gate status

- Source lock: PASS — 原典ロゴ、歓迎ヒーロー、HTML化済み特典、共通CSSを確認
- Content and task: PASS — 内容、情報順、画像とHTMLの役割を変更しない範囲に限定
- Structure: PASS — 既存の見出し、ID、アンカー、画像参照を維持し、ポイントの意味単位だけCSSで保護
- Intent: PASS — 視認性と読みやすさを改善し、店舗固有のロゴと淡色面を根拠として採用
- Independent audit: PASS — 390 / 768 / 1440px、ポイントアンカー、画像、ナビ、コントラスト、横溢れを再確認
- Release: NOT RUN — commit / push / PR / merge / publishは依頼範囲外

## Definition of done

- ロゴ背景の矩形感が初期表示・sticky表示で解消される
- ポイント閾値が語中分断されない
- 通常サイズの青系文字の主要色ペアが4.5:1以上になる
- `Visual Variant 3`がtitleから除去される
- 内容、画像参照、アンカー、モバイルナビに回帰がない
- 独立監査と残存リスクが`audit.md`へ記録される

## Parking lot

- 共通カード構文の過剰反復を店舗別に再設計すること
- 料金・商品単位の自動content diff
- ローカルW3C検証をCIへ組み込むこと
