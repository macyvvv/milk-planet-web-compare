# 状態遷移

## 1. 店舗別ピリオド進行(period_store_settings)

`data_model.md` のとおり、単一の状態列ではなく `collection_status` / `scheduling_status` / `publication_status`
の3列で表現する(REQ-PERIOD-004)。ただし業務上は元指示書18.1の一本の流れとして理解できるよう、3列の
組み合わせを「進行フェーズ」として整理する。

### 進行フェーズと列の対応

| フェーズ | collection_status | scheduling_status | publication_status |
|---|---|---|---|
| PREPARING(準備中) | PREPARING | NOT_STARTED | UNPUBLISHED |
| OPEN(受付中) | OPEN | NOT_STARTED | UNPUBLISHED |
| CLOSED(受付終了) | CLOSED | NOT_STARTED または IN_PROGRESS | UNPUBLISHED |
| SCHEDULING(調整中) | CLOSED | IN_PROGRESS | UNPUBLISHED |
| CONFIRMED(確定済・未公開) | CLOSED | CONFIRMED | UNPUBLISHED |
| PUBLISHED(公開済) | CLOSED | CONFIRMED | PUBLISHED |

### 遷移表

| From | To | トリガー | 実行者 | ガード条件 | 副作用 |
|---|---|---|---|---|---|
| PREPARING | OPEN | 受付開始 | STORE_MANAGER以上 | 管理者が「イベント確認済み」操作を行っている(REQ-EVENT-003)。`submission_open_at`/`submission_deadline_at` が設定済み | `period_cast_targets` を未生成なら生成。監査ログ記録 |
| OPEN | CLOSED | 締切到達(自動)または管理者による早期締切 | システム or STORE_MANAGER以上 | `now() >= submission_deadline_at`、または管理者操作 | 締切後、未提出キャストの `availability_submissions.header_status` はそのまま(DRAFT/NOT_STARTEDのまま編集不可になる) |
| CLOSED | OPEN | 個別受付再開(店舗全体ではなく特定キャストの再開。REQ-AVAIL-010) | STORE_MANAGER以上 | 理由・期限入力必須 | 実際には店舗全体をOPENへ戻すのではなく、対象キャストの `availability_submissions` に「個別再開」情報を付与し当該キャストのみ編集可能にする(下記2章参照)。`period_store_settings.collection_status` 自体はCLOSEDのまま据え置く場合が多いが、店舗単位で一括再開する運用も許容し、その場合のみ本行のとおりCLOSEDに戻す |
| CLOSED | SCHEDULING(scheduling_status: NOT_STARTED→IN_PROGRESS) | 管理者が確定シフト編集画面を開いて最初の保存を行う | STORE_MANAGER以上 | collection_status=CLOSED | 監査ログ記録 |
| SCHEDULING | CONFIRMED(scheduling_status→CONFIRMED) | 管理者が「確定」操作 | STORE_MANAGER以上 | 全対象日の `confirmed_shifts.status` が DRAFT以上に設定されている必要はない(未配置日があってもよい)。トランザクション内で `confirmed_shifts.status` をCONFIRMEDへ | 監査ログ記録 |
| CONFIRMED | PUBLISHED(publication_status→PUBLISHED) | 管理者が「公開」操作 | STORE_MANAGER以上 | scheduling_status=CONFIRMED | `shift_publications`+`published_shift_entries` 生成(トランザクション)。`confirmed_shifts.status`をPUBLISHEDへ。監査ログ記録。REQ-PUB-001 |
| PUBLISHED | PUBLISHED(再公開) | 公開後変更を「再公開」として反映 | STORE_MANAGER以上 | 変更理由・連絡済み状態入力必須 | `shift_publications.publication_no` をインクリメントして新しい公開版を追加生成(既存publication_no版は不変のまま保持)。REQ-PUB-003 |

**禁止遷移**: PUBLISHED→CONFIRMED、CONFIRMED→SCHEDULINGのような「後戻り」は状態列としては用意しない。
公開後の修正は状態を戻さず「公開後変更」として `confirmed_shift_versions`(`is_post_publication_change=true`)
に記録し、必要なら再公開する(REQ-PUB-003, 004)。

---

## 2. キャスト提出(availability_submissions.header_status)

