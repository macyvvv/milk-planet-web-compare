| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `shop/*/menu/index.html` | 11店舗の既存画像版 | comparison source | rename to `index_0.html` | image menu | 内容を保持し、公開URLの正本から退避 |
| `shop/*/menu-html/index.html` | 8店舗のHTML候補 | implementation source | audit and path-adapt | HTML candidate | 原典との差分を店舗別に確認 |
| `shandy/menu-html/index_3.html` | Shandy最大番号variant | implementation source | audit and path-adapt | existing variant | 画像とHTMLの重複、意味境界を再確認 |
| `shinjuku/menu-html/index_3.html` | Shinjuku最大番号variant | implementation source | audit and path-adapt | existing variant | ヒーロー範囲とロゴ識別性を再確認 |
| `melty/menu-html/index_3.html` | Melty最大番号variant | implementation source | audit and path-adapt | existing variant | WebP配信とHTMLの役割を再確認 |
| `shop/*/menu/system.css` | 既存画像版の店舗CSS | style source | retain | local skin | 新indexから参照する |
| `shop/*/menu-html/system.css` | HTML版の店舗CSS | style source | retain and reference | local HTML skin | 移動後の相対参照を正規化 |
| `shop/menu-html-common.css` | HTML共通CSS | shared style | reference | shared | `menu/`からの相対パスへ変換 |
