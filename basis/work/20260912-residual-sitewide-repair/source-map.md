# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/shop/shop.css` | Shop-list title decoration | presentation | 意図的除外 of missing decorative reference | Branch5 CSS | No `w_shop.png` exists in proposal or current assets; title text and cutline remain. |
| `proposal/branch5/footer.html` | 11 linked store logos | accessibility | HTML化 | Branch5 footer | Existing links are preserved; alt labels are added from the linked store identity. |
| `proposal/branch5/recruit/index.html` / `recruit.css` | Two about blocks and shared presentation | structure/presentation | HTML化 | Branch5 recruit page | One unique `about` fragment target is retained; both blocks keep the `.about` class. |
| `proposal/branch5/shop/index.html` | 13 store wrapper class declarations | structure | HTML化 | Branch5 shop list | `shop` and `content` selector contracts are combined into one class attribute. |
| `proposal/branch5/index.html`, `shop/index.html`, `recruit/index.html` | Line breaks | content markup | HTML化 | Branch5 HTML | Invalid `</br>` is normalized to `<br>` without changing text. |
| `proposal/branch5/shop/<store>/menu/**` | Original image-menu comparison routes | comparison source | 意図的除外 | Branch5 image-menu source | Legacy missing references are not altered under repo contract. |