| From | To | トリガー | 実行者 | ガード条件 | 副作用 |
|---|---|---|---|---|---|
| NOT_STARTED | DRAFT | 出勤希望の下書き保存(1件でも入力) | CAST本人 | `period_store_settings.collection_status = OPEN`、締切前 | `availability_entries` upsert |
| DRAFT | DRAFT | 下書きの追加保存 | CAST本人 | 同上 | — |
| DRAFT | SUBMITTED | 正式提出(締切前) | CAST本人 | `now() < submission_deadline_at`。全日について入力があること(全日OFFも可。REQ-AVAIL-008) | `availability_submission_versions` 追加、`submitted_at`記録、監査ログ |
| DRAFT | LATE_SUBMITTED | 正式提出(締切後、個別再開状態でのみ許可) | CAST本人 | 個別再開中であること(下記) | 同上 |
| SUBMITTED / LATE_SUBMITTED | SUBMITTED / LATE_SUBMITTED | 締切前の再編集後、再提出 | CAST本人 | `now() < submission_deadline_at` かつ締切前は編集・再提出を許可 | 新しい `availability_submission_versions` を追加(バージョンを重ねる) |
| SUBMITTED / LATE_SUBMITTED | LOCKED | 締切到達、または管理者が個別再開を終了 | システム | `now() >= submission_deadline_at` かつ個別再開状態でない | 以後CAST本人からの編集不可 |
| LOCKED | LATE_SUBMITTED(個別再開中の再提出可能状態) | 管理者による個別受付再開 | STORE_MANAGER以上 | 理由・期限必須(REQ-AVAIL-010) | `availability_submissions.last_reopened_at/by/reason` を更新、監査ログ。期限到達で自動的にLOCKEDへ戻る |

**判定ルール**:
- 「未提出」= `header_status IN (NOT_STARTED, DRAFT)`(REQ-UNSUB-001)。
- 締切後に新規で `DRAFT→SUBMITTED` は不可(個別再開中のみ `LATE_SUBMITTED` へ遷移可)。
- 個別再開は店舗単位の `collection_status` を変えず、対象キャストの `availability_submissions` 単位で
  「編集許可ウィンドウ」を開く設計とする(店舗全体を再度OPENにすると他の未提出者にも影響するため)。

---

## 3. 確定シフト(confirmed_shifts.status)

| From | To | トリガー | 実行者 | ガード条件 | 副作用 |
|---|---|---|---|---|---|
| (新規) | DRAFT | 日付別/キャスト別ビューでの配置保存 | STORE_MANAGER以上 | `period_store_settings.collection_status = CLOSED` | DB制約(重複・同日複数店舗)を満たすこと。希望外配置/大幅変更時は`change_reason`必須 |
| DRAFT | DRAFT | 編集の繰り返し | STORE_MANAGER以上 | 同上 | `confirmed_shift_versions` 追加(楽観的ロック検証) |
| DRAFT | CONFIRMED | ピリオド全体の「確定」操作(2章参照) | STORE_MANAGER以上 | — | 一括更新、監査ログ |
| CONFIRMED | PUBLISHED | ピリオド全体の「公開」操作 | STORE_MANAGER以上 | — | `published_shift_entries` へコピー |
| DRAFT/CONFIRMED/PUBLISHED | CANCELLED | 配置取消 | STORE_MANAGER以上 | 公開済みの場合は変更理由必須、`confirmed_shift_versions`に`is_post_publication_change=true`で記録 | DB上の重複防止制約から除外される(`WHERE status<>'CANCELLED'`) |

---

## 4. イベント確認状態(event_acknowledgements.status)

| From | To | トリガー | 実行者 | ガード条件 |
|---|---|---|---|---|
| (新規, 提出時) | UP_TO_DATE | 出勤希望提出時点の `events.current_version_no` を `acknowledged_version_no` として記録 | システム | 対象イベントが存在するピリオド・店舗での提出時 |
| UP_TO_DATE | NEEDS_ACK | 対象イベントが `event_versions` で新版を持つ(`events.current_version_no` が進む) | システム(イベント変更時のバッチ) | 当該キャストが提出済み(SUBMITTED/LATE_SUBMITTED)であること |
| NEEDS_ACK | UP_TO_DATE | キャストが変更内容を画面で確認(既読操作)、または再提出 | CAST本人 | — |

---

## 5. 公開(shift_publications / 公開後変更)

- 公開は「新しい `shift_publications` 行(`publication_no` インクリメント)+その時点の `confirmed_shifts` の
  スナップショットを `published_shift_entries` へ追記」という単方向の操作。既存の公開版行は一切変更しない
  (REQ-PUB-002)。
- 公開後変更(`confirmed_shifts` を編集)は、`confirmed_shift_versions` に `is_post_publication_change=true` で
  記録されるのみで、対応する `published_shift_entries` は変更しない。管理者が改めて「再公開」操作を行った
  時のみ新しい `shift_publications` 版が追加される。つまり「公開後変更した」ことと「再公開した」ことは別操作
  であり、混同しない(元指示書には両者を必ずセットで行う指示はないため、変更のみ先行し、再公開は後でまとめて
  行う運用を許容する)。
