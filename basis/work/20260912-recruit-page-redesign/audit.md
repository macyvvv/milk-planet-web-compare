# Independent audit

Audit result: CONDITIONAL — 実装後の静的・既定ブラウザ監査はPASS。Chrome拡張のviewport overrideがページへ反映されず、390 / 768 / 1440pxの実幅検証のみ未完了。

## Compared sources

PASS — `currently/recruit/index.html`と`currently/recruit/recruit.css`を変更していないこと、proposalの旧情報を構造変更後も保持していること、`proposal/branch5/proposal.css` / `navigation.css`の共有契約を確認した。GTM、analytics、既存画像、既存応募先URLを保持し、AOS/Swiperの未使用参照は除去した。

## Viewports

PARTIAL — Chrome拡張の既定ページは1920×934で確認した。viewport capabilityで390×844、768×900、1440×900を指定したが、実ページの`innerWidth`は各回1920pxのままで反映されなかった。CSSには`max-width:780px`と`max-width:480px`の分岐があり、ソース上の固定幅・横溢れ要因を確認した。実幅の視覚確認は残存リスクとする。

## Static checks

PASS — `python3 tools/validate_static_contract.py proposal/branch5/recruit`、`python3 tools/validate_repo_contract.py`、`git diff --check`を実行した。HTML内のID重複なし、既存画像参照13件を保持、既存募集情報・応募先URLの必須値欠落なし。

## Browser observations

PASS — 既定ブラウザでページを表示し、冒頭の雲形タイトル、導入、募集職種、応募方法の順序を確認した。ナビの開閉は`めにゅうを開く`→`めにゅうを閉じる`で`aria-expanded`と可視状態が同期した。東京→大阪→福岡のラベルクリックで選択パネルだけが表示され、非選択パネルは`hidden` / `aria-hidden=true`となった。browser error/warning logは空だった。

## Accessibility and content checks

PASS — h1/h2/h3の階層、`fieldset` / `legend`、ラジオ3件とlabel関連付け、既存URL・画像・募集条件を確認した。入力は視覚的に隠すがキーボード到達可能な方式へ変更し、focus-visibleを追加した。CTA画像には役割を示すaltとloading/寸法属性を付けた。

## Philosophy continuity

PASS — 雲形タイトル、既存店舗画像、LINE/X/メール画像を保持し、装飾追加ではなく導入→条件→選択→連絡先の情報階層を主変更とした。共有ナビは既存のBranch5 canonical ownerへ戻し、ページ専用CSSが共通ナビを上書きしないことをブラウザで再確認した。

## Cross-page regression

PASS (scope check) — `currently/`、共有`proposal.css`、共有`navigation.css`、既存recruit画像は変更していない。recruit専用CSSの変更範囲に限定し、共通ナビの開閉契約とGTM/analyticsを保持した。Branch5全ページを再撮影する独立横断監査は未実施。

## Findings

- [LOCAL] 表組みと空白依存を廃止し、募集条件・応募導線をページ内の階層へ整理した。
- [STRUCTURAL] エリア選択はradio + label + `hidden` / `aria-hidden`の状態契約へ統一した。
- [LOCAL] 既存のピンク・雲形タイトル、店舗画像、CTA画像は維持した。
- [UNKNOWN] Chrome拡張で指定viewportが反映されないため、390 / 768 / 1440pxの実幅視覚確認は未完了。

## Residual risks

- 実際の応募率と原稿の鮮度はブラウザ監査では確定できない。
- Chrome拡張のviewport override非反映により、モバイル・タブレット幅の実ブラウザ表示は未確認。公開前に別の実ブラウザまたはCIスクリーンショットで補完する。
