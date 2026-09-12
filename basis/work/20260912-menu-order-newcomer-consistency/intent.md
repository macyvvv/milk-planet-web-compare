# Change

2026-09-12 menu order and newcomer-set consistency

## Viewing situation

- USER: 初来店者または来店を検討中の利用者が、スマートフォン・PCで料金、初回向けセット、注文可能な商品、利用条件を確認する。
- FACT: 対象11店舗は料金開始、案内開始、メインメニュー開始、キャストメニュー開始が混在し、ご新規セットも独立セクション・料金内・別カテゴリ内・未掲載に分かれていた。

## Business and human outcome

- INFERENCE: 情報の入口とご新規セットの位置を予測可能にすると、料金比較と来店判断までの探索負荷を下げられる。
- UNKNOWN: 実利用者の離脱率、予約率、注文率への影響は未計測。

## Source lock

- CONSTRAINT: 公開URLは `proposal/branch5/shop/<store>/menu/index.html` とする。
- CONSTRAINT: `menu/index_0.html`、`menu/images/`、`currently/` は保存・比較元として変更しない。
- FACT: 店舗固有の色、見出し、英語表記、カテゴリ、画像の意味は各店舗HTMLと既存CSSを正本とする。
- FACT: ShandyLoveと新宿店は原典の歓迎・案内を先頭側へ置く意図が既存Intent Memoに記録されている。

## Hierarchy

- 標準: 料金・システム → ご新規セット → ドリンク → シャンパン・酒類 → フード → 限定・特典 → ご利用案内。
- 店舗固有カテゴリは標準の意味グループ内で保持する。
- ShandyLove・新宿店の案内先行は、原典の運用情報を保つ例外として維持する。
- ご新規セットは料金セクションに所属させ、通常料金とは別の視覚ブロックとして示す。

## Commitments

1. USER / INFERENCE: ローカルナビをイントロ直後に置き、表示順とリンク順を一致させる。
2. USER / FACT: ご新規セットを料金情報の近くに置くが、通常料金カードと二重に結合しない。
3. CONSTRAINT / FACT: 店舗固有の色・密度・画像表現を保ち、共通化は情報階層と枠の責務に限定する。

## Deliberate exclusions

- 店舗固有のカテゴリ名、英語表記、価格、原典画像は変更しない。
- ShandyLoveへ汎用的な角丸カードを追加しない。赤地・罫線中心の固有表現を残す。
- Meltyのご新規セット画像をHTMLカードへ再制作しない。画像の意味を保持する。
- ご新規セットが原典にない海外3店舗へ、推測で新商品を追加しない。

## Tradeoffs and unknowns

- INFERENCE: 料金内の独立ブロックは、通常料金との関係を保ちつつ初回向け訴求を見失いにくい。
- FACT: 枠を共通化すると視認性は揃うが、ShandyLoveの原典密度やMeltyの画像主体表現を平坦化するリスクがある。
- UNKNOWN: 店舗責任者による価格・原稿校正と、実運用の更新責任者は未確定。
