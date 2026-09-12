# Independent audit

## Compared sources

- `currently/recruit/`は変更せず、募集文言、条件、URL、既存画像を保持した。
- 共有`proposal.css`と`proposal.js`の責務を確認した。

## Viewports

PASS — 静的検証、指定3幅の表示検証、主要操作、共有アンカー回帰を完了。

## Static checks

- `python3 tools/validate_static_contract.py proposal/branch5/recruit`: PASS
- `python3 tools/validate_repo_contract.py`: PASS
- `git diff --check`: PASS
- `node --check proposal/branch5/proposal.js`: PASS
- 条件行クラス: 6件、応募ステップ: 3件、応募ステップ番号: 3件
- 募集条件の表示数値: `1,500円〜3,000円`、`1,200円〜`へ整形

## Browser observations

- 390px / 768px / 1440pxで横スクロールが発生しないことを確認。
- 390pxで採用ページのアンカー着地、エリア選択、CTA幅を確認。
- 既定幅1920×934相当でタイトル高さ210px、CTA幅360pxを確認。
- 条件行は`display:grid`で表示。
- 応募ステップの標準番号を除去し、3カード表示を確認。
- `募集条件を見る`クリック後、募集職種見出しが画面上部に表示され、タイトルが縮小状態になることを確認。
- 東京→大阪のラベル操作で、大阪パネルのみ表示されることを確認。
- ナビ開閉で`aria-expanded`とopacity / pointer-eventsが同期することを確認。
- トップ`#event`、キャスト`#chocolat`、Shandyメニュー`#pricing`のハッシュ遷移を確認。
- browser error / warning log: なし。

## Accessibility and content checks

- 条件表は`dt` / `dd`を維持し、応募手順は`ol`の標準番号を除去して視覚番号へ整理した。
- エリア選択はラジオとlabelの関連付けを維持し、非選択パネルは`hidden` / `aria-hidden`で隠れる。
- 既存の募集原稿、画像alt、応募先URLは変更していない。

## Findings

- STRUCTURAL: HTMLとCSSのクラス不一致を修正した。
- STRUCTURAL: 固定タイトルとスムーススクロールの競合を共有アンカー処理で修正した。
- LOCAL: CTA幅、余白、色、装飾を採用ページ内で調整した。

## Residual risks

- 募集条件・応募先URLの鮮度、応募率への影響は運用上の確認事項として残る。
- キャスト店舗ハッシュはDOM idではなく、既存のJSフィルタ状態で解決する仕様である。
