# Change

公開済み3店舗の`index_3.html`を、最新のPlanet制作基盤で再監査した結果に基づき、明確な公開品質欠陥だけを局所修正する。

## Viewing situation

- FACT: 対象は公開済みのMelty、ShandyLove、milkplanet新宿の`index_3.html`である。
- USER: 監査結果を次工程へ進め、ページを基盤の基準へ近づける。
- CONSTRAINT: 原典画像、URL、画像とHTMLの責務分離、既存の店舗固有表現は維持する。

## Business and human outcome

- INFERENCE: 公開タイトルの制作途中表記を除去すると、利用者・検索エンジン・運用担当者への誤認を減らせる。
- INFERENCE: 新宿ヒーローの人工的な枠を除去すると、歓迎ビジュアルの意味境界と空間的なまとまりが改善する。
- INFERENCE: Shandyに`main`ランドマークを与えると、支援技術による本文探索が改善する。

## Source lock

- FACT: Shandyの`menu2-hero.jpg`、新宿の`menu1-hero.jpg`、Meltyの既存画像群を原典として維持する。
- FACT: 新宿の`menu1-hero.jpg`は枠線を含まない派生ヒーロー画像である。
- FACT: Meltyのメニュー価格・商品情報は原典画像が正本であり、今回の変更で推測転記しない。

## Hierarchy

- FACT: 3ページとも店舗ロゴ・ページタイトル・ローカルナビ・メニュー本文の順序を維持する。
- USER: 画像の意味情報をHTMLへ重複させず、画像をおかしな位置で切断しない。

## Commitments

1. Shandyの公開タイトルから`Visual Variant 3`を除去し、本文を`main`として表現する。
2. 新宿ヒーローのCSSラッパー由来の背景・角丸を除去し、画像の切り出し自体は変更しない。
3. 3ページを390 / 768 / 1440pxで再監査し、残存リスクを記録する。

## Deliberate exclusions

- Meltyの画像メニュー全量をHTMLへ再転記しない。
- 新しいロゴ画像、ヒーロー画像、装飾、フォントを生成・追加しない。
- 共通CSSや他ページを変更しない。
- push、PR、merge、公開状態の変更は今回のScopeに含めない。

## Tradeoffs and unknowns

- CONSTRAINT: Meltyは画像中心のため、視覚忠実度とテキスト検索・支援技術での完全読上げにトレードオフが残る。
- UNKNOWN: 正式W3C validator、実ネットワークLCP/CLS、商品・価格単位の自動差分検査は今回も利用可能な状態ではない。
- UNKNOWN: 公開後のContent owner、Visual reviewer、Release owner、更新期限は未確定である。
