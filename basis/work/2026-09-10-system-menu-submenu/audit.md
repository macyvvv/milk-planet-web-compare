# Independent audit

## Compared sources

- `proposal/branch5/index.html`の`#sys .sys-shops`
- `proposal/branch5/proposal.js`の既存「えんかく つうはん」生成処理
- `proposal/branch5/navigation.css`
- `proposal/branch5/shop_menu_override.css`

## Viewports

- 390px: PASS — 子メニュー10件、`documentScrollWidth=375`、子リストの矩形はleft 92 / right 343 / top 317 / bottom 793。スクリーンショットで親子階層、折返し、縦スクロールを確認。
- 768px: PASS — 子メニュー10件、`documentScrollWidth=753`、子リストの矩形はleft 470 / right 721 / top 317 / bottom 793。
- 1440px: PASS — 子メニュー10件、`documentScrollWidth=1425`、子リストの矩形はleft 1164 / right 1394 / top 301 / bottom 717。スクリーンショットで右上のピルメニューと子項目の収まりを確認。

## Static checks

- JavaScript syntax: PASS — `node --check proposal/branch5/proposal.js`。
- Repository contract: PASS — `python3 tools/validate_repo_contract.py`。
- Work packet structure: PASS — `validate_work_packet.py ... --state AUDITED`。
- Static HTML contract: PASS — `python3 tools/validate_static_contract.py proposal/branch5`。

## Browser observations

- Navigation open/close: PASS — 親メニューの開閉と閉じる操作で子メニュー状態をリセット。
- System submenu open/close: PASS — `しすてむ＆めにゅう`を押すと10店舗の子リンクが表示される。
- Remote submenu regression: PASS — 遠隔通販を開くとシステム子メニューが閉じ、逆方向も同様。
- Store menu link resolution: PASS — Topから`shop/shinjuku/menu/index.html`へ遷移し、深い相対パスのShandy `index_3.html`でも10件が正しく生成される。

## Accessibility and content checks

- Parent button keyboard operation: PASS — Enterでシステム子メニューを開き、Escapeでナビと子メニューを閉じる。
- `aria-expanded` / `aria-controls`: PASS — 親ボタンと子メニューの状態属性を確認。
- All 10 store destinations: PASS — Topの既存店舗順・リンク先を維持し、生成リンク10件を確認。
- No direct system anchor navigation: PASS — 実行後DOMに`#sys-title-wrapper`リンクは残らず、親はbuttonになる。

## Findings

- PASS — 承認済みScopeのナビ挙動、主要幅、リンク、キーボード操作を確認した。

## Residual risks

- JS無効環境では親子化が反映されず、従来のシステムアンカーが残る。
- 画像・外部埋め込みの完全な低速ネットワーク挙動は今回のナビ変更では未検証。
- FACT: ローカル確認中に新宿の既存画像メニューページが`shop/shinjuku/menu/images/index.png`を404参照した。今回の変更対象外で、ナビJSの挙動・リンク解決とは無関係として保留する。
