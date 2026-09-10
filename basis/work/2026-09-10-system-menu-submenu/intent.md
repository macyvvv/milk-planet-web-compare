# Change

## Viewing situation

- USER: ピルメニューを開き、「しすてむ＆めにゅう」から確認したい店舗のメニューへ直接進む。
- FACT: 現状のシステム項目はTopページの`#sys-title-wrapper`へ遷移し、Top上で店舗アイコンを再選択する必要がある。
- FACT: 同じピルメニューには「えんかく つうはん」の子ドロップダウンが既にある。

## Business and human outcome

- USER: 店舗ごとの料金・メニュー確認へ到達する操作を短くし、来店判断までの探索負荷を下げる。
- INFERENCE: Topへの不要な中継を減らすことで、店舗選択からメニュー確認までの離脱要因を減らせる可能性がある。

## Source lock

- FACT: `proposal/branch5/index.html`の`#sys .sys-shops`を店舗リンクの正本とする。
- FACT: `proposal/branch5/navigation.css`と`proposal/branch5/shop_menu_override.css`に子メニューの表示規則がある。
- CONSTRAINT: `currently/`、`proposal/branch5/shop/<store>/menu/`、原典画像、外部通販URLは変更しない。

## Hierarchy

1. `めにゅう`
2. `しすてむ＆めにゅう`（親ボタン）
3. 各店舗のシステム・メニュー（子リンク）
4. `えんかく つうはん`（既存の別親項目）

## Commitments

1. USER: システム項目からTopへ遷移させず、店舗メニューを子ドロップダウンで選択可能にする。
2. CONSTRAINT: Topに既存する10店舗のメニューリンク先と店舗順を維持する。
3. CONSTRAINT: 既存のピルメニューの視覚表現と、遠隔通販の開閉パターンを再利用する。

## Deliberate exclusions

- CONSTRAINT: ナビゲーションの見た目を新規デザインへ変更しない。
- CONSTRAINT: 店舗ページ、料金、原典画像、通販URL、`currently/`を変更しない。
- CONSTRAINT: branch1へ同じ変更を横展開しない。現在の承認ScopeはBranch5に限定する。

## Tradeoffs and unknowns

- TRADEOFF: 共通JSで生成するため、HTML静的ソースだけでは子項目を確認できない。一方、全ページの相対パス差異を一か所で処理できる。
- UNKNOWN: JS無効環境でのナビゲーション利用は今回の静的モックの対象外であり、従来アンカーが残る。
