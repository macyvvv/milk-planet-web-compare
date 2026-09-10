# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/shop/shandy/menu/images/*` | Shandyの全13アセット | source inventory | 画像単位でMatrixへ列挙 | image source | 目視・寸法・参照関係を確認 |
| `proposal/branch5/shop/shinjuku/menu/images/*` | 新宿の全12アセット | source inventory | 画像単位でMatrixへ列挙 | image source | 目視・寸法・参照関係を確認 |
| `proposal/branch5/shop/shandy/menu/index.html` | 原典の画像順・全メニュー構成 | content source | MatrixとHTML版を照合 | source HTML | 画像内文字の一件差分は別検査が必要 |
| `proposal/branch5/shop/shinjuku/menu/index.html` | 原典の歓迎、料金、商品、event1 | content source | MatrixとHTML版を照合 | source HTML | 更新情報の正本は運用確認が必要 |
| `proposal/branch5/shop/*/menu/system.css` | 元ページの色、形、境界、余白 | visual constraint | 視覚判断の根拠として記録 | source CSS | 継承値の実表示検証が必要 |
| `proposal/branch5/shop/*/menu-html/index_3.html` | HTML化後の情報構造と実装箇所 | implementation | Matrixの処理結果と照合 | implementation | ブラウザ実表示は別監査 |
| `DESIGN.md` | 正本順位、画像・情報・AI一般化の禁止 | repo constraint | 横断判断の制約として適用 | repo contract | repo固有ルールであり外部普遍則ではない |
| `https://www.gov.uk/guidance/government-design-principles` | ユーザー起点、データ、公開 | external principle | 判断軸の候補として参照 | external reference | Planetへの適用は推論 |
| `https://service-manual.nhs.uk/design-system/design-principles` | 成果、文脈、仮説検証、反復 | external principle | 判断軸の候補として参照 | external reference | 医療サービス固有の原則を直接移植しない |
| `https://www.microsoft.com/en-us/research/publication/interrogating-design-homogenization-in-web-vibe-coding/` | Web制作の同質化、productive friction | research | AI一般化の検査軸へ翻訳 | external research | 研究の主張を2ページの証明とみなさない |
| `https://blog.interfacekit.io/what-is-ai-slop-ui-design` | 未検証出力、意図不足、責任不在 | secondary analysis | 補助的な失敗語彙として参照 | external analysis | 商業記事であり単独根拠にしない |
