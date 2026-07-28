# データモデル

物理設計(実DDL)はPhase 1で確定するが、本書はレビュー対象となる論理設計であり、Prismaスキーマ作成時の正本とする。
時刻列は原則 `TIMESTAMPTZ`。日付のみの列は `DATE`。金額・給与関連は非対象(スコープ外)。

## 0. 命名・共通規約

- 主キーはすべて `UUID`(キャスト名等の業務上変更されうる値をPKにしない。REQ-AUTH-001)。
- `created_at` / `updated_at` は原則全テーブルに持つ(履歴専用テーブルは `created_at` のみで可)。
- 楽観的ロックが必要なテーブルは `version INT NOT NULL DEFAULT 1` を持つ(REQ-CONCURRENCY-001)。
- 追記専用テーブル(`audit_logs`, `*_versions`, `published_shift_entries`)はアプリケーションDBロールに
  UPDATE/DELETE権限を付与しない。

---

## 1. ユーザー・認証・権限

### users

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| login_name | TEXT | NOT NULL |
| display_name | TEXT | NOT NULL |
| display_name_kana | TEXT | NOT NULL(未提出者五十音順ソートに使用。REQ-UNSUB-002) |
| user_status | ENUM(PENDING_SETUP, ACTIVE, INACTIVE) | NOT NULL |
| resignation_scheduled_on | DATE | NULL可 |
| version | INT | NOT NULL DEFAULT 1 |
| created_at, updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**:
- 部分一意インデックス: `UNIQUE (login_name) WHERE user_status IN ('PENDING_SETUP','ACTIVE')`
  (D-004。同時点で有効なユーザー間のみログイン名一意。REQ-AUTH-003)
- ログイン試行超過による一時ロックは `users.user_status` ではなく `user_credentials.locked_until` のみで
  表現する(凍結軸と一時ロック軸を分けず、`user_status` は「事前登録中/有効/退店等で無効化」の3値に限定する)。

### user_credentials

| 列 | 型 | 制約 |
|---|---|---|
| user_id | UUID | PK, FK→users.id |
| password_hash | TEXT | NULL可(初期設定未完了時はNULL) |
| password_algo | TEXT | NOT NULL DEFAULT 'argon2id' |
| failed_login_attempts | INT | NOT NULL DEFAULT 0 |
| locked_until | TIMESTAMPTZ | NULL可(一時ロック) |
| password_updated_at | TIMESTAMPTZ | NULL可 |

### user_roles

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id |
| role | ENUM(CAST, STORE_MANAGER, STORE_DEPUTY_MANAGER, AREA_MANAGER, SUPER_USER) | NOT NULL |
| granted_by | UUID | FK→users.id |
| granted_at | TIMESTAMPTZ | NOT NULL |
| revoked_by | UUID | NULL可 |
| revoked_at | TIMESTAMPTZ | NULL可 |

**DB制約**: 部分一意 `UNIQUE (user_id, role) WHERE revoked_at IS NULL`(同じロールを重複付与しない)。

### stores

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| name | TEXT | NOT NULL |
| status | ENUM(ACTIVE, INACTIVE) | NOT NULL |
| created_at, updated_at | TIMESTAMPTZ | NOT NULL |

### manager_store_scopes

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id(role が STORE_MANAGER/STORE_DEPUTY_MANAGER であることをアプリ層で検証) |
| store_id | UUID | FK→stores.id |
| granted_by | UUID | FK→users.id |
| granted_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | NULL可 |

**DB制約**: 部分一意 `UNIQUE (user_id, store_id) WHERE revoked_at IS NULL`。1人の店長/副店長が複数店舗を
管理対象にできる(多対多)。REQ-ROLE-002。

### cast_store_memberships

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id |
| store_id | UUID | FK→stores.id |
| valid_from | DATE | NOT NULL |
| valid_to | DATE | NULL可(NULL=現在も有効) |
| membership_type | ENUM(PRIMARY, TEMPORARY) | NOT NULL |
| created_by | UUID | FK→users.id |
| created_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `membership_type = 'PRIMARY'` の行について、同一 `user_id` で `daterange(valid_from, valid_to, '[]')`
が重複しないよう `EXCLUDE USING gist (user_id WITH =, daterange(valid_from, COALESCE(valid_to, 'infinity'::date), '[]') WITH &&) WHERE (membership_type = 'PRIMARY')`
(btree_gist拡張要。REQ-MEMBER-001)。`TEMPORARY` は臨時勤務のメモ的性格であり重複を許容する。

---

## 2. ピリオド・イベント

