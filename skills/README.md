# Planet skills map

このディレクトリは、repo固有の状態を保存する`basis/`とは分離された再利用可能な作業知識である。常時適用するrepo契約は`AGENTS.md`、repo固有の正本・判断・証跡は`basis/`を参照する。

## Routing

| Request / phase | Skill | Owns | Does not own |
| --- | --- | --- | --- |
| 新しい視覚方向、大幅な再構成、実装前の意図固定 | `design-intent` | Viewer、目的、情報階層、正本、Evidence Ledger、非採用、トレードオフ | 実装後監査、release状態 |
| HTML/CSS実装後、既存ページ欠陥、原典との視覚・情報比較 | `visual-fidelity` | 原典差分、店舗固有性、表示品質、アクセシビリティ、画像品質、ブラウザ監査 | 作業順序、PR/merge状態 |
| Planet系の複数工程、作業パケット、承認境界、独立監査、公開確認 | `planet-web-workflow` | OODA / PDCAの順序、Scope、state、validator、retrospective、release記録 | 個別の色・フォント・クロップ判断 |

## Invocation order

```text
Observe / Orient
  → planet-web-workflow
  → design-intent (when visual direction or substantial redesign is involved)
  → Decide / approve Scope
  → Act
  → visual-fidelity (post-build independent audit)
  → planet-web-workflow (Learn / Release verification)
```

既知の局所バグで視覚方針が変わらない場合は`visual-fidelity`へ直接進める。ただし、正本、画像の役割、情報階層、アクセシビリティ、release状態へ影響する場合は`planet-web-workflow`へ戻す。

## Shared boundaries

- Skillは方法論、判断基準、検査手順を持つ。店舗名、価格、URL、現在の作業状態を固定しない。
- `basis/README.md`はrepo文書のregistry、`basis/requirements_traceability.md`は要件lineageの正本である。
- `basis/work/<change-id>/`は個別変更の観測・判断・監査・releaseの証跡である。
- Skillを更新した場合は、適用条件、責務境界、検証方法を変更理由とともに`basis/decision_log.md`へ記録する。

## Validation

```bash
python3 /Users/ariel/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/design-intent
python3 /Users/ariel/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/visual-fidelity
python3 /Users/ariel/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/planet-web-workflow
python3 tools/validate_repo_contract.py
```

`quick_validate.py`はSkillの形式を検査し、repo contract validatorはこのrepoの存在・参照・境界を検査する。どちらも視覚品質や判断の正しさを自動判定するものではない。
