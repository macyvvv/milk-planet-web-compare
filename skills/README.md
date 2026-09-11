# Planet skills map

このディレクトリは、repo固有の状態を保存する`basis/`とは分離された再利用可能な作業知識である。常時適用するrepo契約は`AGENTS.md`、repo固有の正本・判断・証跡は`basis/`を参照する。

## Routing

| Request / phase | Skill | Owns | Does not own |
| --- | --- | --- | --- |
| 新しい視覚方向、大幅な再構成、実装前の意図固定 | `design-intent` | Viewer、目的、情報階層、正本、Evidence Ledger、非採用、トレードオフ | 実装後監査、release状態 |
| HTML/CSS実装後、既存ページ欠陥、原典との視覚・情報比較 | `visual-fidelity` | 原典差分、店舗固有性、表示品質、アクセシビリティ、画像品質、ブラウザ監査 | 作業順序、PR/merge状態 |
| Planet系の複数工程、作業パケット、承認境界、独立監査、公開確認 | `planet-web-workflow` | OODA / PDCAの順序、Scope、state、validator、retrospective、release記録 | 個別の色・フォント・クロップ判断 |
| Skill改善、複数ページ監査、既存変更ページの再監査 | `planet-web-workflow` → `design-intent` / `visual-fidelity` | 判断原理、対象網羅、転用境界、回帰確認、学習昇格 | 単一ページの好みの一般化 |

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

「AIらしさを隠す」依頼は、装飾を追加する依頼として扱わず、利用状況・根拠・非採用・トレードオフ・店舗固有性の判断原理を固定する依頼として扱う。哲学的な妥当性は自動validatorで代替しない。

## Shared boundaries

- Skillは方法論、判断基準、検査手順を持つ。店舗名、価格、URL、現在の作業状態を固定しない。
- `basis/README.md`はrepo文書のregistry、`basis/requirements_traceability.md`は要件lineageの正本である。
- `basis/work/<change-id>/`は個別変更の観測・判断・監査・releaseの証跡である。
- Skillを更新した場合は、適用条件、責務境界、検証方法を変更理由とともに`basis/decision_log.md`へ記録する。

## Document routing

| Document | Primary responsibility | Do not use it for |
| --- | --- | --- |
| `DESIGN.md` | 現行repoの安定した視覚契約・共通ルール | 個別変更の監査証跡、最新価格の正本 |
| `basis/mece_coverage_matrix.md` | 工程・品質領域・担当・検証の横断coverageと未解決境界 | ページ固有の実装判断 |
| `basis/requirements_traceability.md` | 要件の根拠から実装・監査・公開までのlineage | 1変更の全ログ |
| `basis/planet_page_evidence_matrix.md` | 複数ページから一般化する学習用Evidence | 個別リリースのsource map |
| `basis/work/<change-id>/source-map.md` | 1変更における原典要素の処理結果 | repo全体の要件定義 |
| `basis/decision_log.md` | 採用・却下・保留の理由と影響 | ブラウザ監査の詳細な観測表 |

同じ事実を複数の正本へ複製しない。別文書へ載せる場合は、要約と正本への参照だけを残す。

## Validation

```bash
python3 tools/validate_skill_packages.py
python3 tools/validate_work_packets.py
python3 tools/validate_static_contract.py proposal/branch5/shop
python3 tools/validate_repo_contract.py
```

`validate_skill_packages.py`はCIと他環境で再現可能なSkill形式を検査する。Codex環境の`quick_validate.py`は補助的な詳細検査として使えるが、CIの完了条件にはしない。repo contract validatorはこのrepoの存在・参照・境界を検査し、いずれも視覚品質や判断の正しさを自動判定するものではない。
