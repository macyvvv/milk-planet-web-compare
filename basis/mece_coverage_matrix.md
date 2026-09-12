# MECE coverage matrix

この文書は、Planet系ページ制作とRepo Chassisの運用について、工程・品質領域・正本・担当・証跡・自動検証・Ownerの抜けと重複を検出するための管理表である。完成ページの模倣仕様ではなく、基盤がどこまで責任を持つかを明示する。

## 判定ルール

- 各行にはPrimary ownerを1つだけ置く。協力するSkillや文書はEvidence / dependencyへ記録する。
- 正本は1行につき1つを原則とする。複数資料が必要な場合は、主正本と参照資料を分ける。
- `COVERED`は、手順・証跡・検証方法・責任が定義済みであることを意味する。文書が存在するだけでは該当しない。
- `PARTIAL`は一部が定義済みだが、実行・担当・自動検証のいずれかが欠けている状態である。
- `CONFLICT`は正本または作業範囲が複数解釈できる状態である。ページ制作の実装開始条件を満たさない。
- `GAP`は、必要性があるが担当・手順・証跡のいずれかが未定義の状態である。
- `ROADMAP`はChassisの将来機能として認識済みだが、現行のPlanetページ制作の完了条件には含めない。
- `OUT OF SCOPE`は、この静的Web repoでは扱わないと明示的に決めた領域である。未決定のまま使ってはならない。

## A. Lifecycle coverage

| ID | 工程 | Primary owner | Canonical source | Required evidence | Automated check | Owner | Status | 未対応・境界 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L-00 | Agent contract / authority / handoff | `agents/README.md` | `agents/README.md`、`AGENTS.md` | Role、Scope、Authority、severity、independence、handoff、DoD | repo contract・参照リンク検査 | chassis maintainer | COVERED | 契約は定義済みだが、実行時の権限・独立性の実証は人手確認 |
| L-01 | Intake / request routing | `planet-web-workflow` | `skills/README.md` | change-id、対象、依頼種別 | Skill存在・リンク検査 | maintainer | PARTIAL | 単純修正・大幅改修・Chassis変更の判定を機械化していない |
| L-02 | Observe / scope lock | `planet-web-workflow` | `basis/README.md`、対象work packet | branch、dirty tree、比較元、対象外 | repo contract、git差分 | maintainer | COVERED | branch5、branch5/menu、branch5/menu-htmlの境界をpath単位で固定 |
| L-03 | Source lock / content inventory | `design-intent` | `DESIGN.md`、原典、Evidence Matrix | source-map、画像・文言・告知・価格の棚卸し | packet構造のみ | content owner unknown | PARTIAL | 最新正本、更新担当、更新期限を自動確認できない |
| L-04 | Orient / intent and hierarchy | `design-intent` | `DESIGN.md`、intent.md | Evidence Ledger、Hierarchy、非採用、Tradeoffs | packet構造のみ | requester + reviewer | COVERED | 意図の妥当性自体は人手判断 |
| L-05 | Decide / approval and DoD | `planet-web-workflow` | decision.md、AGENTS.md | Scope、Target files、DoD、承認記録 | packet state / gate syntax | requester | PARTIAL | 承認者・承認日時・Scope変更履歴の型がない |
| L-06 | Act / implementation | `planet-web-workflow` | decision.md、対象ファイル | commit差分、派生asset条件 | 変更対象の完全なScope検査なし | implementer | PARTIAL | 対象外変更の自動拒否と生成物ポリシーが未定義 |
| L-07 | Check / independent audit | `visual-fidelity` | `agents/22_VISUAL_FIDELITY_REVIEWER.md`、audit.md | 390 / 768 / 1440、browser、static、a11y、findings | packet構造のみ | independent reviewer | PARTIAL | HTML/W3C、リンク、性能、実視覚の自動検査がCIにない |
| L-08 | Learn / retrospective | `planet-web-workflow` | retrospective.md、decision_log.md | 検出工程、原因、一般化、反映先 | packet構造のみ | maintainer | COVERED | Skillへ昇格する基準の実績評価は人手 |
| L-09 | Release verification | `planet-web-workflow` | release.md、operations.md | commit、push、PR、merge、公開URL | release記録の形式のみ | release owner unknown | PARTIAL | 外部状態の実在確認と対象branchのCI実行が未接続 |
| L-10 | Operate / freshness / incident / deprecate | `planet-web-workflow` | `basis/operations.md`、release.md | role owner、次回確認、障害、復旧、廃止記録 | packet構造のみ | release/content owner | PARTIAL | 新規packetの記録欄は定義済みだが、実在のOwner、SLA、監視基盤は未確定 |