### periods

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (start_date, end_date)`。`CHECK (end_date > start_date)`。生成ロジックは常に
月前半(1〜15日)・月後半(16日〜月末)のいずれかのみを作るため、アプリ層はこの2パターン以外を生成しない
(REQ-PERIOD-001, 003)。

### period_store_settings

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| period_id | UUID | FK→periods.id |
| store_id | UUID | FK→stores.id |
| submission_open_at | TIMESTAMPTZ | NULL可(未設定=受付未開始) |
| submission_deadline_at | TIMESTAMPTZ | NULL可 |
| collection_status | ENUM(PREPARING, OPEN, CLOSED) | NOT NULL DEFAULT 'PREPARING' |
| scheduling_status | ENUM(NOT_STARTED, IN_PROGRESS, CONFIRMED) | NOT NULL DEFAULT 'NOT_STARTED' |
| publication_status | ENUM(UNPUBLISHED, PUBLISHED) | NOT NULL DEFAULT 'UNPUBLISHED' |
| published_at | TIMESTAMPTZ | NULL可 |
| events_confirmed_at | TIMESTAMPTZ | NULL可(REQ-EVENT-003: 受付開始の前提となる「イベント確認済み」操作の記録) |
| events_confirmed_by | UUID | NULL可、FK→users.id |
| version | INT | NOT NULL DEFAULT 1 |

**DB制約**: `UNIQUE (period_id, store_id)`。3つの状態列の組み合わせルールは `state_transitions.md` の
「店舗別ピリオド進行」を参照(全店舗を1列で管理しない。REQ-PERIOD-004)。

### period_cast_targets

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| period_id | UUID | FK→periods.id |
| store_id | UUID | FK→stores.id |
| user_id | UUID | FK→users.id |
| target_status | ENUM(ACTIVE, EXCLUDED_RESIGNED, EXCLUDED_LONG_ABSENCE, EXCLUDED_OTHER) | NOT NULL DEFAULT 'ACTIVE' |
| exclusion_reason | TEXT | `target_status <> 'ACTIVE'` の場合NOT NULL(CHECK制約) |
| generated_at | TIMESTAMPTZ | NOT NULL |
| updated_by | UUID | NULL可 |
| updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (period_id, store_id, user_id)`。REQ-TARGET-001〜003。

### events

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| name | TEXT | NOT NULL |
| event_date | DATE | NOT NULL |
| is_all_stores | BOOLEAN | NOT NULL DEFAULT false |
| cast_note | TEXT | NULL可 |
| admin_note | TEXT | NULL可 |
| status | ENUM(ACTIVE, DISABLED) | NOT NULL DEFAULT 'ACTIVE' |
| current_version_no | INT | NOT NULL DEFAULT 1 |
| created_by | UUID | FK→users.id |
| created_at, updated_at | TIMESTAMPTZ | NOT NULL |

必要人数・役割・手当・衣装・売上目標等のフィールドは持たない(REQ-EVENT-002)。

### event_stores

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| event_id | UUID | FK→events.id |
| store_id | UUID | FK→stores.id |

**DB制約**: `UNIQUE (event_id, store_id)`。`is_all_stores=true` の場合このテーブルには行を持たず、
「全店舗」は都度 `stores` を結合して解決する(将来の店舗追加にも自動追随)。

### event_versions

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| event_id | UUID | FK→events.id |
| version_no | INT | NOT NULL |
| name, event_date, is_all_stores, cast_note, admin_note, status | (スナップショット) | |
| store_ids_snapshot | JSONB | NOT NULL |
| change_reason | TEXT | NULL可 |
| changed_by | UUID | FK→users.id |
| changed_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (event_id, version_no)`。追記専用。REQ-EVENT-004。

### event_acknowledgements

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| event_id | UUID | FK→events.id |
| user_id | UUID | FK→users.id |
| period_id | UUID | FK→periods.id |
| store_id | UUID | FK→stores.id |
| acknowledged_version_no | INT | NULL可 |
| status | ENUM(UP_TO_DATE, NEEDS_ACK) | NOT NULL(計算値をアプリ層で都度更新、またはビューで算出) |
| created_at, updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (event_id, user_id, period_id)`。イベント変更時に対象キャストへ `NEEDS_ACK` を一括付与する
バッチ処理はサービス層で行う。REQ-EVENT-005。

---

## 3. 標準シフト・出勤希望

