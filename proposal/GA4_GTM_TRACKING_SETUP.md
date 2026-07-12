# GA4 / GTM 計測設定手順

## 対象範囲
このリポジトリでは、共通フロントエンドコードから以下のイベントを送信します。

- `ui_click`
- `outbound_click`
- `form_submit`
- `menu_toggle`

実装ファイル:

- `proposal/branch1/proposal.js`
- `proposal/branch2/proposal.js`
- `proposal/branch3/proposal.js`
- `proposal/branch4/proposal.js`

## 送信されるイベントパラメータ

### ui_click
- `event_name`
- `page_path`
- `page_title`
- `click_text`
- `click_type`（`link` / `button` / `input` など）
- `click_id`
- `click_classes`
- `click_url`
- `click_domain`
- `click_area`
- `outbound`（`1` または `0`）

### outbound_click
- `event_name`
- `page_path`
- `page_title`
- `click_text`
- `click_url`
- `click_domain`
- `click_area`

### form_submit
- `event_name`
- `page_path`
- `page_title`
- `form_id`
- `form_name`
- `form_action`
- `form_area`

### menu_toggle
- `event_name`
- `page_path`
- `page_title`
- `menu_state`（`open` / `close`）
- `menu_id`

## GA4 管理画面設定（カスタム定義）
GA4 側でカスタムディメンションを作成してください。

1. GA4 管理画面を開く
2. `カスタム定義` へ移動
3. `カスタムディメンションを作成` をクリック
4. 以下の値を入力して保存

### カスタムディメンション作成時の入力ルール（毎回共通）

- ディメンションのスコープ: `イベント`
- イベントパラメータ: 下表の「イベントパラメータ」をそのまま入力
- ディメンション名: 下表の「推奨ディメンション名」を入力（任意で変更可）
- 説明: 任意（未入力でも可）

### 作成するカスタムディメンション一覧（そのまま入力用）

| 推奨ディメンション名 | イベントパラメータ | 用途 |
| --- | --- | --- |
| click_text | click_text | クリックされた要素の表示テキスト |
| click_type | click_type | クリック要素種別（link/button/input など） |
| click_id | click_id | クリック要素の id |
| click_classes | click_classes | クリック要素の class |
| click_url | click_url | クリック先 URL（href） |
| click_domain | click_domain | クリック先ドメイン |
| click_area | click_area | クリックされた領域（セクション） |
| outbound | outbound | 外部リンク判定（1/0） |
| form_id | form_id | 送信フォーム id |
| form_name | form_name | 送信フォーム name |
| form_action | form_action | フォーム送信先 action |
| form_area | form_area | フォーム配置領域 |
| menu_state | menu_state | メニュー状態（open/close） |
| menu_id | menu_id | メニュー要素 id |

### 入力例（質問のあった click_text の場合）

- ディメンション名: `click_text`
- ディメンションのスコープ: `イベント`
- イベントパラメータ: `click_text`
- 説明: `クリック要素の表示テキスト`

### よくある詰まりポイント

- `event_name` / `page_path` / `page_title` は、この手順ではカスタムディメンション作成不要
- `イベントパラメータ` は大文字小文字を区別（例: `click_text` と `clickText` は別）
- 作成後、レポート反映まで時間がかかる場合あり（通常は DebugView で先に確認）

### ここで止まる場合（今回の画面の状態）

GA4 の「イベントパラメータ」候補に出るのは、原則として「そのプロパティで受信済み」のパラメータです。
そのため、`click_text` が候補に出ない場合は、まだ GA4 側で `click_text` を受信できていません。

以下の順で進めると解消しやすいです。

1. 計測対象サイトを `https://` の公開URLで開く（`file://` は検証対象にしない）
2. クリック操作を実施してイベントを発火させる
3. GA4 の DebugView で `ui_click` と `click_text` 受信を確認する
4. 5-15分待ってからカスタムディメンション作成画面を開き直す
5. 候補に `click_text` が出たら選択して保存

それでも出ない場合の確認ポイント:

- 計測ID（G-XXXX）が送信先 GA4 プロパティと一致しているか
- ブラウザ拡張（広告ブロッカー等）で計測が抑止されていないか
- 同意モードで `analytics_storage=denied` になっていないか

### GUIのみで進める場合の現実的な進め方

JSを追加しない運用では、まず候補に出ている既存パラメータで作成を進めてください。
今回の画面の例では `link_classes` などは作成可能です。

GUIのみで先に作成してよい候補例:

- `link_url`
- `link_text`
- `link_classes`
- `outbound`

補足:

- `click_text` は本ドキュメントの実装コードまたはGTMタグで送信して初めて候補化されます。
- 「GUIのみ」で `click_text` まで取りたい場合は、GTMで `ui_click` を作って `click_text` をパラメータ送信してください。

