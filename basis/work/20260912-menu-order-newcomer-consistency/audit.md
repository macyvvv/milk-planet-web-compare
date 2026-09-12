# Independent audit

## Compared sources

実装対象の `menu/index.html`、保存原典 `index_0.html`、共通CSS、店舗CSSを比較した。`currently/`、`index_0.html`、`menu/images/`には差分なし。

## Viewports

11店舗を390px / 768px / 1440pxで確認した。

## Static checks

`validate_static_contract.py proposal/branch5/shop` PASS（50 HTML、外部参照35）。DOM検査で11店舗の目次アンカー欠落・重複IDなし、決定した可視セクション順と一致。`validate_repo_contract.py` PASS、`git diff --check` PASS。

## Browser observations

ローカルHTTPサーバー経由で全11ルートを再読込し、全幅で `scrollWidth <= innerWidth`。ShandyLove、milkplanet新宿、Melty Mousseを390pxでスクリーンショット確認。料金・ご新規セット・後続カテゴリへの目視導線を確認した。

## Accessibility and content checks

目次の全 `href="#…"` が既存IDへ到達し、ご新規セット見出しIDは料金セクション内に存在する。原典画像、価格、店舗固有CSSの保存範囲を確認。キーボードフォーカスは共通CSSの `:focus-visible` 定義を維持している。

## Findings

 - PASS [STRUCTURAL] 11店舗の本文カテゴリ順とローカルナビ順を一致させた。
 - PASS [STRUCTURAL] 通常のご新規セットは料金内の単一グループ枠、子要素は二重枠なし。
 - PASS [LOCAL] ShandyLoveは外側の角丸枠を付けず、罫線中心の店舗表現を保持。
 - PASS [LOCAL] Meltyは料金内へ移動したが、原典画像と独立した区切り線を保持。
 - PASS [LOCAL] Chocolatは料金配下に新規セットを追加し、目次から直接到達可能にした。
 - PASS [LOCAL] 比較用ShandyLoveにも共通CSSの局所上書きを適用し、罫線中心の表現へ戻した。
 - ADVISORY [UNKNOWN] 実利用者の導線改善効果と、価格・原稿の店舗責任者校正は未計測・未承認。

## Residual risks

- 店舗固有の原典順を標準順序へ寄せた箇所が、店舗運用上の意図と衝突しないかは人手確認が必要。
- 実利用者の行動効果は未計測。
- 独立した第三者レビューは未実施。今回のブラウザ確認は実装者による監査である。
