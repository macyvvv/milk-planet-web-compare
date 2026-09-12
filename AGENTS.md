# milk planet Web改修 repo contract

このrepoは、`milk-planet.com`の現状再現と改修案を比較し、情報設計・UI・視覚的な差分を検証するための静的な提案repoである。
実装そのものより先に、正本、対象ブランチ、情報階層、視覚的根拠を確認する。

## 参照順

1. `basis/README.md`: 文書の役割、正本、作業境界
2. `basis/policy.md`: 改修方針と禁止事項
3. `basis/system_spec.md`: 対象画面、ユーザー、情報設計
4. `basis/WBS.md`: 現在の作業対象と成果条件
5. `basis/current_state.md`: 現状再現と既知の制約
6. `DESIGN.md`: Branch5 HTML版を含む視覚的正本
7. `basis/decision_log.md`: 過去の採用案と却下理由
8. 対象ディレクトリのHTML/CSS/画像

## ディレクトリ境界

- `currently/`: 現行サイトの参照正本。改修案の作業で変更しない。
- `proposal/branch5/`: 現在の改修案。承認済みwork packetに記載された対象だけを変更する。branch1〜4は廃止済み。
- `proposal/branch5/`: HTMLメニューと店舗固有表現の比較正本。視覚・原稿の根拠として扱う。
- `basis/`: repo固有の設計、要件、判断、運用情報。
- `agents/`、`skills/`: repo内のレビュー手順と再利用可能な作業知識。
- `vendor/`: 既存の外部資産。新規依存を追加せず、変更時は影響範囲を確認する。

既存資産の移動、削除、無条件上書きは禁止する。現状と改修案を比較する目的を損なう変更は、実装前に作業範囲を再評価する。

## visual deliverableの作業契約

Web/UIの新規制作・大幅改修は`skills/planet-web-workflow/SKILL.md`を親手順として実施する。親Skillが作業パケット、承認境界、戻り条件、独立監査、レトロスペクティブ、release状態を管理し、`design-intent`と`visual-fidelity`が専門判断を担当する。

`DESIGN.md`の禁止事項と正本順位を優先する。元資料にない装飾、見出し、価格、機能を一般的なUI慣習だけで追加しない。店舗固有の表現を共通テンプレートへ過度に正規化しない。

新しい視覚方向を作る前は`skills/design-intent/SKILL.md`、実装後の忠実度確認は`agents/22_VISUAL_FIDELITY_REVIEWER.md`と`skills/visual-fidelity/SKILL.md`を参照する。根拠不足を装飾や捏造した人間の動機で埋めず、保留として扱う。

Planet系のページ制作・大幅改修では、上記2つのSkillを`skills/planet-web-workflow/SKILL.md`のOODA / PDCA手順から呼び出す。作業パケット、独立監査、レトロスペクティブ、commit / push / PR / merge / publishの状態を混同しない。

## 完了前の確認

文書・構造の確認は、外部依存なしで次を実行する。

```bash
python3 tools/validate_repo_contract.py
```

UI変更では、上記に加えて実ブラウザまたはスクリーンショットで主要幅を確認する。要件、正本、作業境界、重要な判断が変わった場合は、関連する`basis/`文書と`decision_log.md`を同時に更新する。
