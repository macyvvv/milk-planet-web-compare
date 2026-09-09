# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/shop/shinjuku/images/base_shinjuku.png` | 新宿店舗ロゴと淡色背景 | brand asset | 画像として保持 | image source | タイトル面を画像背景と整合させる。別ロゴ生成はしない。 |
| `proposal/branch5/shop/shinjuku/menu/images/menu1-hero.jpg` | 歓迎ビジュアル | hero | 画像として保持 | source-derived crop | クロップと参照先は変更しない。 |
| `proposal/branch5/shop/shinjuku/menu/images/event1.jpg` | ポイント・会員カード特典 | content | HTML化済み | image source / HTML maintenance surface | 今回は内容を変更しない。 |
| `proposal/branch5/shop/shinjuku/menu-html/index_3.html` | タイトル、価格、ポイント、注記 | implementation | CSSとtitleの局所修正 | implementation | 既存の意味構造、URL、画像参照を維持する。 |
| `proposal/branch5/shop/menu-html-common.css` | 共通見出し・価格リスト・レスポンシブ | shared constraint | 変更しない | shared CSS | ポイント専用規則は店舗ページ内へ限定する。 |