### standard_shift_patterns

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id |
| day_of_week | SMALLINT(0=日〜6=土) | NOT NULL |
| is_working | BOOLEAN | NOT NULL |
| start_minutes | SMALLINT | `is_working=true` ならNOT NULL、0〜1799(30:00まで) |
| end_minutes | SMALLINT | `is_working=true` ならNOT NULL、start_minutes超 |
| note | TEXT | NULL可 |
| updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (user_id, day_of_week)`。REQ-STDSHIFT-001。

### availability_submissions(提出ヘッダー)

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| period_id | UUID | FK→periods.id |
| store_id | UUID | FK→stores.id(対象者生成時点の店舗) |
| user_id | UUID | FK→users.id |
| header_status | ENUM(NOT_STARTED, DRAFT, SUBMITTED, LATE_SUBMITTED, LOCKED) | NOT NULL DEFAULT 'NOT_STARTED' |
| submitted_at | TIMESTAMPTZ | NULL可 |
| current_version_no | INT | NOT NULL DEFAULT 0 |
| last_reopened_at | TIMESTAMPTZ | NULL可 |
| last_reopened_by | UUID | NULL可 |
| last_reopen_reason | TEXT | NULL可 |
| last_reopen_deadline_at | TIMESTAMPTZ | NULL可(D-009: 個別再開時の再提出期限。REQ-AVAIL-010) |
| version | INT | NOT NULL DEFAULT 1(楽観的ロック) |
| created_at, updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (period_id, store_id, user_id)`。REQ-AVAIL-007, 010。

### availability_entries(下書き/提出中の現在値。1キャスト×1日=1行)

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| submission_id | UUID | FK→availability_submissions.id |
| target_date | DATE | NOT NULL(ピリオド範囲内であることをCHECKまたはアプリ層検証) |
| availability_status | ENUM(OFF, AVAILABLE, PREFERRED, TIME_NEGOTIABLE) | NOT NULL |
| start_at | TIMESTAMPTZ | `availability_status <> 'OFF'` ならNOT NULL |
| end_at | TIMESTAMPTZ | 同上、かつ `end_at > start_at`(CHECK) |
| note | TEXT | NULL可 |
| updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (submission_id, target_date)`(1日1件。REQ-AVAIL-001)。`CHECK` で OFFと時刻矛盾を防止
(REQ-AVAIL-003, REQ-VALID-001)。

### availability_submission_versions(提出/再提出時点の不変スナップショット)

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| submission_id | UUID | FK→availability_submissions.id |
| version_no | INT | NOT NULL |
| header_status_at_save | ENUM | NOT NULL(SUBMITTED または LATE_SUBMITTED) |
| entries_snapshot | JSONB | NOT NULL(提出時点の全日エントリのコピー) |
| created_by | UUID | FK→users.id |
| created_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (submission_id, version_no)`。追記専用。「提出」または「再提出(個別再開後)」の都度、1件
追加する(下書き保存では追加しない)。REQ-AUDIT-004(出勤希望提出版)。

---

## 4. 確定シフト・公開

### confirmed_shifts

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| period_id | UUID | FK→periods.id |
| store_id | UUID | FK→stores.id(確定店舗) |
| user_id | UUID | FK→users.id |
| work_date | DATE | NOT NULL |
| start_at | TIMESTAMPTZ | NOT NULL |
| end_at | TIMESTAMPTZ | NOT NULL, `CHECK (end_at > start_at)` |
| status | ENUM(DRAFT, CONFIRMED, PUBLISHED, CANCELLED) | NOT NULL DEFAULT 'DRAFT' |
| admin_note | TEXT | NULL可 |
| cast_note | TEXT | NULL可 |
| change_reason | TEXT | 希望外配置/大幅変更時NOT NULL(アプリ層検証。REQ-SCHED-006) |
| current_version_no | INT | NOT NULL DEFAULT 1 |
| version | INT | NOT NULL DEFAULT 1(楽観的ロック) |
| created_by, updated_by | UUID | FK→users.id |
| created_at, updated_at | TIMESTAMPTZ | NOT NULL |

**DB制約**(REQ-SCHED-003, 元指示書17章):
- `UNIQUE (user_id, work_date) WHERE status <> 'CANCELLED'`(同日複数店舗配置防止。1キャスト1日1店舗)。
- `EXCLUDE USING gist (user_id WITH =, tstzrange(start_at, end_at, '[)') WITH &&) WHERE (status <> 'CANCELLED')`
  (btree_gist拡張要。日跨ぎシフトが隣接日のシフトと実時刻で重複するケースを含め、確定勤務時間の重複を防止。D-002)。

