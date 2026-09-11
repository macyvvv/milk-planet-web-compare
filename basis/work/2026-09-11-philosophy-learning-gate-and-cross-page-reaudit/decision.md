# Decision

Change class: PHILOSOPHY_LEARNING

## Scope

承認済み計画に従い、Skills・作業パケット仕様・validator・basisの学習記録を更新し、11店舗のcanonical menuページと既存変更済み4variantを再監査する。ページ本体は変更しない。

## Target files

- `skills/design-intent/SKILL.md`
- `skills/planet-web-workflow/SKILL.md`
- `skills/visual-fidelity/SKILL.md`
- `skills/README.md`
- `skills/planet-web-workflow/references/philosophy-learning-gate.md`
- `skills/planet-web-workflow/references/work-packet-schema.md`
- `skills/planet-web-workflow/scripts/validate_work_packet.py`
- `basis/decision_log.md`
- `basis/mece_coverage_matrix.md`
- このwork packet

## State

State: LEARNED

## Gate status

- Source lock: PASS — 対象正本と変更対象外境界をintent/source-mapへ記録
- Content and task: PASS — Skill改善と再監査の対象範囲を確定
- Structure: PASS — 新規参照資料とpacket validatorの責務を確定
- Intent: PASS — Principle under test、No-change option、Transfer boundaryを記録
- Independent audit: PASS — canonical 11ページの既取得3幅証跡を横断再判定し、既存variant 4ページを更新後に静的・ブラウザ・横断観点で確認
- Release: NOT RUN — 外部releaseは今回のScope外

## Philosophy gate

Skill改善は装飾の模倣ではなく、目的・根拠・非採用・トレードオフ・転用境界を保存する。検査PASSと哲学的妥当性を別状態として扱う。

## Coverage

Canonical 11店舗、既存variant 4ページ、共有CSS/JS consumer、元画像版、HTML版を監査対象とする。未追跡PPTXは対象外。

## Definition of done

- 哲学学習ゲートが既存Skillsの責務境界へ追加されている
- 新規PHILOSOPHY_LEARNING packetの証跡要件をvalidatorが検査する
- Skillsとvalidatorの検証がPASSする
- 390 / 768 / 1440pxで全監査対象を確認する
- 所見をLOCAL / STRUCTURAL / UNKNOWNへ分類する
- ページ本体、画像、公開状態、未追跡PPTXを変更しない

## Parking lot

- 11店舗のsource mapを完全にMECE化する作業
- W3C正式検証と実ネットワーク性能予算
- 画像配信を含む各店舗の実装
- Skillの判断品質を評価する独立forward test
