# Independent audit

## Compared sources

FACT: 11店舗のcanonical `menu/index.html`、11店舗の`menu-html/index.html`、既存variantのShandy `index_2` / `index_3`、Shinjuku `index_3`、Melty `index_3`、共有CSS/JS、元画像版を比較した。今回のSkill更新でページ本体は変更していない。

## Viewports

PASS: canonical 11ページはページ本体に差分がないことを確認したうえで、既取得の390px、768px、1440px実表示証跡を横断再判定した。既存variant 4ページはSkill更新後に同じ3幅で再表示した。確認した全ページで水平スクロールは発生しなかった。

| Target | 390px | 768px | 1440px | Notes |
| --- | --- | --- | --- | --- |
| canonical 11 pages | PASS | PASS | PASS | `scrollWidth`はviewportのcontent width内 |
| Shandy index_2 | PASS | PASS | PASS | body height 12058 / 13497 / 8179 |
| Shandy index_3 | PASS | PASS | PASS | body height 11531 / 13143 / 7531 |
| Shinjuku index_3 | PASS | PASS | PASS | body height 10835 / 11865 / 7341 |
| Melty index_3 | PASS | PASS | PASS | body height 4863 / 8558 / 7253 |

## Static checks

PASS: `validate_skill_packages.py`、`validate_work_packets.py`、`validate_repo_contract.py`、`validate_static_contract.py proposal/branch5/shop`を実行し、すべてPASS。

FACT: canonical menu 11ページでは、10ページに閉じタグ数の不整合があり、Bloodyでは画像がグリッド外へ出る。8ページがHTML形式の404実体を`eventlist.js`として読み込む。Chocolat、Shandy、Shinjukuでは`images/index.png`参照が404になる。

FACT: canonical 11ページの初期参照画像は合計約74.85MiBで、menu画像に`loading`、明示寸法、`decoding`指定がない。

UNKNOWN: 正式なW3C Validatorの実行環境と、実ネットワーク下のLCP / CLSは未確認。

## Browser observations

PASS: 390px、768px、1440pxでDOM到達を確認。canonical 11ページの既取得証跡とvariant 4ページの更新後実測を横断し、水平スクロールなし。variantの画像に致命的な`naturalWidth=0`はなく、遅延画像はMeltyでスクロール後に全件完了した。

FACT: variantのh1は店舗名を十分に主見出しへ統合せず、`システム&メニュー`が主表示である。Shandy index_3は390pxで歓迎文が「ご用／意して」のように意味境界をまたいで折り返す。Shinjuku index_3は淡色h1上のロゴが薄く、店舗識別性が弱い。

FACT: `#nav-toggle`はvariantで一意に解決し、Enter操作前後で`aria-expanded=false`から`true`へ変化した。

## Accessibility and content checks

PARTIAL: 見出し、alt、focus、言語境界、画像とHTMLの重複を静的・ブラウザで確認した。variantはsemantic headingsを持つが、h1の店舗識別、画像内文言の代替、フォント根拠、正式コントラスト表は未解消。

FACT: canonical menuは画像主体で意味見出しがなく、フッターiframeに`title`がない。variantはHTML化された情報を持つが、画像に含まれる情報との重複・役割分担を店舗ごとに確認する必要がある。

## Findings

### STRUCTURAL

- `P0`: 404 HTMLをJSとして読み込む8ページと、誤った背景画像参照3ページ。ページの信頼性と監査結果を壊すため、実装前Resource Integrity Gateで停止すべき。
- `P0`: 初期画像約74.85MiB、寸法・lazy指定不足。表示速度と来店判断までの到達距離に直結する。
- `P1`: canonicalの閉じタグ不整合とBloodyのグリッド外画像。ブラウザ補正に依存し、共通CSS変更時の回帰点になる。
- `P1`: 共有CSS/JSの全consumer回帰を、単一ページの表示PASSで代替してはならない。

### LOCAL

- `P1`: Shandy index_3の歓迎文は390pxで自然な意味境界に折り返さない。本文の要素分割を検討するが、文言を変更しない。
- `P1`: Shinjuku index_3は淡色h1上でロゴが薄い。店舗識別性を維持する根拠とコントラストを確認する。
- `P2`: Melty index_3は画像内情報とHTML見出しの役割分担を、店舗原典と照合し続ける。

### UNKNOWN

- 正本更新のOwner、事業KPI、正式W3C実行、実ネットワーク性能予算は未確定。推測で埋めず、実装前に保留する。

## Philosophy continuity

PASS: Principle under test（判断原理を保存し、装飾を人間らしく見せることを目的にしない）はSkillsへ反映された。No-change optionとTransfer boundaryもpacketへ記録され、所見をLOCAL / STRUCTURAL / UNKNOWNへ分類した。

FACT: 技術ゲートは構造欠陥を検出できるが、店舗固有の色・密度・改行・画像役割の妥当性はブラウザと原典の人手比較が必要であり、自動PASSへ置き換えられない。

## Cross-page regression

PASS: canonical 11ページと既存変更済み4variantを同じ幅・同じ観点で比較した。全ページで水平スクロールはないが、canonicalのresource integrity、構造、性能問題は残っており、表示PASSだけでは完了扱いにできない。

PARTIAL: 共有CSS/JSの挙動は代表ページで確認したが、正式な全consumerのイベント冪等性・実ネットワーク依存・性能負荷は自動化されていない。

## Residual risks

- canonicalのP0/P1問題は今回のScopeがSkill改善と監査のみのため未修正。
- variantの意味境界・ロゴ識別性は改善候補だが、ページ本体変更には別承認が必要。
- ブラウザ監査はローカルHTTP環境であり、公開CDN、外部フォント、GTM、実ネットワーク条件とは異なる。
- 原典更新のOwner、実運用KPI、正式W3C検証は未確定。
