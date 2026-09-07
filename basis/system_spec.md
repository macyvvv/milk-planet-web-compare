# System Spec

## 対象
- 公式サイト本体
- 店舗一覧
- 個別店舗詳細
- キャスト一覧
- システム&メニュー
- イベント
- 採用

## 主要ユーザー
- 初見来訪者
- 近隣店舗を探す利用者
- キャスト情報を見たい利用者
- 来店可否や料金を確認したい利用者
- 応募希望者

## 主要ユースケース
- どんな店があるか把握する
- 最寄り/興味のある店舗を選ぶ
- 営業時間、料金、アクセスを確認する
- キャストを探す
- イベントの有無を確認する
- 採用導線に進む

## 公式サイトの役割
- SNSで見つけた興味を、来店可否や店舗選択に変換する。
- 店舗ごとの差を一覧比較できるようにする。
- 料金、場所、営業時間、注意事項を迷わず見つけられるようにする。
- 写真と情報の整合性を担保し、安心材料を提供する。
- 営業中か、どこに行けばよいか、誰に会えるかを確認する最終参照点になる。
- プレゼン用モックでは、現行の導線と情報量を保ったまま、視認性と整列性だけを変える。

## 画面設計の原則
- ホームは「入口」であり、詳細情報の詰め込み場にしない。
- 店舗一覧は比較しやすさを優先する。
- 個別店舗は来店判断に必要な情報を上から順に並べる。
- キャスト一覧は検索・絞り込み前提の構造にする。
- 採用ページは応募までの導線を短くする。
- ページ見出しはスクロール開始直後から縮小し、PC 120px／モバイル96px以内かつ店舗一覧の1店舗目到達前に変形を完了する。
- 縮小後はメニューボタンと同じ固定バー内で省略表示し、店舗色を半透明で維持しつつ文字と操作部品のコントラストを確保する。
- 遠隔通販はメインナビゲーション内の強調された親項目とし、店舗リンクをアクセント付きの子カードとして展開する。

## Repository contract

このrepoは、現行サイトと複数の改修案を比較する静的な提案repoである。実装対象と参照対象を混同しない。

| 区分 | パス | 役割 | 変更方針 |
| --- | --- | --- | --- |
| 現状正本 | `currently/` | 現行サイトの参照実装 | 改修作業では変更しない |
| 主改修案 | `proposal/branch1/` | 現在のUI改修対象 | `basis/WBS.md`の範囲で変更 |
| 視覚比較正本 | `proposal/branch5/` | HTMLメニューと店舗表現の比較元 | 無断変更しない |
| 設計正本 | `basis/`、`DESIGN.md` | 要件、判断、視覚ルール | 内容変更時に関連文書を同期 |

### 非機能上の契約

- 新規外部依存を追加しない。
- 既存の公開URL、現行導線、比較対象を壊さない。
- UIの判断は「モダン」「洗練」などの抽象語だけで決めず、目的、対象者、情報階層、既存素材を根拠にする。
- 視覚変更は、コードだけで完了扱いにせず、390px / 768px / 1440pxで実表示を確認する。
- 変更により正本、対象範囲、重要な判断が変わった場合は、`basis/decision_log.md`を更新する。

## branch5 Instagramスナップショット
- トップページは `instagram-snapshot.json` を読み込み、国内店舗を「わくせい」ページ順に最大9件表示する。
- Instagramのない店舗は除外し、9件に満たない分は先行店舗の新しい投稿を追加する。
- 各項目は、保存画像、投稿URL、アカウント、店舗名、店舗ウォーターマークを一体として管理する。
- 投稿画像は提案作成時点の静的スナップショットとし、実運用時は公式APIによる取得へ置き換える。
- スナップショット再取得コマンド:
  `node proposal/branch5/scripts/scrape-instagram-snapshot.mjs`
## Branch5 HTML menu variant

The canonical image menu remains at `shop/<store>/menu/`. The comparison implementation is
served from `shop/<store>/menu-html/` and uses `shop/menu-html-common.css` plus a minimal
store-local `system.css`. Product and policy information is semantic HTML; imagery is retained
only where the photograph or promotional composition is itself meaningful. Local navigation
orders products before the usage guide. Store identity is integrated into the sticky `h1`.
The supported store slugs are `bloody`, `chocolat`, `cybarbkk`, `cybarbkk2`, `cybarlaos`,
`cybarshinjuku`, `melty`, `roysuga`, `shandy`, `shinjuku`, and `tweeny`. Each variant is
available at `shop/<store>/menu-html/index.html`; the original `menu/` route remains unchanged.
