# Independent audit

## Compared sources

- `proposal/branch5/shop/shinjuku/menu/index.html`
- `proposal/branch5/shop/shinjuku/menu/images/menu1.jpg`
- `proposal/branch5/shop/shinjuku/menu/images/menu1-hero.jpg`
- `proposal/branch5/shop/shinjuku/images/base_shinjuku.png`
- `proposal/branch5/shop/shinjuku/menu-html/index_3.html`
- `proposal/branch5/shop/menu-html-common.css`
- `proposal/branch5/proposal.js`

## Viewports

- 390px × 844px: PASS — ヘッダー、ヒーロー、案内パネルに横溢れなし。ロゴ背景の矩形感を確認し、ポイント専用レイアウトは別アンカーで確認。
- 768px × 900px: PASS — ヒーロー比率、2カラム案内、ヘッダーの淡色面に崩れなし。
- 1440px × 900px: PASS — タイトル面、ヒーロー、案内パネル、ポイント欄に不要な白帯・重なりなし。

## Static checks

- `git diff --check`: PASS
- `python3 tools/validate_repo_contract.py`: PASS
- Work packet validator（LEARNED）: 実行後にPASSを確認する
- 重複ID: PASS — なし
- ページ内アンカー: PASS — `#menu-content`、`#pricing`、`#drink`、`#champagne`、`#food`、`#special`、`#points`、`#guide`の参照先あり
- 制作途中タイトル: PASS — `Visual Variant 3`を除去

## Browser observations

- ヘッダー: PASS — `base_shinjuku.png`の淡色背景とタイトル面を`#bfe0f7`へ揃え、旧矩形の貼り付け感を解消。タイトル文字は濃色化。
- ポイント欄: PASS — `3ポイント`、`6ポイント`、`15ポイント`、`18ポイント`、`30ポイント`を1行の閾値として保持。報酬文のみ自然に折り返す。
- モバイルナビ: PASS — fresh originで開閉を確認。`aria-expanded=true`、表示状態、`めにゅうを閉じる`への名称更新を確認。
- lazy画像: PASS — `#special`到達後、`menu8.jpg`と`menu9.jpg`が完全読込。
- コンソール: PASS — warn / errorなし。
- 横スクロール: PASS — 390pxでdocument width 375、768pxで753、1440pxで1425。いずれもviewport内に収まる。

## Accessibility and content checks

- 見出し・landmark・alt・ID・アンカー: PASS — 既存構造を維持。
- 色ペア: PASS — `#245a9f`は`#cae3f5`上で約5.21:1、`#edf6ff`上で約6.33:1。`#4f626f`はそれぞれ約4.78:1、5.81:1。宣言CSS色の計算値であり、画像内文字の評価ではない。
- タイトル文字: PASS — `#245a9f` on `#bfe0f7`は約5.01:1。
- W3C正式検証: NOT RUN — 利用可能なローカルHTML5 validatorがなく、旧版TidyはHTML5要素を誤検出するため正式な合格判定に使用しない。ブラウザDOM解析、重複ID、参照先、画像読込を代替確認した。
- フォント: LIMITATION — LatoとOS依存の日本語フォールバックは維持。複数OSでの字形差は未計測。

## Findings

- PASS: 背景色だけを青へ差し替えず、ロゴ画像の原典背景へタイトル面を戻した。
- PASS: 数値の意味単位をCSSグリッドの最小列として扱い、語中分断を防いだ。
- PASS: 通常サイズの青系価格・ナビ・注記を主要なコントラスト基準内へ移した。
- PASS: URL、ヒーロー画像、画像とHTMLの役割、本文内容を変更していない。
- LIMITATION: 原典ロゴは白文字を淡色背景に含む画像のため、矩形感は解消したが、ブランドマーク自体の視認性は強くない。別ロゴ資産を採用する場合は、正本所有者の承認が必要。
- LIMITATION: 全体の角丸パネル・下線見出しの反復は今回のScope外であり、汎用化リスクとして残る。

## Residual risks

- W3C正式検証と複数OSのフォントフォールバックは未実施。
- 公開URLはmerge後のGitHub Pagesデプロイ完了までは未確認。merge commit `e723526`でmainへの反映は確認済み。
- 商品名・価格の一件単位content diffは今回の対象外。