### confirmed_shift_versions

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| confirmed_shift_id | UUID | FK→confirmed_shifts.id |
| version_no | INT | NOT NULL |
| store_id, work_date, start_at, end_at, status, admin_note, cast_note, change_reason | (スナップショット) | |
| is_post_publication_change | BOOLEAN | NOT NULL DEFAULT false |
| cast_notified_status | ENUM(NOT_NOTIFIED, NOTIFIED) | `is_post_publication_change=true` の場合NOT NULL |
| notified_at, notified_by | | NULL可 |
| changed_by | UUID | FK→users.id |
| changed_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (confirmed_shift_id, version_no)`。追記専用。公開前の通常編集・公開後変更の両方をこの
テーブルに記録するが、`is_post_publication_change` で区別し、公開後変更のみ連絡済み状態を必須とする
(REQ-PUB-003)。

### shift_publications(公開版ヘッダー、店舗×ピリオド×公開回)

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| period_id | UUID | FK→periods.id |
| store_id | UUID | FK→stores.id |
| publication_no | INT | NOT NULL(1から増分) |
| published_by | UUID | FK→users.id |
| published_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (period_id, store_id, publication_no)`。REQ-PUB-001。

### published_shift_entries(公開時点の不変スナップショット)

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| publication_id | UUID | FK→shift_publications.id |
| user_id | UUID | FK→users.id |
| store_id | UUID | FK→stores.id |
| work_date | DATE | NOT NULL |
| start_at, end_at | TIMESTAMPTZ | NOT NULL |
| admin_note_snapshot, cast_note_snapshot | TEXT | NULL可 |
| created_at | TIMESTAMPTZ | NOT NULL |

**DB制約**: `UNIQUE (publication_id, user_id, work_date)`。UPDATE/DELETE不可(公開版の不変性。REQ-PUB-002)。
公開操作は「その時点の `confirmed_shifts`(status IN CONFIRMED/PUBLISHED)をこのテーブルへ丸ごとコピーする」
処理としてトランザクション内で実行する。

---

## 5. 通知・CSV・認証補助

### notification_templates

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| template_type | ENUM(STORE_UNSUBMITTED, ALL_STORES_UNSUBMITTED, EVENT_CHANGE_RENOTIFY) | NOT NULL |
| store_id | UUID | NULL可(店舗別上書きがある場合のみ) |
| body | TEXT | NOT NULL(プレースホルダ構文を含む) |
| updated_by, updated_at | | |

### generated_notifications

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| template_type | ENUM | NOT NULL |
| store_id | UUID | NULL可(全店一斉版はNULL) |
| period_id | UUID | FK→periods.id |
| content_snapshot | TEXT | NOT NULL(生成結果本文) |
| generated_by, generated_at | | |

### password_setup_tokens

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id |
| purpose | ENUM(INITIAL_SETUP, PASSWORD_RESET) | NOT NULL |
| token_hash | TEXT | NOT NULL(平文非保存。REQ-AUTH-006) |
| expires_at | TIMESTAMPTZ | NOT NULL |
| used_at | TIMESTAMPTZ | NULL可 |
| issued_by, issued_at | | NOT NULL |

**DB制約**: 部分一意 `UNIQUE (user_id, purpose) WHERE used_at IS NULL AND expires_at > now()`は式インデックス
では表現できないため、アプリ層で「発行時に既存未使用トークンを失効させる」運用とする(旧トークンの
`expires_at` を即時過去化)。

### password_reset_requests

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id |
| requested_note | TEXT | NULL可(本人からの連絡内容メモ) |
| approved_by | UUID | FK→users.id |
| approved_at | TIMESTAMPTZ | NOT NULL |
| issued_token_id | UUID | FK→password_setup_tokens.id |

REQ-AUTH-007。承認の都度1行追加(追記専用)。

### sessions

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK→users.id |
| token_hash | TEXT | NOT NULL(Cookie値はランダムトークン、DBにはハッシュのみ保存) |
| created_at, last_seen_at, expires_at | TIMESTAMPTZ | NOT NULL |
| revoked_at | TIMESTAMPTZ | NULL可 |
| ip_address, user_agent | TEXT | 作成時点を記録 |

### csv_import_jobs

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| job_type | ENUM(CASTS, MEMBERSHIPS, AVAILABILITY, EVENTS, CONFIRMED_SHIFTS) | NOT NULL |
| store_id, period_id | UUID | NULL可(対象範囲) |
| status | ENUM(UPLOADED, VALIDATING, PREVIEW_READY, VALIDATION_FAILED, CONFIRMED, APPLIED, FAILED, CANCELLED) | NOT NULL |
| reason | TEXT | `job_type=AVAILABILITY` の場合NOT NULL(REQ-CSV-004) |
| uploaded_by, uploaded_at | | NOT NULL |
| applied_by, applied_at | | NULL可 |
| error_summary | TEXT | NULL可 |

