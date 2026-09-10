# Independent audit

## Compared sources

- `proposal/branch5/shop/shandy/menu/images/`全ファイル
- `proposal/branch5/shop/shinjuku/menu/images/`全ファイル
- 両店舗の原典`menu/index.html`、`system.css`
- 両店舗の`menu-html/index_3.html`、`system.css`
- `DESIGN.md`、既存Skills、外部設計原則

## Viewports

- 390px: 今回はマトリクスと証跡のみの変更であり、ページ表示の再監査は未実施
- 768px: 今回はマトリクスと証跡のみの変更であり、ページ表示の再監査は未実施
- 1440px: 今回はマトリクスと証跡のみの変更であり、ページ表示の再監査は未実施

## Static checks

- 全画像ファイル一覧: PASS
- 画像寸法と派生ヒーローの確認: PASS
- 原典HTMLと`index_3.html`の画像参照照合: PASS
- `event1.jpg`のHTML移動先確認: PASS
- Matrixの全アセット行確認: PASS

## Browser observations

- 今回の成果物はMarkdownの証跡であり、ブラウザ表示対象外
- `index_3.html`の再表示、アンカー、低速画像、キーボード操作は未実施

## Accessibility and content checks

- 画像内の意味ブロック、HTML化、画像保持、派生ヒーローの役割を確認した
- 文字単位・価格単位の完全な自動差分は未実施
- コントラスト、フォントフォールバック、読み上げ順は未実施

## Findings

- PASS: Shandyの`menu2`案内と新宿の`menu1`案内・`event1`更新情報を、画像・HTMLの責務として分離できた
- PASS: 派生ヒーローを原典画像の代替正本とせず、原典との関係を記録した
- PASS: 販促画像を残す判断と、商品情報をHTML化する判断を区別できた
- PASS: 外部資料から、根拠・成果・文脈・仮説検証・同質化を判断軸として抽出した
- LIMITATION: 見た目から人間制作／AI制作を確定する検査にはしていない

## Residual risks

- Matrixは意味ブロック単位であり、全商品・全価格の一件差分ではない
- ブラウザ実表示、アクセシビリティ、更新運用、KPIは未検証
- 外部研究の設計哲学をPlanetへ適用した部分は推論であり、次回ページで反証可能性を確認する