任意のカスタム指標:

- `click_count`（将来的に数値メトリクスを明示送信する場合）

## GTM 設定（推奨）
GA4 の前段に GTM を使う場合は、以下の設定にしてください。

### 画面レイアウトが違う場合（重要）

GTM はアカウントや新UIで画面構成が異なります。
この手順の `左メニュー` は、あなたの画面では以下のいずれかに置き換えてください。

- 上部ナビゲーションの `タグ` / `トリガー` / `変数`
- 画面右上付近の `検索`（虫眼鏡）で `変数` や `トリガー` を検索
- `管理` または `ワークスペース` から `変数` / `タグ` / `トリガー` 一覧へ移動

要点: どのUIでも「タグ」「トリガー」「変数」の3画面に入れれば同じ設定が可能です。

### Google タグ「GTM-NZ394556」が見つかりません と表示される場合

このエラーは、次のどちらかで発生します。

- 対象ページに GTM コンテナ（GTM-NZ394556）が未設置
- GTMプレビューの接続先URLが誤り（file:// や別ドメイン）

まず確認すること:

1. GTM プレビューで接続したURLが https の本番/検証URLか
2. 対象ページのソースに GTM-NZ394556 が含まれているか
3. ブラウザ拡張でタグがブロックされていないか

このリポジトリの現状:

- branch4 のHTMLは GA4 gtag（G-YW42LKCZ6W）はあります
- GTM-NZ394556 の設置コードは見つかっていません

そのため、GTMプレビューで GTM-NZ394556 を探すと「見つかりません」になります。

対処:

1. GTM-NZ394556 のコンテナコードを対象ページへ設置
2. 公開URL（https）で再度プレビュー接続
3. 接続後にイベント確認（ui_click など）

### 0) 先に理解しておくポイント

- 「DataLayer の設定画面」という独立メニューはありません。
- `Data Layer 変数` は GTM 左メニューの `変数` から作成します。
- 画面パスは `変数` -> `新規` -> `変数の設定` -> `データレイヤーの変数` です。
- 左メニューがないUIでも、`変数` 画面の中で `新規` -> `変数の設定` -> `データレイヤーの変数` は同じです。

### 0.5) （未設定なら）GA4 設定タグを先に作成

1. GTM 左メニュー `タグ` -> `新規`
2. タグタイプ: `Google アナリティクス: GA4 設定`
3. `測定 ID` に `G-YW42LKCZ6W` を入力
4. トリガー: `All Pages`
5. 保存（例: `GA4 - Config`）

このリポジトリで現在使っている GA4 の計測ID:

- `G-YW42LKCZ6W`

別の GA4 プロパティへ送る場合は、この値をそのプロパティの計測IDに置き換えてください。

左メニューがない場合の導線例:

1. `タグ` 画面を開く（上部ナビまたは検索）
2. `新規` を押す
3. 以降は同じ

### 1) Data Layer 変数
レポートで使用する各パラメータに対して Data Layer 変数を作成:

作成手順（1つずつ同じ操作）:

1. GTM の `変数` 画面を開く
2. `ユーザー定義変数` の `新規`
3. `変数の設定` をクリック
4. 変数タイプ `データレイヤーの変数` を選択
5. 以下の項目を入力
6. 右上 `保存`

入力項目（毎回共通）:

- 変数タイプ: `データレイヤーの変数`
- データレイヤー変数名: 下表の右列（例: `click_text`）
- データレイヤーのバージョン: `バージョン 2`
- デフォルト値: 空欄（未設定でOK）
- 変数名: 下表の左列（例: `dlv_click_text`）

具体例（`click_text` を作る場合）:

1. 変数名: `dlv_click_text`
2. 変数タイプ: `データレイヤーの変数`
3. データレイヤー変数名: `click_text`
4. データレイヤーのバージョン: `バージョン 2`
5. 保存

左メニューがない場合の導線例:

1. `変数` 画面を開く（上部ナビまたは検索で「変数」）
2. `ユーザー定義変数` の `新規`
3. 以降は同じ

作成する変数一覧:

| GTM変数名 | データレイヤー変数名 |
| --- | --- |
| `dlv_click_text` | `click_text` |
| `dlv_click_type` | `click_type` |
| `dlv_click_id` | `click_id` |
| `dlv_click_classes` | `click_classes` |
| `dlv_click_url` | `click_url` |
| `dlv_click_domain` | `click_domain` |
| `dlv_click_area` | `click_area` |
| `dlv_outbound` | `outbound` |
| `dlv_form_id` | `form_id` |
| `dlv_form_name` | `form_name` |
| `dlv_form_action` | `form_action` |
| `dlv_form_area` | `form_area` |
| `dlv_menu_state` | `menu_state` |
| `dlv_menu_id` | `menu_id` |