### csv_import_rows

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| job_id | UUID | FK→csv_import_jobs.id |
| row_no | INT | NOT NULL |
| raw_data | JSONB | NOT NULL |
| validation_errors | JSONB | NULL可 |
| status | ENUM(VALID, INVALID) | NOT NULL |

**DB制約**: `UNIQUE (job_id, row_no)`。

### csv_export_jobs

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| export_type | ENUM(CASTS, AVAILABILITY, SUBMISSIONS, CONFIRMED_SHIFTS, DIFFERENCES, EVENTS, MEMBERSHIPS) | NOT NULL |
| store_id, period_id | UUID | NULL可 |
| row_count | INT | NOT NULL |
| requested_by, requested_at | | NOT NULL |

出力ファイル自体は永続化せず、ダウンロード要求ごとに都度生成しストリーミング返却する(監査目的のメタデータ
のみ本テーブルに保存)。

---

## 6. 監査

### audit_logs

| 列 | 型 | 制約 |
|---|---|---|
| id | UUID | PK |
| actor_user_id | UUID | FK→users.id、NULL可(システム自動処理: ピリオド自動生成等) |
| action | TEXT | NOT NULL(コード表は実装時に固定。例: `LOGIN_SUCCESS`, `AVAILABILITY_SUBMITTED`, `SHIFT_PUBLISHED` 等) |
| entity_type | TEXT | NOT NULL |
| entity_id | UUID | NULL可 |
| store_id | UUID | NULL可、FK→stores.id |
| period_id | UUID | NULL可、FK→periods.id |
| before_data | JSONB | NULL可 |
| after_data | JSONB | NULL可 |
| reason | TEXT | NULL可 |
| request_id | TEXT | NULL可 |
| ip_address | TEXT | NULL可 |
| user_agent | TEXT | NULL可 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**DB制約・運用**: UPDATE/DELETEを許可しない(アプリケーションDBロールの権限をINSERT/SELECTのみに制限。
SUPER_USERであってもアプリ経由でUPDATE/DELETEの導線を作らない。REQ-AUDIT-001)。`entity_id` `store_id` `period_id`
は対象が削除されてもログを残せるよう `ON DELETE SET NULL` は使わず外部キー自体を張らない、または
`ON DELETE NO ACTION` とし物理削除自体を禁止する運用と整合させる(REQ-AUDIT外部キー整合)。

---

## 7. 履歴方式まとめ

| データ | 可変な「現在値」 | 不変な「版」 | 再現できること |
|---|---|---|---|
| 出勤希望 | `availability_entries`(下書き中は自由に上書き) | `availability_submission_versions` | 提出/再提出した時点の内容 |
| イベント | `events` / `event_stores` | `event_versions` | 変更前後の内容、影響範囲 |
| 確定シフト | `confirmed_shifts` | `confirmed_shift_versions` | 公開前後問わず全ての変更履歴 |
| 公開シフト | (公開版は現在値を持たない) | `shift_publications` + `published_shift_entries` | 過去に公開した内容そのもの(不変) |
| その他重要操作全般 | — | `audit_logs` | 誰が・いつ・何を・なぜ変更したか |

## 8. 主要DB制約まとめ(元指示書17章 対応表)

| 元指示書の要求 | 実装手段 |
|---|---|
| ピリオド期間の重複防止 | `periods` の `UNIQUE(start_date, end_date)` + 生成ロジックの固定分割 |
| 同時点の有効ログイン名重複防止 | `users` 部分一意インデックス(D-004) |
| 同時点の通常所属重複防止 | `cast_store_memberships` の `EXCLUDE USING gist`(PRIMARYのみ) |
| 1キャスト・1日・1希望エントリ | `availability_entries` の `UNIQUE(submission_id, target_date)` |
| 1キャストの確定勤務時間重複防止 | `confirmed_shifts` の `EXCLUDE USING gist`(D-002) |
| 同日複数店舗勤務防止 | `confirmed_shifts` の `UNIQUE(user_id, work_date) WHERE status<>'CANCELLED'` |
| 終了日時が開始日時より後 | 各テーブルの `CHECK (end_at > start_at)` |
| 監査ログの外部キー整合 | `audit_logs` は対象削除に追随して消えない設計(物理削除自体を行わない運用) |
| 公開版の不変性 | `published_shift_entries` へUPDATE/DELETE権限を付与しない |
