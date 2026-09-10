# Decision

## Scope

Planet系ページ制作におけるOODA / PDCAの親Skill、作業パケット、パケットvalidator、repo契約への接続を追加する。

## Target files

- `skills/planet-web-workflow/SKILL.md`
- `skills/planet-web-workflow/references/work-packet-schema.md`
- `skills/planet-web-workflow/scripts/validate_work_packet.py`
- `skills/planet-web-workflow/agents/openai.yaml`
- `tools/validate_repo_contract.py`
- `AGENTS.md`
- `basis/system_spec.md`
- `basis/decision_log.md`
- `basis/work/2026-09-09-planet-workflow/`

## State

State: LEARNED

## Gate status

- Source lock: PASS — 既存Skill、原典、ユーザー指摘を確認
- Content and task: PASS — 今回はSkill・証跡基盤の変更であり、サイト本文は変更しない
- Structure: PASS — Skill、参照、validator、repo契約の責務を分離
- Intent: PASS — OODA / PDCA、失敗の一般化、非採用を記録
- Independent audit: PASS — quick_validate、repo contract validator、packet validatorのFAIL/PASS挙動を確認
- Release: NOT RUN — このSkill変更自体のGitHub操作はこのパケットの範囲外

## Definition of done

- 親SkillがOODA / PDCAの段階と証跡を定義している
- 既存の意図Skill・視覚監査Skillを呼び出す境界が明記されている
- 情報棚卸し、独立監査、レトロスペクティブ、リリース状態が必須化されている
- パケットvalidatorが欠落をFAILとして検出し、実パケットをPASSできる
- repo契約validatorが親Skillの存在と主要契約を検証する
- 今回の失敗が次回の検査規則へ接続されている

## Parking lot

- 別店舗・ホーム・イベント・採用ページでの前方検証
- 料金到達時間、予約導線、情報欠落率などの事業KPI定義
- W3C検証をローカルまたはCIで再現する手段
