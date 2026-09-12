# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `currently/recruit/index.html` | 募集文言、条件、応募先、エリア構造 | content | HTML化 | source | 応募条件・URLの変更禁止 |
| `currently/recruit/recruit.css` | 既存のピンク、雲形、青系選択UI | visual language | source-derived CSS | source | 旧固定幅・無効単位は継承しない |
| `proposal/branch5/recruit/images/{bloody,chocolat,cybar,melty,roysuga,shandy,shinjuku,tweeny}.jpg` | 店舗ビジュアル | content / discovery | 画像として保持・lazy load | source | 店舗選択後に表示 |
| `proposal/branch5/recruit/images/{line,mail,x}.png` | 応募先ロゴボタン | action asset | 画像として保持 | source | 外部リンク先は保持 |
| `proposal/branch5/proposal.css` | 共通ナビ・タイトル・ページ基盤 | shared layout | 継承、対象CSSを後置 | shared | recruit.cssでページ固有上書き |
| `proposal/branch5/recruit/index.html` | 現行Branch5公開案 | implementation | 構造改修 | implementation | `currently`との差分を説明可能にする |
