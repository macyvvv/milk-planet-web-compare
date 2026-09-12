# milk-planet web 改修 basis

## 目的
- 既存サイト `https://milk-planet.com/` を、情報構造とUIの課題を分離して整理する。
- まずは「現状把握」と「改修方針」を固定し、その後に実装へ進む。

## 現状で確認できた課題
- PC表示で余白、階層、視線誘導が弱く、SP前提の縦積みレイアウトに見える。
- クリック可能要素の判別が弱い。リンク、ボタン、画像、見出しの役割が混在している。
- 子サイト群でカルーセルが情報探索を阻害している可能性が高い。
- 店舗、キャスト、システム、イベント、採用の情報粒度が混在し、初見ユーザーの意思決定がしづらい。

## このフェーズの成果物
- 現状分析
- 画面別の課題整理
- 改修方針
- 情報設計の再定義
- テスト観点

## 方針
- まず全体の情報設計を再構成する。
- その上で、ホーム、店舗一覧、個別店舗、キャスト、システム、イベント、採用を共通の設計原則で揃える。
- 装飾より先に、可読性、操作性、導線を優先する。
- 改修は既存素材の再利用とレスポンシブ再設計を中心に据える。
- 公式サイトはSNSの代替ではなく、確認と意思決定を支える補助装置として定義する。

## 文書の責務と正本

このrepoでは、再利用可能な作業手順とrepo固有の状態を混同しない。

- `AGENTS.md`: 常時適用するrepo contractとwayfinding。詳細な方法論は持たせない。
- `basis/`: このrepo固有の目的、要件、状態、判断、運用、作業計画。
- `basis/planet_page_evidence_matrix.md`: Shandy／新宿の原典アセット、意味情報、実装処理、AI一般化を追跡する学習用正本。
- `DESIGN.md`: 現行repoの視覚的正本とデザイン判断。Chassis引継ぎ資料にある`design/`は、このrepoでは未導入の将来構成であり、勝手に併設しない。
- `agents/README.md`: ドメイン非依存のAgent契約。役割、権限、重大度、独立性、引き継ぎ、学習境界を定義する。
- `agents/*.md`、`skills/`: それぞれ専門Agentの判断プロファイルと、作業の再利用可能な手順。Agent契約を上書きしない。
- `currently/`: 現行サイトの比較用正本。
- `proposal/`: 改修案。現在の実装対象は`proposal/branch5/`のみとし、過去のbranch1〜4は2026-09-12に比較役割を終えて削除した。

正本が衝突する場合の基本順位は、対象に直接対応する観測資料、`basis/`の要件・判断、`DESIGN.md`の共通ルール、一般的な実装慣習の順とする。価格・文言・画像・導線を推測で補わない。

## 作業境界

- `currently/`は読み取り専用の参照対象とする。
- 現在の改修対象は`proposal/branch5/`である。branch1〜4は廃止済みで、現行作業の対象に含めない。
- `proposal/branch5/shop/<store>/menu/`は原典画像メニューの比較正本であり、変更しない。
- `proposal/branch5/shop/<store>/menu-html/`はHTML化比較実装であり、変更する場合は承認済みwork packetの対象ファイルに限定する。元の`menu/`ルートは変更しない。
- 既存ファイルの移動・削除・無条件上書きは行わない。
- UI変更では、実装前の目的・情報階層の確認と、390px / 768px / 1440pxでの表示確認を必須とする。
- `DESIGN.md`から`design/`へ移行する場合は、先にdecision logで正本・移行範囲・rollbackを決める。

文書とディレクトリの最低限の整合性は`python3 tools/validate_repo_contract.py`で確認できる。これは読み取り専用であり、ファイルの生成・移動・修正を行わない。

## 文書registry

`basis/`直下の文書は、存在するだけでは現行仕様とはみなさない。以下の分類と正本責務を優先する。

| 分類 | 正本・対象 | 責務 | 更新条件 |
| --- | --- | --- | --- |
| Canonical | `policy.md`、`system_spec.md`、`WBS.md`、`current_state.md` | 現行の方針、要件、作業対象、状態 | 要件・対象・制約が変わったとき |
| Canonical | `decision_log.md`、`risk_register.md`、`non_functional_requirements.md`、`operations.md`、`requirements_traceability.md`、`mece_coverage_matrix.md` | 判断、リスク、品質基準、運用、要件lineage、責務の抜け漏れ | 採用判断・リスク・検証・運用・責務境界が変わったとき |
| Reference | `architecture.mmd`、`link_map.mmd`、`page_list.md`、`cast_photos.md` | 構造、導線、対象一覧、素材一覧 | 構造・URL・素材が変わったとき |
| Evidence | `planet_page_evidence_matrix.md`、`work/<change-id>/` | 原典比較、学習、個別変更の証跡 | 観測・監査・releaseごと |
| Historical | `branch1.md`、`clone_scope.md`、`implementation_instructions.md`、`shop_repair_wbs.md`、`final_changes_summary.md`、`user_requests_note.md` | 過去の方針・経緯・参考資料 | 現行仕様の根拠として更新しない |
| Constraint | `constraints.md`、`anti_requirements.md`、`glossary.md` | 禁止事項、用語、補助制約 | 禁止事項・用語が変わったとき |

分類が不明な文書を、推測でCanonicalへ昇格させない。歴史資料を削除・移動せず、現行判断へ反映する場合は`decision_log.md`へ新しい判断として記録する。

## 更新プロトコル

- 要件・品質基準の変更は、`system_spec.md`または`non_functional_requirements.md`と`decision_log.md`を同期する。
- 作業対象・優先順位の変更は、`WBS.md`と対象のwork packetを同期する。
- 正本・情報の処理結果は、`requirements_traceability.md`と対象work packetへ記録する。
- 工程・品質領域・担当・検証方法の追加や境界変更は、`mece_coverage_matrix.md`と`decision_log.md`を同期する。
- 再利用可能な方法論の変更は`skills/`へ、repo固有の状態や判断は`basis/`へ記録する。
- 公開状態は`release.md`の事実を正本とし、ローカルcommitやPRの存在だけで公開済みと判定しない。
- 文書の追加・変更後は`python3 tools/validate_repo_contract.py`を実行する。
