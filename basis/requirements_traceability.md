# Requirements traceability

この文書は、repo固有の重要要件が、根拠・判断・実装・監査・公開確認へ接続しているかを確認するための横断表である。完成ページの模倣仕様ではなく、変更判断のlineageを保持する。

## Traceability rules

- 要件は、`FACT`、`USER`、`CONSTRAINT`、`INFERENCE`、`UNKNOWN`の根拠区分を持つ。
- `INFERENCE`だけで重要な構造・価格・視覚判断を確定しない。
- 個別変更の詳細は`basis/work/<change-id>/`へ記録し、この表には入口と検証結果だけを残す。
- 公開済みの判定は、release recordの`MERGED`と`VERIFIED`を満たした場合だけとする。

## Current requirement map

| ID | Requirement / outcome | Source of truth | Decision / method | Implementation evidence | Verification evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TR-01 | 現行サイトと改修案を混同せず比較できる | `AGENTS.md`、`basis/README.md`、`basis/system_spec.md` | `currently/` read-only、`proposal/` scope分離 | 対象ページのpath | repo contract、git差分 | ACTIVE |
| TR-02 | 店舗固有性を根拠付きで保持する | `DESIGN.md`、原典画像、Evidence Matrix | `design-intent`、Swap / Flattening test | 対象work packetのIntent・Source map | `visual-fidelity` audit | ACTIVE |
| TR-03 | 原典の意味情報を欠落させない | 原典HTML・画像・更新情報 | HTML化、画像保持、別導線、意図的除外を分類 | Source map、対象HTML | Content and task audit | ACTIVE |
| TR-04 | 主要幅で理解・操作できる | `basis/non_functional_requirements.md` | 390 / 768 / 1440px確認 | 対象HTML/CSS | Browser audit | ACTIVE |
| TR-05 | 画像主体ページの転送量と可読性を両立する | 原典画像の容量・寸法・表示幅 | `picture`、responsive candidates、fallback | 対象HTML、派生asset | `currentSrc`、完了状態、視覚監査 | CONDITIONAL |
| TR-06 | 判断と変更が再現・引継ぎ可能である | `basis/decision_log.md`、work packet schema | OODA / PDCA、retrospective | Intent、Decision、Audit、Release | packet validator | ACTIVE |
| TR-07 | 公開状態を誤認しない | `release.md`、GitHub CI / Pages | commit、push、PR、merge、publishを分離 | release record | CI、Pages、公開URL | ACTIVE |
| TR-08 | Chassis導入を将来安全に自動化する | `repo_chassis_codex_handoff.md`（参考） | 現時点はread-only inspect / validateを優先 | `tools/validate_repo_contract.py` | contract validation | ROADMAP |
| TR-09 | 正本・比較元・改修対象を混同しない | `basis/README.md`、`basis/system_spec.md` | `DESIGN.md`、branch5の`menu/`と`menu-html/`を分離 | repo contract、work packet | scope audit | ACTIVE |
| TR-10 | Web公開に必要な最小品質領域を明示する | `basis/non_functional_requirements.md`、MECE matrix | SEO、依存・権利・個人情報、鮮度を最小確認 | audit、release | CI baseline + human review | ACTIVE |
| TR-11 | CIで基盤構造と証跡形式を再現可能に検証する | `.github/workflows/ci.yml`、validation scripts | 全branchのcontract、Skill、work packetを検証 | CI result | GitHub Actions | ACTIVE |
| TR-12 | 新規公開変更の運用責任と鮮度確認を記録する | `basis/operations.md`、work-packet schema | Owner、次回確認、rollback、依存・権利確認をrelease recordへ追加 | 新規release.md | packet review | ACTIVE |

## Known gaps

- `init`、`adopt`、`inspect`、`migrate`を一つのCLIとして提供する機能は未実装である。
- 更新担当、更新期限、KPI、実利用者による検証は対象ごとに未確定の場合がある。
- W3C正式検証、RUM、実ネットワークの性能計測はrepo contractだけでは保証しない。
- KPI、実利用者テスト、公開後の実監視は事業・運用Ownerの決定が必要であり、文書基盤だけでは完結しない。
