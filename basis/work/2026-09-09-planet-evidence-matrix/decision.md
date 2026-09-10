# Decision

## Scope

2ページの`menu/images/`全アセットと、原典HTML・店舗CSS・`index_3.html`の関係を、ページ固有／共通／未検証へ分離して記録する。外部資料は設計哲学の候補軸としてMatrixへ追加する。

## Target files

- `basis/planet_page_evidence_matrix.md`
- `basis/README.md`
- `basis/system_spec.md`
- `tools/validate_repo_contract.py`
- `basis/decision_log.md`
- `basis/work/2026-09-09-planet-evidence-matrix/`

## State

State: LEARNED

## Gate status

- Source lock: PASS — Shandy13件、新宿12件の`menu/images/`を列挙し、原典HTML・CSS・HTML版へ対応付けた
- Content and task: PASS — 歓迎、案内、禁止事項、料金、商品、特典、告知、更新情報を意味ブロックとして分類した
- Structure: PASS — アセット表、横断判断表、哲学的評価軸、MECE残存課題を分離した
- Intent: PASS — AIらしさを装飾逆張りではなく、根拠・優先順位・責任・反復の不足として定義した
- Independent audit: PASS — 全アセット行、派生画像、`event1.jpg`、外部参照、未検証範囲を別観点で再確認した
- Release: NOT RUN — Matrix作成のみで、外部GitHub操作は依頼範囲外

## Definition of done

- 2ページの全`menu/images/`アセットがMatrixに存在する
- 各行に意味、処理、正本、実装箇所、状態・リスクがある
- ページ固有判断と共通原則が分離されている
- 外部資料を設計哲学へ翻訳し、AI使用の有無とAIらしい未検証出力を混同していない
- MECEでない範囲を明示している
- validator、repo contract、diff checkが通る

## Parking lot

- 商品名・価格を一件ずつ比較するcontent diff
- 共通ページシェル、フォント、JavaScript、解析タグの別マトリクス
- ブラウザ、キーボード、W3C相当、低速時の独立監査
- 来店・予約・注文の到達時間と成功率の計測
- 別店舗・別ページでの前方検証
