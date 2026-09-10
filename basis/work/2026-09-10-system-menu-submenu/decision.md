# Decision

## Scope

`proposal/branch5`の共通ピルメニューにおいて、「しすてむ＆めにゅう」をTopアンカーから店舗メニューの子ドロップダウンへ変更する。既存の「えんかく つうはん」の挙動を共通化し、同時に複数の子メニューを開かない。

## Target files

- `proposal/branch5/proposal.js`
- `basis/system_spec.md`
- `basis/decision_log.md`
- `basis/work/2026-09-10-system-menu-submenu/`

## State

State: AUDITED

## Gate status

- Source lock: PASS — Topの10店舗リンク、共通ナビCSS、既存通販子メニューを確認。
- Content and task: PASS — 既存の店舗リンク先・順序を維持し、Top中継を除去。
- Structure: PASS — 親をbutton、子をul/li/aとして生成し、`aria-expanded`と`aria-controls`を付与。
- Intent: PASS — 既存のピル・子メニュー表現を再利用し、装飾・画像・店舗固有情報を追加していない。
- Independent audit: PASS — 390 / 768 / 1440px、Top、店舗メニュー、Shandy `index_3.html`、開閉、ARIA、キーボード、相対リンクを確認。
- Release: NOT RUN — commit、push、PR、merge、publishは依頼範囲外。

## Definition of done

- 「しすてむ＆めにゅう」がTopアンカーへ遷移せず、子ドロップダウンを開く。
- 10店舗すべてが既存の`menu/index.html`へ遷移する。
- 遠隔通販とシステムの子メニューが独立して開閉し、閉じる操作で状態が戻る。
- 390px、768px、1440px前後で横溢れや子メニューの欠落がない。
- キーボードで親ボタンを操作でき、ARIA状態が開閉と一致する。
- repo契約validatorとwork packet validatorが通る。

## Parking lot

- HTML静的ソースへ子メニューを直接記述する構成への変更。
- Branch1への横展開。
- JS無効環境向けの代替ナビゲーション。
