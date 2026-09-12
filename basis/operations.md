# 運用手順書 (Operations Guide)

> Status: MIXED LEGACY / CANONICAL
>
> このファイル冒頭のDB・個人情報運用は、この静的Web repoの現行運用正本ではない。過去資料として保持するが、Planetページ改修の手順として使用しない。静的WebのCanonical operationは後半の「5. Planet web repository operations」とする。

本ドキュメントは、システム移行や日々の運用においてデータの一貫性と個人情報保護を維持するための運用手順・ルールを定めます。

## 1. データベース・マイグレーション時のロールバック手順 (D-06)

現在のORM（Prisma）と自動移行スクリプト（`migrate-libsql.mjs`）は、**デフォルトでダウンマイグレーション（ロールバック）をサポートしていません**。
本番環境でのマイグレーション失敗によるデータ損失やサービス停止を防ぐため、スキーマ変更時は以下の手順を遵守してください。

1. **Down SQLの事前準備**:
   - `npx prisma migrate dev --create-only` を実行してマイグレーションディレクトリを作成した際、必ず変更を元に戻すための `down.sql` を同ディレクトリ内に手動で作成・保存してください。
2. **バックアップの取得**:
   - 本番マイグレーション実行前には、Tursoまたはデータベースプロバイダの機能を用いて、必ずスナップショットバックアップを取得してください。
3. **ロールバックの実行**:
   - 障害発生時は、事前準備した `down.sql` を手動（CLIや管理コンソール）で適用するか、取得したバックアップから直ちにリストアを行ってください。

## 2. 永続DB移行時の店舗コード (store_code) 設定手順 (DO-03)

開発用の一時的な店舗データ（DEMO）から永続的な本番データベースへ移行する際、`stores` テーブルの `code` フィールドには、物理店舗と一意に紐付く正確な店舗コード（例: `001`, `002`）を設定する必要があります。

1. 新規店舗の追加時は、社内管理システムと一致する一意な `code` を割り当ててください。
2. DEMOデータから引き継ぐ場合は、本番運用開始前に必ず `UPDATE stores SET code = '正しい店舗コード' WHERE id = '対象のID';` を実行してコードを正規化してください。

## 3. 通知スナップショットの個人情報保持期間 (DO-05)

`GeneratedNotification` テーブルの `contentSnapshot` カラムには、メールやLINE等へ送信された通知の本文がJSON形式でそのまま保存されます。
ここにはキャストの氏名、シフト希望時間、退店予定日などの個人情報（PII）が含まれる可能性があります。

1. **データ保持の最小化**:
   - 通知内容は「送信履歴の確認」および「システム障害時の監査」目的のみに使用します。
2. **定期的な削除**:
   - 法令およびプライバシーポリシーに従い、**送信から1年経過した古い通知ログは、定期バッチ処理等を用いて削除**する運用を検討してください。
   - `DELETE FROM generated_notifications WHERE created_at < datetime('now', '-1 year');` のようなクエリを定期実行することを推奨します。

## 4. Repo contract の検証

UI改修や文書整理の完了前には、repoの正本・作業境界・レビュー手順への参照が壊れていないことを確認する。

```bash
python3 tools/validate_repo_contract.py
```

この検証は読み取り専用で、以下を確認する。

- 必須のbasis文書、`DESIGN.md`、レビュー手順、対象ディレクトリが存在すること
- `AGENTS.md`が正本・作業境界・検証コマンドを案内していること
- `currently/`と`proposal/branch5/`が比較可能な状態であること。branch1〜4は廃止済み。

検証失敗時は、ファイルを自動生成・移動・修正せず、欠落または参照不整合を確認してから個別に修正する。

## 5. Planet web repository operations

### 5.1 Preflight

1. `git status --short --branch`で既存変更を確認する。
2. `AGENTS.md`、`basis/README.md`、対象work packet、対象Skillを読む。
3. `currently/`を変更対象に含めず、対象ScopeとCanonical sourceを固定する。

### 5.2 Local verification

- 文書・構造: `python3 tools/validate_repo_contract.py`
- Skill形式: `python3 tools/validate_skill_packages.py`
- Codex環境での詳細Skill検査は、利用可能な場合のみ`quick_validate.py`を補助的に実行する。CIの完了条件にはしない。
- 作業証跡: `python3 skills/planet-web-workflow/scripts/validate_work_packet.py <packet> --state <state>`
- 静的HTML baseline: `python3 tools/validate_static_contract.py proposal/branch5/shop`
- UI変更: 390px、768px、1440px前後のブラウザ確認
- 完了前: `git diff --check`、対象ファイルだけの差分確認

### 5.3 Release and rollback

- `working tree → committed → pushed → PR created → PR merged → published URL verified`を別状態として記録する。
- 外部releaseを依頼されていない場合は、commit後に停止する。
- 公開後に問題が見つかった場合は、原因・影響・復旧方法を`decision_log.md`とwork packetへ記録し、原典・直前の公開コミット・fallback資産を使って復旧可能な変更を選ぶ。
- 画像派生物は原典から再生成できる条件を記録し、原典を削除・上書きしない。

### 5.4 Ownership and freshness

個人名が未確定でも、work packetには次の役割を記録する。役割が未割当の場合は`UNKNOWN`とし、公開済み扱いにしない。

| Role | Responsibility | Required record |
| --- | --- | --- |
| Content owner | 価格、特典、イベント、注意事項の正本と更新承認 | source-map、次回確認日 |
| Visual reviewer | 店舗固有性、情報階層、表示品質、アクセシビリティ | audit、採用／保留／却下 |
| Release owner | commitから公開URL確認、rollback判断 | release、公開確認日時 |
| Maintainer | Skill、validator、basis、CIの整合 | decision log、CI結果 |

最低限、各公開前に価格・特典・イベント・主要リンク・画像参照を再確認する。更新周期を事業側が決めていない場合、周期を推測せず`UNKNOWN`として次回確認の依頼を残す。

### 5.5 Incident and deprecation

- 公開後の不具合は、対象URL、影響、検出日時、直前の公開commit、復旧方法、再発防止をwork packetまたはdecision logへ記録する。
- 店舗・イベント・ページを廃止する場合は、公開URL、代替URL、redirectまたは404方針、画像派生物、比較正本の扱いを決めてから変更する。
- rollbackは、直前の公開commitと原典assetを保持した可逆変更を優先する。削除・上書きだけで復旧する手順を作らない。
