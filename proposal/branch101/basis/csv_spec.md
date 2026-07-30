# CSV登録・更新仕様

## 共通規則

- UTF-8 BOM付きCSVを標準とする。
- 適用前に全行を検証・プレビューし、無効行が1件でもあれば反映しない。
- `operation=UPSERT` は自然キーが存在すれば更新、存在しなければ新規作成する。
- CSVに存在しない行を暗黙に削除しない。適用は単一トランザクションで行い、監査ログを残す。
- 数式として解釈される値はエクスポート時に無害化する。

## アカウント

`operation, login_name, display_name, display_name_kana, store_name, pin, permission_level, job_title`

- `pin`: 数字4桁。空欄時は自動生成。適用後の資格情報CSVで一度だけ表示する。
- 新規・更新とも即時ACTIVE。PIN更新時は既存セッションを失効する。
- `permission_level`: `GENERAL_USER`, `STORE_ADMIN`, `AREA_MANAGER`, `SUPER_USER`
- `job_title`: `CAST`, `STORE_MANAGER`, `STORE_DEPUTY_MANAGER`, `AREA_MANAGER`, `SUPER_USER`
- 店長・副店長は同じ `STORE_ADMIN` 権限。役職表示のみ区別する。
- 最後の有効なSUPER_USERの降格は拒否する。

## その他のUPSERT

| 種別 | 自然キー | 主な列 |
|---|---|---|
| 店舗 | `name` | `status` |
| 店舗所属 | `login_name + store_name + valid_from + membership_type` | `valid_to` |
| 標準シフト | `login_name + day_of_week` | `is_working, start_time, end_time, note` |
| ピリオド締切 | `period_start_date + store_name` | `submission_open_at, submission_deadline_at` |
| イベント | `name + event_date` | `is_all_stores, store_names, cast_note, admin_note` |
| 確定シフト | `login_name + period_start_date + work_date` | 店舗、開始・終了、注記 |

出勤希望は緊急復旧用途としてSUPER_USERのみが実行でき、実行理由を必須とする。