プレビューでの確認方法（作成後に必ず実施）:

1. GTM 右上 `プレビュー`
2. 対象ページを開いてクリック操作を実行
3. プレビュー左側のイベント一覧で `ui_click` などを選択
4. `Variables` タブで `dlv_click_text` などに値が入っているか確認

値が空の場合の確認:

- 対象イベントが発火しているか（`ui_click` / `form_submit` など）
- データレイヤー変数名のスペルが一致しているか（例: `click_text`）
- 大文字小文字が一致しているか（`clickText` は別名扱い）

### 2) カスタムイベントトリガー
以下のカスタムイベントトリガーを作成:

- イベント名 `ui_click` に対して `CE - ui_click`
- イベント名 `outbound_click` に対して `CE - outbound_click`
- イベント名 `form_submit` に対して `CE - form_submit`
- イベント名 `menu_toggle` に対して `CE - menu_toggle`

作成手順（1つずつ同じ操作）:

1. GTM の `トリガー` 画面を開く
2. `新規` をクリック
3. トリガー名を入力（例: `CE - ui_click`）
4. `トリガーの設定` をクリック
5. トリガータイプ `カスタムイベント` を選択
6. `イベント名` に対象イベント名を入力（例: `ui_click`）
7. このトリガーの発生場所: `すべてのカスタムイベント`
8. 保存

入力項目（毎回共通）:

- トリガータイプ: `カスタムイベント`
- イベント名: 下表のイベント名をそのまま入力（大文字小文字一致）
- このトリガーの発生場所: `すべてのカスタムイベント`
- 条件（Some Custom Events）は通常不要

左メニューがない場合の導線例:

1. `トリガー` 画面を開く（上部ナビまたは検索）
2. `新規`
3. 以降は同じ

作成するトリガー一覧:

| トリガー名 | イベント名 | 用途 |
| --- | --- | --- |
| `CE - ui_click` | `ui_click` | リンク/ボタンなどの操作計測 |
| `CE - outbound_click` | `outbound_click` | 外部リンククリック計測 |
| `CE - form_submit` | `form_submit` | フォーム送信計測 |
| `CE - menu_toggle` | `menu_toggle` | メニュー開閉計測 |

設定確認（作成後に必ず実施）:

1. GTM 右上 `プレビュー`
2. 対象ページへ接続
3. サイト上でクリックやフォーム送信を実行
4. Tag Assistant 左のイベント一覧に `ui_click` / `outbound_click` / `form_submit` / `menu_toggle` が出るか確認
5. 各イベントを選択し `Tags Fired` に対応する GA4 タグが表示されるか確認

発火しない場合の確認:

- `イベント名` のスペルミス（例: `ui-click` は別イベント扱い）
- トリガーが `すべてのカスタムイベント` ではなく条件付きになっている
- プレビュー接続先が `file://` になっている（`https://` で確認）
- デバッグ対象ページが古いキャッシュのまま（ハードリロード後に再確認）

### 3) GA4 イベントタグ
イベントごとに GA4 イベントタグを作成:

重要:

- GA4 イベントタグ自体には通常 `測定 ID` を直接入力しません
- 代わりに `設定タグ` として `GA4 - Config` を選びます
- その `GA4 - Config` の中に `測定 ID`（この案件では `G-YW42LKCZ6W`）が入っている必要があります
- つまり、イベントタグが送信先を認識するのは `GA4 - Config` 経由です

共通の作成手順:

1. GTM の `タグ` 画面を開く
2. `新規` をクリック
3. タグ名を入力（例: `GA4 - ui_click`）
4. `タグの設定` -> `Google アナリティクス: GA4 イベント`
5. `設定タグ` に `GA4 - Config`（または既存GA4設定タグ）を選択
6. `イベント名` を入力（例: `ui_click`）
7. `イベント パラメータ` を追加（キー/値）
8. `トリガー` に対応する `CE - ...` を設定
9. 保存

入力項目（毎回共通）:

- タグタイプ: `Google アナリティクス: GA4 イベント`
- 設定タグ: `GA4 - Config`
- `GA4 - Config` 内の測定 ID: `G-YW42LKCZ6W`
- イベント名: 対象イベント名をそのまま入力（大文字小文字一致）
- イベント パラメータ: 下表のキーと `{{dlv_*}}` 変数を設定
- トリガー: 対応する `CE - ...`

先に確認すべきこと:

1. `GA4 - Config` タグが存在する
2. そのタグの `測定 ID` が `G-YW42LKCZ6W` になっている
3. `GA4 - Config` が `All Pages` で発火する

