# Retrospective

## Observed event

店舗ごとに本文順、ローカルナビ順、ご新規セットの枠責務が分散していた。共通化前に全11店舗を抽出し、意味順と店舗固有表現を分離してから実装した。

## Detection phase

IMPLEMENTED / AUDITED。静的DOM検査と390/768/1440pxブラウザ確認で検出・確認した。

## Missed gate or cause

既存のHTML化と既存route昇格が別判断として進み、共通の情報階層・枠責務を横断監査するゲートが不足していた。今回の整理で補った。

## Generalizable rule

`STRUCTURAL`: 料金系情報と初回セットの意味階層、目次と本文の順、アンカー整合は共通検査する。`LOCAL`: 色、角、画像主体、案内先行は店舗原典へ委譲する。`UNKNOWN`: 効果測定と校正責任は実装から推定しない。

## Skill or validator change

今回の作業パケットに、全店舗・3幅のDOM順、アンカー、横スクロール、枠責務を明示した。次回は `validate_static_contract.py` に目次アンカーと重複IDの検査追加を検討する。

## Follow-up

価格・原稿の店舗責任者校正と、新規セット導線のクリック／予約指標計測をParking lotへ残す。

## Principle update

共通化は見た目を均一にすることではなく、初回来訪者が料金と初回セットを予測可能に探索できる構造へ適用する。店舗固有の表現差は構造検査の例外として明記し、暗黙の上書きにしない。
