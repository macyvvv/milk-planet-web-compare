# Retrospective

## Observed event

- FACT: 既存の共通JSに遠隔通販の子メニュー生成処理と、共通CSSの子メニュー表現が存在した。
- FACT: システム項目はTopアンカーへの単一リンクとして残っていた。

## Detection phase

- Observe / Orient: 共通ナビ、Topの店舗リンク、既存子メニュー処理を確認した。
- Act: システムリンクの親子化と開閉状態の共通化を実装した。

## Missed gate or cause

- FACT: 初期設計では遠隔通販の既存処理に対して、システム項目が同じJSに変換されることが明示されていなかった。

## Generalizable rule

- CONSTRAINT: 共通ナビに同じ階層の親子項目を追加する場合は、表示CSSだけでなく、生成タイミング、ARIA状態、相対URL解決、他の子項目との排他開閉を同じ作業単位で確認する。

## Skill or validator change

- OUT OF SCOPE: 今回は既存Skillとvalidator自体を変更しない。

## Follow-up

- FACT: 独立監査で390 / 768 / 1440px、キーボード操作、全10店舗リンク、既存通販メニューの排他開閉を確認した。
- PARKING LOT: JS無効環境向けの静的フォールバックは今回のScope外として残す。
