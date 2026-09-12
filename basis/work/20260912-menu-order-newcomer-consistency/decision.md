# Decision

## Scope

- 11店舗の `proposal/branch5/shop/*/menu/index.html` の情報順、ローカルナビ、存在するご新規セットの構造を整理する。
- 共通CSSへご新規セットのグループ枠を追加する。
- `currently/`、`menu/index_0.html`、`menu/images/` は対象外。
- `basis/README.md`、`basis/system_spec.md`のroute記述を現行実装へ同期する。

## Target files

- `proposal/branch5/shop/*/menu/index.html`（11店舗）
- `proposal/branch5/shop/menu-html-common.css`
- `proposal/branch5/shop/shandy/menu-html/system.css`、`menu-html/index.html`（ShandyLove固有表現の回帰防止とCSS cache bust）
- `basis/README.md`
- `basis/system_spec.md`
- `basis/work/20260912-menu-order-newcomer-consistency/*`

## State

State: RELEASED

## Gate status

- Source lock: PASS — 保存原典、公開route、店舗別HTML/CSSを確認済み。
- Content and task: PASS — 11店舗の見出し順、nav、newcomer有無を抽出済み。
- Structure: PASS — 標準順序、例外境界、枠責務を決定済み。
- Intent: PASS — `intent.md`にViewing situation、階層、非採用、転用境界を記録済み。
- Independent audit: PASS — 全11店舗を390 / 768 / 1440pxで確認済み。実装者監査であり第三者レビューではない。
- Release: PASS — commit、push、PR #60、merge、Pagesデプロイ、公開URLを確認済み。

## Philosophy gate

- Principle under test: 共通化は情報の意味階層と操作予測性へ適用し、店舗固有の色・密度・画像役割は残す。
- Priority: 初来店者の料金・初回セットへの到達性を優先し、原典の固有表現を失わせない。
- Preserved asymmetry: ShandyLoveの案内先行・罫線中心、Shinjukuの案内先行・パネル、Meltyの画像主体、海外店舗のカテゴリ差。
- No-change option: 現状維持は枠とnavの不一致を残すため不採用。原典画像と価格本文の変更は行わない。
- Transfer boundary: 順序の意味グループ、nav-anchor一致、料金内の独立セットブロックはSTRUCTURAL。色・角・画像の扱いはLOCAL。
- Unknown: 実利用者の行動効果、店舗校正、運用Owner。

## Coverage

- Target pages: bloody, chocolat, cybarbkk, cybarbkk2, cybarlaos, cybarshinjuku, melty, roysuga, shandy, shinjuku, tweeny.
- Comparison pages: corresponding `menu/index_0.html` and `menu-html/index.html` where present.
- Shared consumers: 11 promoted menu routes and existing HTML comparison routes loading `menu-html-common.css`.

## Definition of done

- 11公開routeでローカルnavと本文順序が一致する。
- ご新規セットがある店舗は料金系情報に所属し、通常料金との二重枠がない。
- 原典画像保存、価格、文言、店舗固有CSSを不要に変更しない。
- 390 / 768 / 1440pxで横スクロール・主要アンカー・枠崩れを確認する。
- 静的検証、repo contract、work packet validator、独立監査がPASSする。
- commit、push、PR、merge、公開URLを別々に確認する。

## Parking lot

- ご新規セットの実際の利用率・予約率の計測設計。
- 11店舗の価格・原稿の店舗責任者校正。
- `menu/`と`menu-html/`の二重実装を将来一元化する判断。