## B. Quality and governance coverage

| ID | 品質領域 | Primary owner | Canonical source | Required evidence | Automated check | Owner | Status | 未対応・境界 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Q-15 | Agent independence / escalation / severity | `agents/README.md` | `agents/README.md`、対象work packet | 独立性、重大度、停止・再計画、引き継ぎ | contract・packet構造検査 | chassis maintainer + reviewer | COVERED | 実際の役割分離と判断の妥当性は人手確認 |
| Q-01 | 正本・店舗固有性・設計意図 | `design-intent` + `visual-fidelity` | `DESIGN.md`、Evidence Matrix | source lock、Evidence Ledger、Swap / Flattening test | packet構造のみ | design reviewer | PARTIAL | 実質判断は人手であり、視覚品質の自動判定はしない |
| Q-02 | コンテンツ完全性・更新情報 | `visual-fidelity` | source-map、traceability | HTML化／画像保持／別導線／除外の対応表 | 形式検査のみ | content owner unknown | PARTIAL | 最新価格・特典・更新期限の責任系統がない |
| Q-03 | 情報設計・タスク達成 | `design-intent` | intent.md、system_spec.md | hierarchy、主要タスク、到達距離 | 未定義 | product owner unknown | PARTIAL | 予約・来店・応募のタスク成功を測定していない |
| Q-04 | HTML/CSS構造・機能 | `visual-fidelity` | DESIGN.md、対象HTML/CSS | heading、ID、リンク、画像、フォームの検査 | static HTML baselineはCI接続、意味・機能は人手 | frontend reviewer | PARTIAL | HTML validator、機能E2E、CSS構文検査がない |
| Q-05 | 視覚品質・店舗固有性 | `visual-fidelity` | DESIGN.md、元画像版 | viewport観測、比較画像、採用／保留／却下 | 自動判定なし | visual reviewer | COVERED | 実質判断は人手。自動PASSで代替しない |
| Q-06 | Responsive / interaction | `visual-fidelity` | NFR、対象CSS | 390 / 768 / 1440、anchor、keyboard、focus | `scrollWidth`以外は未定義 | frontend reviewer | PARTIAL | タッチ、zoom、reduced motion、実機差が未定義 |
| Q-07 | Accessibility | `visual-fidelity` | NFR、DESIGN.md | alt、見出し、focus、keyboard、contrast、非テキスト | W3C相当検査をCIに未接続 | accessibility reviewer | PARTIAL | 自動検査手段、適合レベル、例外管理が未定義 |
| Q-08 | Image delivery / performance | `visual-fidelity` | NFR、image delivery work packet | bytes、寸法、候補幅、fallback、currentSrc、可読性 | HTML参照・秘密情報baselineのみCI接続 | frontend reviewer | PARTIAL | currentSrc、HTML/CSS/JS、font、LCP/CLS、実ネットワークの予算がない |
| Q-09 | SEO / discoverability | `visual-fidelity` | `basis/non_functional_requirements.md` | title、description、canonical、OGP、sitemap、robots、構造化データの要否 | 未定義 | frontend reviewer | PARTIAL | 最小確認は定義済みだが専用自動検査は未接続 |
| Q-10 | Security / privacy / legal / license | `planet-web-workflow` | `basis/non_functional_requirements.md`、operations.md | 外部依存、秘密情報、権利、個人情報入力の確認 | local reference・secret baselineをCI接続 | maintainer + release owner | PARTIAL | 専用スキャンと実在の権利Ownerは未確定 |
| Q-11 | Release / rollback / observability | `planet-web-workflow` | operations.md、release.md | rollback対象、公開確認、障害記録、監視結果 | contract、Skill、packet CI | release owner | PARTIAL | 公開後監視・通知・復旧演習がない |
| Q-12 | Business outcome / measurement | 明示的対象外（現時点） | `basis/non_functional_requirements.md` | KPI未定義の事実、未計測の明示 | decision log | business owner not assigned | OUT OF SCOPE | Ownerと計測方法の承認なしに数値目標を捏造しない |
| Q-13 | Chassis portability / migration | `planet-web-workflow`（現状） | `repo_chassis_codex_handoff.md` | inspect、collision、migration、rollback | contract validatorのみ | chassis maintainer | ROADMAP | `init`、`adopt`、`inspect`、`migrate` CLIが未実装 |
| Q-14 | Repository cleanliness / reproducibility | `planet-web-workflow` | AGENTS.md、operations.md | 生成物、依存、変換条件、環境、再生成手順 | 一部のdiff検査のみ | maintainer | PARTIAL | `.gitignore`、artifact policy、依存・フォントの固定がない |

