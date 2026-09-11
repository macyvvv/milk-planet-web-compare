# Independent audit

## Current re-audit: original maximum variants

Scope: 現在の依頼に合わせ、Shandy / Shinjuku / Meltyの`menu-html/index_3.html`を原案のまま監査した。ページ本体と`menu/index.html`はこの再監査では変更していない。

RESOLVED / PASS: Shandyは初回再監査で390pxの歓迎文「ご用意して」が「ご用／意して」と語中分断された。`welcome-phrase`を不可分の意味単位として扱う最小修正を行い、修正後は390pxで「ご用意して」が分断されず、768 / 1440pxでも横溢れしなかった。

PASS: Shinjukuは390 / 768 / 1440pxでヒーロー画像の欠落・横溢れ・主要構造欠陥を確認しなかった。画像内の歓迎文をHTMLへ重複転記していない。

PASS: Meltyは390 / 768 / 1440pxでWebP候補を含む画像の欠落・横溢れ・主要構造欠陥を確認しなかった。画像内のメニュー情報を不要にHTMLへ重複転記していない。

FACT: 3店舗とも各幅で`#menu-content`、h1、意味見出し、ナビゲーションに到達し、計測した画像失敗は0件だった。Shandy / Shinjuku / Meltyの画像・CSS参照はローカルサーバー上で200または304となった。

Decision: ShinjukuとMeltyは内容変更なしで最大番号variantを基にしたリネーム対象とする。Shandyは歓迎文の最小修正後、同じ最大番号variantを基にしたリネーム対象とする。3店舗を画像から作り直さない。

## Compared sources

FACT: 11店舗の`menu/index_0.html`、新`menu/index.html`、対応する`menu-html`候補、Shandy / Shinjuku / Meltyの最大番号variant、元画像版、店舗CSS、共有CSS/JSを比較した。`index_0.html`は元の画像版を保持し、新`index.html`はHTML版へ昇格した。

## Viewports

PASS: 11店舗を390px、768px、1440pxで確認した。全ページで`scrollWidth`はcontent width内だった。Shandyの768pxはブラウザ計測APIがタイムアウトしたが、同幅のスクリーンショットでHTML本文、画像、見出し、横幅を確認した。

| Store | 390px | 768px | 1440px | Images / semantic headings |
| --- | --- | --- | --- | --- |
| Bloody | PASS | PASS | PASS | 2 / 20 |
| Chocolat | PASS | PASS | PASS | 1 / 21 |
| CyBAR BKK | PASS | PASS | PASS | 2 / 12 |
| CyBAR BKK 2nd | PASS | PASS | PASS | 1 / 11 |
| CyBAR LAOS | PASS | PASS | PASS | 2 / 17 |
| CyBAR新宿 | PASS | PASS | PASS | 3 / 18 |
| Melty | PASS | PASS | PASS | 8 / 6 |
| Royal Sugar | PASS | PASS | PASS | 3 / 20 |
| Shandy | PASS | VISUAL PASS / METRIC NOT RUN | PASS | 16 / 29 |
| Shinjuku | PASS | PASS | PASS | 15 / 29 |
| Tweeny | PASS | PASS | PASS | 2 / 21 |

## Static checks

PASS: `validate_repo_contract.py`、`validate_static_contract.py proposal/branch5/shop`、`validate_skill_packages.py`、`validate_work_packets.py`を実行した。新旧50 HTML page scopeで静的contractはPASS。

PASS: 11店舗の新`index.html`で移動後のCSS・画像・共通CSS参照を確認した。新ページの実表示後に404となるローカル参照は確認されなかった。

FACT: 初回のキャッシュ済み旧ページ確認では旧CSS由来の`images/index.png` 404が記録されたが、キャッシュバスター付き新ページでは該当参照は発生しなかった。これは新HTMLの修正結果ではなく、旧画像版／旧CSSの残存問題として`index_0.html`側へ隔離されている。

## Browser observations

PASS: キャッシュバスター付きの公開URL相当パスで、11店舗すべてが`#menu-content`を持つHTML版としてDOM到達した。全幅で水平スクロールなし、計測できたページの画像失敗は0件、h1・ナビゲーション・意味見出しが存在した。

PASS: Shandyの768pxは計測APIがタイムアウトしたが、スクリーンショットでヒーロー、歓迎文、ご利用案内、メニュー幅を目視確認した。未計測のbodyHeightは数値として扱わない。

## Accessibility and content checks

PARTIAL: 新ページの`alt`、h1/h2/h3/h4、skip link、`#nav-toggle`を確認した。既存HTML版の情報構造は引き継がれているが、画像内文言との重複、店舗別フォント、正式なコントラスト判定は別途人手確認が必要。

PASS: 代表ページで`#nav-toggle`へEnterを送ると`aria-expanded=false`から`true`へ変化した。新ページのフッターiframeには`title`がある。

## Findings

### 採用

- 画像版を`index_0.html`へ保存し、既存URLの`index.html`をHTML版へ昇格する。比較正本を失わず、更新可能な本文を公開URLへ配置できる。
- `menu-html`から`menu`へ移す際、共通CSS、店舗CSS、画像、WebP、inline CSS、`srcset`の相対パスを移動先基準へ変換する。

### 保留

- `index_0.html`側に残る旧CSSの`index.png` 404は、画像版正本を変更せず別Scopeで扱う。
- 画像内文字列とHTML本文の完全な重複判定、店舗ごとのフォント・色・長文改行は、店舗別source mapを作成してから追加修正する。

### 構造上の観測

- 新`index.html`は旧画像版のように画像だけを並べるページではなく、意味見出しとHTML本文を持つ。店舗別のsemantic headingsは6〜29個。
- MeltyはWebP画像を含むため、画像の実表示可読性とfallbackを継続確認する。
- Shandy、Shinjuku、Meltyは最大番号variantの内容を引き継いだが、`menu-html`側の原典更新責任は未確定。

## Philosophy continuity

PASS: 保存・昇格・共通化境界を変更前に定義し、`index_0.html`を保存してからHTML版を配置した。Shandy、Shinjuku、Meltyの店舗固有variantを一律テンプレートへ置換していない。

PARTIAL: その他8店舗は既存HTML候補を昇格した段階であり、原典画像との意味差分を完全に店舗別検証したわけではない。追加の店舗別source lockを保留する。

## Cross-page regression

PASS: 11店舗を同じURL構造、参照パス、DOM到達、横幅、画像失敗、見出しの観点で比較した。全店舗で新HTML版へ到達し、画像版は`index_0.html`として残った。

PARTIAL: 共通CSS/JSの実ネットワーク負荷、全イベント冪等性、正式W3C検証は未実施。表示PASSだけで共通基盤の完全性とは判定しない。

## Residual risks

- 既存URLの表示内容が画像版からHTML版へ変わるため、公開後に利用者導線と想定外リンクを確認する必要がある。
- `index_0.html`は比較正本として残るが、旧ページ由来のCSS 404を保持している。画像版を完全に無欠陥化するScopeではない。
- 原典更新Owner、実ネットワーク性能、正式W3C検証、公開後rollbackは未確定。
- Shandy 768pxのDOM計測値は未取得だが、表示確認は実施済み。
