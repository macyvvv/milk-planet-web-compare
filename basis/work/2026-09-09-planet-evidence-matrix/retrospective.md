# Retrospective

## Observed event

- 2ページの失敗からSkillを一般化したが、先行する作業パケットのSource mapは代表的な画像だけで、全アセットの一行対応表ではなかった
- 「AIらしさ」を汎用カード、スキン化、情報欠落、画像重複などの症状で捉えていたが、哲学・責任・検証との接続が弱かった
- 外部の設計原則を調査すると、人間の設計らしさは珍しい装飾ではなく、ユーザー、成果、文脈、証拠、反復、公開性へ現れることが確認できた

## Detection phase

- Source mapの不足: Observe / Orientの再検査
- AIらしさの定義不足: Orient / Learnの再検査
- MECEの不足: Matrix設計時に検出

## Missed gate or cause

- 代表例と網羅的な台帳を区別していなかった
- 失敗症状を単一の分類軸で並べ、対象（情報、構造、視覚、運用）と工程（Observe、Act、Check、Release）を分離していなかった
- 完成画面の再現を重視し、なぜその判断をしたか、何を犠牲にしたか、誰が更新するかを同じ粒度で保存していなかった

## Generalizable rule

- 原典アセットは代表例ではなく全件をSource mapへ置く。意味情報が含まれる画像は、画像単位と意味ブロック単位を分けて追跡する
- AIらしさの監査は色・フォント・カードなどの外観だけで終えず、Situatedness、Priority、Authority、Commitment、Productive friction、Content reality、Continuity、Accountabilityの8軸で行う
- 人間制作の証明を推測せず、判断の根拠、非採用、トレードオフ、検証結果が残っているかを監査する

## Skill or validator change

- `basis/planet_page_evidence_matrix.md`を追加
- 外部資料を設計哲学の評価軸へ翻訳した
- 今回はSkill本体を変更せず、2ページで反証可能な学習資料として保存した
- 次回、別ページで同じMatrixを使い、過剰な軸・不足する軸を確認してからSkillへ昇格する

## Follow-up

- 商品・価格の一件差分を機械的に確認するcontent diffを別途設計する
- 共通ページシェルと更新運用のマトリクスを追加する
- 別店舗・別ページで8軸が実際の判断を改善するか前方検証する
