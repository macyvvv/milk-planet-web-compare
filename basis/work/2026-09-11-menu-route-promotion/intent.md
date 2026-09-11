# Change

画像版メニュールートを`index_0.html`として保存し、監査済みのHTML版を同じURLの`index.html`へ昇格する。

## Viewing situation

FACT: 初来店者がスマートフォンまたはPCで、店舗固有の雰囲気を保ちながら料金・注文・利用条件を確認する。

## Business and human outcome

USER: 既存URLを維持したまま、画像だけに依存しない更新可能なメニューへ移行し、来店・注文判断までの不安を減らす。

## Source lock

CONSTRAINT: 各店舗の既存`menu/index.html`を画像版正本として`menu/index_0.html`へ保存する。`menu-html`の既存HTMLと最大番号variantを比較元とし、元画像版・店舗CSS・共有CSSを根拠にする。

## Hierarchy

FACT: 店舗識別と導入、料金・主要メニュー、限定・注意事項の順で確認できることを優先する。原版の情報順を変更する場合は店舗別に理由を残す。

## Commitments

1. CONSTRAINT: 画像版を`index_0.html`に保存し、既存の比較正本を破壊しない。
2. USER: Shandy、Shinjuku、Meltyは最大番号variantを監査して`index.html`へ配置する。
3. FACT: その他8店舗は既存HTML版を候補にし、相対パス・情報完全性・店舗固有性を監査してから配置する。

## Deliberate exclusions

CONSTRAINT: 元画像、`menu-html`比較元、店舗CSS、共通CSS/JS、店舗トップ、公開URL、未追跡PPTXは変更しない。根拠のないコピー、装飾、画像クロップ、価格の補完は行わない。

## Tradeoffs and unknowns

INFERENCE: 新URLを作らず既存URLをHTML版へ昇格すると利用者の到達先を変えずに更新性を得られるが、画像版を直接見たい場合は`index_0.html`を明示する必要がある。

## Principle under test

USER: 正本を保存したうえで、店舗固有の意味と判断原理をHTMLへ移し、共通基盤のパスや構造だけを機械的に整える。

## No-change option

FACT: 既存の画像版を`index.html`のまま残す案は比較の安全性が高いが、公開URLで更新可能なHTMLメニューを提供できないため採用しない。

## Transfer boundary

STRUCTURAL: 画像版保存、移動後の相対パス検査、3幅ブラウザ監査、W3C相当の構造確認は全店舗へ適用する。

LOCAL: ヒーロー範囲、色、フォント、画像保持、情報順、改行、密度は店舗ごとに再判定する。

UNKNOWN: 各店舗の最新原稿Owner、公開後の更新責任、実ネットワーク性能はこの作業だけでは確定しない。
