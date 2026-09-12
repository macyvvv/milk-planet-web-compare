# Source map

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `proposal/branch5/cast/index.html` | Six store filter controls | interaction | HTML/CSS repair | Branch5 implementation | Empty `img` elements currently have no `src`; selected state is not robustly exposed. |
| `proposal/branch5/cast/castlist.js` | Cast data and card generation | content/data | Preserve data; replace parser-time output with DOM output | Branch5 implementation | Existing `document.write()` makes lifecycle and target capture brittle. |
| `proposal/branch5/images/list_shandy.png` and sibling `list_*.png` | Store logos | control visual | Use as direct `img src` | Branch5 asset | All six supported filter assets exist and are 300x300 RGBA PNGs. |
| `proposal/branch5/cast/cast.css` | Filter/control/card layout | presentation | Repair selector, size, focus, selected state | Branch5 implementation | Current `dd` has no explicit control box and relies on parent backgrounds. |
| `currently/cast/index.html` / `cast.css` | Existing cast page | comparison baseline | Read-only comparison | Current-site reference | Must not be modified. |
| `DESIGN.md` and `basis/system_spec.md` | Visual and functional constraints | design/requirements | Preserve | Repo canonical knowledge | Responsive widths and information hierarchy are required. |
