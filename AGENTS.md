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
- `proposal/branch1/`: 現在の主な改修案。WBSに記載された対象だけを変更する。
- `proposal/branch5/`: HTMLメニューと店舗固有表現の比較正本。視覚・原稿の根拠として扱う。
- `basis/`: repo固有の設計、要件、判断、運用情報。
- `agents/`、`skills/`: repo内のレビュー手順と再利用可能な作業知識。
- `vendor/`: 既存の外部資産。新規依存を追加せず、変更時は影響範囲を確認する。

既存資産の移動、削除、無条件上書きは禁止する。現状と改修案を比較する目的を損なう変更は、実装前に作業範囲を再評価する。

## visual deliverableの作業契約

Web/UIを変更する場合は、次の順で判断する。

`目的・対象者・最初に見る情報`
→ `情報階層と視覚仮説`
→ `実装`
→ `390 / 768 / 1440pxで表示確認`
→ `元画像・隣接ページとの比較レビュー`
→ `basis/decision_log.mdへの記録`

`DESIGN.md`の禁止事項と正本順位を優先する。元資料にない装飾、見出し、価格、機能を一般的なUI慣習だけで追加しない。店舗固有の表現を共通テンプレートへ過度に正規化しない。

詳細なレビュー手順は`agents/22_VISUAL_FIDELITY_REVIEWER.md`と`skills/visual-fidelity/SKILL.md`を参照する。

## 完了前の確認

文書・構造の確認は、外部依存なしで次を実行する。

```bash
python3 tools/validate_repo_contract.py
```

UI変更では、上記に加えて実ブラウザまたはスクリーンショットで主要幅を確認する。要件、正本、作業境界、重要な判断が変わった場合は、関連する`basis/`文書と`decision_log.md`を同時に更新する。
