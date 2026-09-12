# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `shop/*/menu/index.html` | 11店舗の公開HTMLメニュー | content / navigation | HTML構造を整理 | active route | 順序・アンカー・枠の横断監査対象 |
| `shop/*/menu/index_0.html` | 保存した旧画像メニュー | source | 意図的保持 | image source | 内容・順序の比較元。変更しない |
| `shop/*/menu/images/` | 商品・販促・店舗固有画像 | content / hero | 既存参照を保持 | image source | 画像の意味と更新責任は店舗別に異なる |
| `shop/menu-html-common.css` | HTMLメニュー共通レイアウト | structure | newcomer-groupの共通枠とレスポンシブ規則を追加 | shared CSS | 全HTMLメニューconsumerへ波及 |
| 店舗別 `menu-html/system.css` / inline CSS | 色、密度、角、見出し、固有レイアウト | local expression | 既存固有表現を維持し必要箇所だけ上書き | local CSS | 共通化による店舗らしさの減衰に注意 |
