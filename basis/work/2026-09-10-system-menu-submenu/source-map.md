# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/index.html#sys .sys-shops` | 10店舗のメニューリンク | system menu destinations | リンク・別導線へ移動 | Branch5 Top | 既存の表示順と`menu/index.html`を維持 |
| `proposal/branch5/index.html#sys-title-wrapper` | システム&メニュー見出しアンカー | old navigation destination | 意図的除外 | Branch5 Top | ナビの直接遷移先としては使用しない |
| `proposal/branch5/proposal.js` | 遠隔通販の親子メニュー生成 | shared interaction pattern | HTML化 | Branch5 shared JS | 既存の開閉・外部リンク属性を再利用 |
| `proposal/branch5/navigation.css` | 親ボタン・子リストのピル表示 | shared presentation | HTML化 | Branch5 shared CSS | 既存CSSを再利用し、新規装飾は追加しない |
| `proposal/branch5/shop_menu_override.css` | 店舗ページ用子メニュー配置 | page-specific presentation | HTML化 | Branch5 shared override | 10項目での高さ・狭幅表示を監査対象とする |
