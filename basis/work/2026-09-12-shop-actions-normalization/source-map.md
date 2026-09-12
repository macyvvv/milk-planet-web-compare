| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/shop/*/index.html` | 11店舗の店舗情報とCTA | page source | 構造変更 | Branch5 shop pages | リンク先・文言・店舗ごとのCTA数を保持 |
| 各店舗の`style.css` | 店舗固有色・角丸・旧CTAルール | local style | 旧CTAルール除去 | local CSS | 色・ロゴ・背景は変更しない |
| `proposal/branch5/proposal.css` | 全ページ共通オーバーライド層 | shared structure | `.shop-actions`を追加 | shared CSS | selectorをCTAクラスへ限定し、menuページへ波及させない |
| `DESIGN.md` | 視覚正本・共通レイアウト規約 | design contract | 参照 | canonical design | 店舗固有性の平坦化を禁止 |
| `basis/system_spec.md` | 来店判断・情報到達要件 | requirement | 参照 | canonical requirement | CTAをキャスト・メニュー到達へ接続 |

店舗別CTA処理:

| Store | CTA treatment |
| --- | --- |
| chocolat / roysuga / shandy / shinjuku | メイド一覧＋メニューの2リンクを保持 |
| bloody / cybarshinjuku / melty / tweeny | メニューのみ。空のキャスト枠を除去 |
| cybarbkk / cybarbkk2 / cybarlaos | メニューのみ。コメントアウト導線を再有効化しない |
