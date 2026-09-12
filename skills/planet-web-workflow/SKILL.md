---
name: planet-web-workflow
description: Orchestrate Planet site and visual-page work through a repeatable OODA/PDCA lifecycle, routing pre-build intent, post-build visual audit, retrospective, and release verification to the responsible skills. Use for new pages, substantial HTML/CSS reconstruction, or cross-page visual changes; use focused skills directly for isolated defects.
metadata:
  short-description: "Run the Planet web OODA/PDCA workflow"
---

# Planet web workflow

Skill間の責務と呼び出し順は[`skills/README.md`](../README.md)を参照する。このSkillはライフサイクル、証跡、承認境界、release状態を担当する。

このSkillは、サイト制作そのものではなく、サイト制作を再現可能にする作業ループを担当する。目的は「AIらしくない装飾」を生成することではない。正本、利用者の目的、情報階層、根拠、失敗結果を次の判断へ接続し、店舗固有性を保ったまま修正を反復できる状態を作ることである。

## 適用範囲

- Planet系の新規ページ、既存ページ再構成、HTMLメニュー化、店舗固有ビジュアルの変更
- 複数ファイル・複数店舗へ影響するUI変更
- ユーザー指摘、監査結果、公開後の差分を次の実装へ反映する作業

単純な誤字修正や既知の局所バグは、対象Skillへ直接進んでよい。ただし、画像の役割、情報階層、正本、アクセシビリティへ影響する場合はこのSkillへ戻る。

## Routing

| 状況 | 主担当 | 親Skillの責務 |
| --- | --- | --- |
| 新しい視覚方向・大幅な再構成 | `design-intent` → `visual-fidelity` | 順序、証跡、戻り条件 |
| 既存ページの表示欠陥 | `visual-fidelity` | Scope、監査、学習記録 |
| 画像主体ページの転送最適化 | `design-intent` → `visual-fidelity` | 適用条件、原本保護、実表示と配信結果の証跡 |
| repo契約・作業パケット | `planet-web-workflow` | 状態、validator、release記録 |

親Skillは、子Skillが定義する画像・色・フォント・HTML・ブラウザ検査を複製しない。子Skillの完了条件を作業パケットへ集約する。

## OODA / PDCA対応

| OODA | PDCA | このSkillの成果物 |
| --- | --- | --- |
| Observe | Plan | `intent.md`のViewing situation、正本、現状、制約 |
| Orient | Plan | `source-map.md`、情報階層、Evidence Ledger、Unknowns |
| Decide | Plan | `decision.md`、Scope、Commitments、非採用、DoD |
| Act | Do | 承認済みファイルへの実装と検証可能な変更 |
| Check | Check | `audit.md`、静的検証、ブラウザ観測、独立レビュー |
| Learn / Act again | Act | `retrospective.md`、Skill・decision logへの一般化 |
| Release | Check / Act | `release.md`、commit / push / PR / merge / publishの状態 |

OODAとPDCAを一つの説明にまとめて終わらせない。各段階で証拠を作り、失敗した段階へ戻る。

## Philosophy learning loop

このSkillの学習対象は、装飾の「人間らしさ」ではなく、状況・目的・根拠・非採用・トレードオフから判断する方法である。Skill改善または複数ページ監査では、[philosophy-learning-gate.md](references/philosophy-learning-gate.md)を使い、実装前と監査後の判断を接続する。

- `Observe / Orient`: ページ全体の対象範囲、正本、利用状況、事業上の結果を固定する。
- `Decide`: 現状維持を含む代替案、残す不均衡、転用境界、未知点を記録する。
- `Check`: 変更済みページ、未変更の比較基準、共有consumerを同じ表で確認する。
- `Learn`: 指摘を`LOCAL`、`STRUCTURAL`、`UNKNOWN`へ分類し、複数ページで成立する原理だけをSkillへ昇格する。

チェックリストの追加だけで学習完了としない。原理が別ページで成立するか、または成立しない反例があるかを記録する。

## 作業パケット

承認済みの変更では、`basis/work/<change-id>/`に作業パケットを作る。`<change-id>`は日付と短い目的を組み合わせ、同じ判断履歴を上書きしない。形式と必須見出しは[work-packet-schema.md](references/work-packet-schema.md)を使う。

最低限、次のファイルを保持する。

- `intent.md`: 利用状況、成果、正本、情報階層、Commitments、非採用、トレードオフ
- `source-map.md`: 原典の画像・文言・告知・特典・注意事項ごとの処理結果
- `decision.md`: Scope、対象ファイル、状態、ゲート判定、未知点、DoD
- `audit.md`: 独立監査の観測事実、幅、アンカー、アクセシビリティ、残存リスク
- `retrospective.md`: 何が起きたか、どの段階で検出したか、どのゲートを改善するか
- `release.md`: commit、push、PR、merge、公開確認を別々に記録