## C. Current conflicts and decisions required

| ID | Conflict / gap | Decision required | Completion condition | Status |
| --- | --- | --- | --- | --- |
| C-01 | `DESIGN.md`と将来の`design/` | 現行正本を`DESIGN.md`に固定する | registry・Skill・system specが一致する | RESOLVED |
| C-02 | 廃止済みbranch1〜4とbranch5 | 比較元、改修対象、公開対象をpath単位で分類する | work packetとREADMEの作業境界が矛盾しない | RESOLVED |
| C-03 | Matrix / traceability / source-map / decision log | 各文書を「横断要件」「個別証拠」「判断」「学習」に分離する | 1情報1正本、他文書は参照リンクだけになる | RESOLVED |
| C-04 | CIの対象と検査範囲 | 全branchでcontract、Skill、work packetのbaselineを実行する | workflowとvalidation scriptが存在し、ローカルで再現できる | RESOLVED |
| C-05 | 公開後責任 | role owner、freshness、incident、deprecateを記録する | operationsに手順があり、各releaseでOwnerが未確定なら停止する | PARTIAL |
| C-06 | SEO / security / legal / KPI | 最小確認を必須化し、KPIは現時点の対象外と明示する | Q-09〜Q-12の状態とNFRが一致する | RESOLVED |

## Completion rule

新しいページ制作を`MECE準拠`として開始できるのは、次の条件を満たす場合だけとする。

1. `CONFLICT`が0件である。
2. 実施対象のLifecycle行に、Primary owner、Canonical source、Required evidence、検証方法がある。
3. `GAP`は対象外として明示されるか、作業Scopeへ含められている。
4. `PARTIAL`の残存理由と完了条件がwork packetへ引き継がれている。
5. `RELEASED`へ進む場合、公開後運用のOwnerとrollback条件が記録されている。

この表自体は不足を解消した証明ではなく、不足を見落とさずに次のScopeへ接続するためのゲートである。

## 2026-09-11 Philosophy learning gate update

`design-intent`、`planet-web-workflow`、`visual-fidelity`へ、哲学を装飾ではなく判断原理として扱うゲートを追加した。新規のSkill改善・複数ページ監査packetでは、現状維持案、残す不均衡、転用境界、未知点、対象Coverage、回帰結果を記録する。監査所見は`LOCAL`、`STRUCTURAL`、`UNKNOWN`へ分類し、複数ページの根拠と反例なしに共通ルールへ昇格しない。

この追加により、L-03、L-07、Q-01、Q-02、Q-08の証跡責務は明確化したが、原典との意味一致、視覚品質、実際の事業成果を自動検証できる状態にはなっていない。そのため既存の`PARTIAL`判定は、実質判断が人手である限り維持する。validatorは証跡の構造だけを検査する。
