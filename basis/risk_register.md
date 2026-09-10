# Risk Register

| ID | Risk | Trigger | Mitigation | Detection | Owner / status |
| --- | --- | --- | --- | --- | --- |
| R-01 | PC最適化で店舗固有性・ブランド感が弱くなる | 共通カード、角丸、色だけのskinへ収束 | Source lock、Swap test、Flattening test、独立監査 | visual-fidelity audit | workflow / OPEN |
| R-02 | カルーセル縮小・廃止で既存導線や運用が変わる | 入口・投稿・リンクの役割が未確認 | 現行導線をsource mapへ固定し、主要リンクを直接確認 | link and browser audit | workflow / OPEN |
| R-03 | 情報設計変更で既存利用者の学習コストが増える | 情報順・名称・URLを同時変更 | URL維持、変更理由のdecision log記録、主要タスク確認 | anchor and task audit | workflow / OPEN |
| R-04 | 更新責任が曖昧で、改善後に情報が劣化する | 価格・特典・イベントの正本や担当が不明 | Authorityをtraceabilityへ記録し、不明は`UNKNOWN`で保留 | freshness review | content owner / OPEN |
| R-05 | 画像最適化で文字・価格・ロゴが読めなくなる | lossy変換や候補幅の根拠がない | 原典保持、fallback、実表示幅での可読性確認、容量だけで合格にしない | `currentSrc` and visual audit | visual reviewer / CONTROLLED |
| R-06 | 文書・Skillの重複が異なる判断を生む | 同じルールが複数ファイルに存在 | README registry、skills routing、decision logを正本にする | repo contract and link check | maintainer / CONTROLLED |
| R-07 | chassisの未実装機能を完成済みと誤認する | `inspect`、`adopt`、`migrate`を未実装のまま運用 | 未実装範囲を明示し、read-only validatorと別Milestoneを使う | capability review | maintainer / OPEN |

Risk statusは、未対応を隠すために変更しない。対応策が検証済みになった場合だけ`CONTROLLED`へ更新する。