完了後は、`python3 skills/planet-web-workflow/scripts/validate_work_packet.py basis/work/<change-id> --state <state>`でパケット構造を確認する。これは判断の正しさを証明するものではなく、証跡の欠落を防ぐ補助検証である。

## 実行手順

### 1. Preflight / Observe

- `AGENTS.md`、`basis/README.md`、`policy.md`、`system_spec.md`、`WBS.md`、`DESIGN.md`、`decision_log.md`を読む。
- 対象ブランチ、正本、変更可能範囲、既存の未コミット変更を確認する。
- `currently/`、Branch5の原典画像版、HTML版、店舗CSS、共有CSS、隣接ページを比較対象として確定する。
- 共有CSS/JSを変更する場合は、先にconsumer matrixを作る。対象ファイル、参照ページ数、ページファミリー、セレクタ／イベント対象、script load order、任意依存を対応づけ、単一ページの見た目だけで共通化の安全性を判断しない。
- 共有スクリプトのbehavior selectorは、ソース上の命名だけでなく代表ページの実DOMへ照合する。存在しないクラスや古いmarkupを対象にしていないか、ページファミリーごとに確認する。
- 原典アセットと既存情報の棚卸しは`design-intent`のSource lock / Content and task gateへ渡す。親Skillでは対象範囲と正本の所在だけを記録する。
- 画像が`content`・`hero`として意味を持つ、または初期表示の転送量へ影響する場合は、原典のバイト数・寸法・実表示の最大幅を`design-intent`へ渡す。アイコンや意味のない装飾へ一律適用しない。
- 静的ミラーで資産が見つからない場合、ローカル欠落と原典不存在を同一視しない。`document.write`、テンプレート、データ配列など実行時に生成される参照を展開し、原典の公開URLまたは正本を再確認してから`UNKNOWN`を解消する。
- 取得したバイナリは拡張子だけで信用せず、HTTPステータス、Content-Type、マジックバイト、寸法を確認する。エラーHTMLを画像・JS・CSSの拡張子で保存した状態を、実体のある資産として扱わない。
- 資産の影響判定は`source → local target → active consumer → matched DOM`で行う。ディレクトリ内に無効ファイルがあること、CSSに文字列があること、HTMLからstylesheetが読み込まれることだけでは、実行時欠陥や404と判定しない。
- 事実、ユーザー要求、制約、推論、不明を分離する。正本が決まらない情報は統合せず`UNKNOWN`にする。
- Skill改善または複数ページ監査では、対象ページ、比較基準、既存変更ページ、共有consumerを先に列挙する。単一ページの確認を全体のPASSへ拡張しない。

この段階では、承認前の実装・設定変更・外部書き込みを行わない。

### 2. Orient / Intent lock

- 誰が何を知り、次に何をするかを決める。Revenueまたは来店・予約・応募・問い合わせへ接続する。
- 最初に見る情報、次に理解する関係、最後に取る行動を定義する。
- 新しい視覚方向は`design-intent`へ渡し、既存方向の表示監査は`visual-fidelity`へ渡す。
- 親Skillでは、子Skillの入力・出力・未解決事項が作業パケットに記録されていることだけを確認する。

### 3. Decide / Scope lock

- 重要なCommitmentsは最大3つに絞る。
- Deliberate exclusions、Tradeoffs、Unknowns、Parking Lotを明記する。
- 対象ファイルと対象外ファイルを明示する。無関係なdirty worktree変更を取り込まない。
- DoDを、情報完全性、店舗固有性、レスポンシブ、アクセシビリティ、保守性、リリース状態まで含めて定義する。
- 画像配信を含む場合は、原典の正本・fallback保護、候補幅の根拠、実表示での可読性、`currentSrc`、画像完了、変換条件と再生成リスクをDoDへ含める。画像配信を含まない場合は、対象外であることを記録する。
- 正本・要件・採用済み設計が衝突した場合は停止して再計画する。ユーザーの指摘は前提の再評価として扱う。

ここで計画とScopeの承認を得る。承認は実装だけを許可し、外部へのpush・PR・merge・publishを自動的には許可しない。

### 4. Act / Implement

