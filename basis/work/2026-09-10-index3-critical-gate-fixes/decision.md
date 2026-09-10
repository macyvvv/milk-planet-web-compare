# Decision

## Scope

監査で確認した公開品質上の局所欠陥を、ShandyLoveとmilkplanet新宿の`index_3.html`へ適用する。Meltyはコード変更せず、画像中心構成の残存リスクを記録する。

## Target files

- `proposal/branch5/shop/shandy/menu-html/index_3.html`
- `proposal/branch5/shop/shinjuku/menu-html/index_3.html`
- `basis/work/2026-09-10-index3-critical-gate-fixes/`

## State

State: AUDITED

## Gate status

- Source lock: PASS — 原典画像、既存HTML、店舗CSS、前回監査結果を確認
- Content and task: PASS — URL、画像、本文情報、画像とHTMLの責務を維持
- Structure: PASS — Shandyの本文ランドマークと新宿ヒーロー枠だけを変更
- Intent: PASS — 制作途中表記を公開面から除去し、原典画像に存在しない枠を追加しない
- Independent audit: PASS — 390 / 768 / 1440px、静的契約、画像、アンカー、構造、ヒーロー枠を確認。正式W3Cとブラウザコンソール取得は未実施。
- Release: NOT RUN — push、PR、merge、publishはScope外

## Definition of done

- Shandyの`title`に比較用名称が残っていない
- Shandyに`main#menu-content`が存在する
- 新宿ヒーローにCSS由来の背景色・角丸枠がない
- Meltyの画像中心構成と残存リスクが記録されている
- 3ページを390 / 768 / 1440pxで確認し、横溢れ、画像、アンカー、コンソールを記録する
- 未検証項目をPASSと誤認せず、auditへ明記する

## Parking lot

- Meltyの全文HTML代替または構造化データ化
- 正式W3C validatorのCI接続
- 商品・価格単位の原典差分検査
- 公開後Owner、更新期限、監視、ロールバック運用の確定