もし `GA4 - Config` が無い場合:

- 先に `### 0.5) （未設定なら）GA4 設定タグを先に作成` の手順で作成してください
- その後にこの `### 3) GA4 イベントタグ` を設定してください

左メニューがない場合の導線例:

1. `タグ` 画面を開く（上部ナビまたは検索）
2. `新規`
3. 以降は同じ

タグ作成一覧:

| タグ名 | イベント名 | トリガー |
| --- | --- | --- |
| `GA4 - ui_click` | `ui_click` | `CE - ui_click` |
| `GA4 - outbound_click` | `outbound_click` | `CE - outbound_click` |
| `GA4 - form_submit` | `form_submit` | `CE - form_submit` |
| `GA4 - menu_toggle` | `menu_toggle` | `CE - menu_toggle` |

`GA4 - ui_click` のイベントパラメータ（完全版）:

- `click_text` = `{{dlv_click_text}}`
- `click_type` = `{{dlv_click_type}}`
- `click_id` = `{{dlv_click_id}}`
- `click_classes` = `{{dlv_click_classes}}`
- `click_url` = `{{dlv_click_url}}`
- `click_domain` = `{{dlv_click_domain}}`
- `click_area` = `{{dlv_click_area}}`
- `outbound` = `{{dlv_outbound}}`

`GA4 - outbound_click` のイベントパラメータ:

- `click_text` = `{{dlv_click_text}}`
- `click_url` = `{{dlv_click_url}}`
- `click_domain` = `{{dlv_click_domain}}`
- `click_area` = `{{dlv_click_area}}`

`GA4 - form_submit` のイベントパラメータ:

- `form_id` = `{{dlv_form_id}}`
- `form_name` = `{{dlv_form_name}}`
- `form_action` = `{{dlv_form_action}}`
- `form_area` = `{{dlv_form_area}}`

`GA4 - menu_toggle` のイベントパラメータ:

- `menu_state` = `{{dlv_menu_state}}`
- `menu_id` = `{{dlv_menu_id}}`

各タグは対応するカスタムイベントトリガーに紐付けてください。

設定確認（タグ作成後に必ず実施）:

1. GTM `プレビュー` で対象URLに接続
2. サイト操作後、Tag Assistant のイベント一覧で `ui_click` 等を選択
3. `Tags Fired` に対応する `GA4 - ...` タグが出るか確認
4. `Variables` タブで `{{dlv_*}}` 値が埋まっているか確認

発火しない場合の確認:

- タグのトリガーが誤っている（例: `CE - ui_click` ではなく別トリガー）
- イベント名が不一致（例: `outbound-click` など）
- `GA4 - Config` が存在しない、または測定IDが `G-YW42LKCZ6W` ではない
- タグが `一時停止` になっている
- プレビュー接続先が `file://` になっている（`https://` で確認）

### 4) プレビューと公開

1. 右上 `プレビュー` をクリック
2. 対象URL（必ず `https://`）を入力して接続
3. サイト上でクリック/フォーム送信を実行
4. Tag Assistant で `ui_click` / `outbound_click` / `form_submit` / `menu_toggle` のイベントを確認
5. 各イベントの `Tags Fired` で GA4 タグ発火を確認
6. 問題なければ GTM 右上 `公開`
7. `バージョン名` と `説明` を入力して公開（後で追跡しやすくするため）

公開後の即時確認:

1. 公開ページを再読み込み（ハードリロード）
2. GA4 DebugView でイベント受信を確認
3. 反映待ちで見えない場合は 5-15 分程度待って再確認

## QA チェックリスト

1. GTM プレビューモードでサイトを開く
2. リンクやボタン（メニュー、CTA、外部リンク）を複数クリックする
3. `dataLayer` に `ui_click` / `outbound_click` / `menu_toggle` が入ることを確認
4. フォーム送信操作で `form_submit` が入ることを確認
5. GA4 DebugView でイベント名とパラメータを確認
6. 検証後に GTM コンテナを公開

QA 追加チェック（推奨）:

1. `ui_click` の `click_text` / `click_url` / `click_area` が空でないこと
2. 外部リンクのみ `outbound=1` になること
3. `outbound_click` で `click_domain` が期待どおり入ること
4. `menu_toggle` で `menu_state` が `open` / `close` 両方取れること
5. 同一操作で二重発火していないこと（同イベントが連続2件出ないこと）

## 補足

- `proposal.js` は `gtag('event', ...)` と `dataLayer.push(...)` の両方を実行します。
- 将来 GTM を導入した場合でも、`dataLayer.push` はそのまま利用できます。
- 計測対象から除外したい要素には `data-ga-ignore` 属性を付与してください。