- `decision.md`の対象だけを変更する。実装上の画像・HTML・CSS判断は対象Skillの制約に従う。
- `design-intent`のSource lock / Intent gateを通過していない場合は実装しない。
- CSSだけのスキン変更で店舗固有性を作らない。根拠のないノイズ、ランダムな不規則さ、AIらしさを隠す装飾を追加しない。
- 画像配信を変更する場合、原典画像を削除・上書きせず、派生画像を新しい正本にしない。候補幅・形式・画質は実表示幅と可読性に基づけ、容量削減率だけで採用しない。
- 実装中に前提が崩れたら、局所パッチを続けず`decision.md`を更新し、必要ならOrientへ戻る。

### 5. Check / Independent audit

実装者の説明を正解とみなさず、別の観点で監査する。

- `visual-fidelity`のMandatory post-build audit gateを実行し、結果を`audit.md`へ転記する。
- `design-intent`のCommitments、非採用、トレードオフが実装後も保持されているかを照合する。
- W3C相当検証を実行できない場合は理由、代替確認、残存リスクを`audit.md`へ明記する。
- 画像配信を含む場合は、変換前後のバイト数、候補幅、原典fallback、実表示の可読性、ブラウザの`currentSrc`、lazy loading後の完了状態、レイアウトシフトを独立に確認する。ファイル参照の存在だけではPASSにしない。
- 静的取得・復旧を含む場合は、生成済みURLを静的HTMLの文字列検索だけで完了扱いにしない。実行時出力のURL、原典応答、ローカル配置、実際に適用されるセレクタを分けて監査し、未使用の残骸と実害のある参照を区別する。
- 共有CSS/JSを変更した場合は、consumer matrixの全対象を静的に検査し、代表ページでselector-to-markup、任意依存の欠損時挙動、再初期化時の重複登録を確認する。全ルートを同じ完了条件で待てない場合は、DOM到達、load完了、navigation timeout、外部依存エラーを別ステータスで記録する。

ゲートに失敗した場合は、修正後に同じ監査を再実施する。未検証のままPR・merge・publishへ進まない。

### 6. Learn / Retrospective

`retrospective.md`に、次の5点を必ず記録する。

1. 何が起きたか（観測事実）
2. どの段階で検出したか（Observe / Orient / Decide / Act / Check / Release）
3. なぜ前段のゲートで防げなかったか
4. 今回だけの修正か、再利用可能なルールか
5. ルール化する場合、どのSkill・validator・basisへ反映するか

単一ページの好みや偶然をSkillへ一般化しない。複数回発生した問題、または今回のように情報欠落・画像重複・リリース状態混乱を生んだ構造問題だけを親Skillへ昇格する。

さらに、`philosophy-learning-gate.md`の`LOCAL`、`STRUCTURAL`、`UNKNOWN`分類を使い、修正結果ではなく判断原理の更新要否を記録する。`STRUCTURAL`へ昇格する場合は、別ページでの成立根拠と過剰一般化の反例を必ず併記する。

画像配信の学習を一般化する場合は、ソース容量、表示幅、候補選定、fallback、実表示可読性、`currentSrc`、変換ツールの再現性を一つの証跡として残す。WebPや特定の画質値を全ページの固定仕様にはしない。

### 7. Release verification

リリース状態を混同しない。

`working tree → committed → pushed → PR created → PR merged → published URL verified`

各状態を`release.md`へ別々に記録する。ローカルのcommit、リモートブランチ、PRの存在、GitHub上の`MERGED`、公開URLの内容は相互の代替にならない。外部操作が承認されていない場合は、そこで停止する。

## Stop conditions

- 正本、対象範囲、主要な利用者、最終行動が不明
- 原典の意味のある情報の扱いが決まっていない
- 重要判断が推論だけに依存する
- 実装と監査の結果が矛盾する
- 未検証のままPR・merge・publishを求められている
- 作業ツリーに無関係な変更があり、対象を安全に分離できない

停止時は、不足情報と再開条件をパケットへ記録する。推測で埋めない。

## Completion gate

- 作業パケットが検証済みである
- Source lock、Content and task、Structure、Intent、Independent auditを通過している
- 原典の意味のある情報に未説明の欠落がない
- 画像配信を含む場合、適用条件、原典保護、候補幅、可読性、`currentSrc`、fallback、再生成リスクが作業パケットに記録されている
- 主要幅と主要アンカーを確認している
- 共有CSS/JS変更では、consumer matrix、selector-to-markup照合、依存欠損時の失敗挙動、再初期化の安全性、ルート別timeoutの有無が記録されている
- 画像とHTMLの役割と重複が説明できる
- 残存リスクと未検証範囲が記録されている
- レトロスペクティブが次回の具体的な検査へ接続されている
- Releaseの各状態が事実で記録されている
- Skill改善または複数ページ監査では、哲学的な判断原理、現状維持案、転用境界、学習分類が記録されている
