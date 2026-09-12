# Decision

Change class: LOCAL UI REFINEMENT + STRUCTURAL BUG FIX

## State

State: RELEASED

## Scope

- `proposal/branch5/recruit/index.html`の条件表、応募手順、応募導線、表示数値を修正する。
- `proposal/branch5/recruit/recruit.css`で意図したレイアウトを実DOMへ適用し、過剰な余白・CTAサイズ・コントラストを調整する。
- `proposal/branch5/proposal.js`のアンカー処理を、タイトル縮小後のレイアウトに対して計算するよう補正する。
- `currently/`、既存画像、募集原稿、応募先URLは変更しない。

## Target files

- `proposal/branch5/recruit/index.html`
- `proposal/branch5/recruit/recruit.css`
- `proposal/branch5/proposal.js`
- `basis/work/20260912-recruit-page-refinement/*`

## Gate status

- Source lock: PASS
- Content and task: PASS
- Structure: PASS
- Intent: PASS
- Independent audit: PASS
- Release: PASS

## Approved outcome

- 募集条件はラベルと内容が整列し、区切り線を持つ。
- 応募手順は3つの視覚的なステップとして表示される。
- 「募集条件を見る」は固定タイトルと競合せず、募集職種へ着地する。
- 応募CTAは画面を占有せず、クリック可能性を維持する。
- 表示上の4桁以上の数値は3桁区切りのカンマを使用する。

## Non-goals

- 募集条件、応募先、価格、店舗名、外部リンクの意味変更。
- 新規画像・新規外部依存の追加。
- `currently/`や他ページのデザイン刷新。

## Risks

- 共有アンカー処理の変更が他ページのページ内リンクに影響する可能性があるため、既存アンカーの静的確認とブラウザ確認を行う。
- Chrome拡張のviewport制約により、390 / 768 / 1440pxの実幅確認ができない場合は残存リスクとして記録する。

## Definition of done

- HTML/CSSのクラス契約が一致する。
- 数値表示が要件どおりに整形される。
- static contract、repo contract、`git diff --check`がPASSする。
- ブラウザでアンカー、エリア切替、ナビ開閉、CTA表示を確認する。

## Parking lot

- 募集条件・応募先URLの運用上の鮮度確認。
- 公開後の応募先クリック率と応募完了率の計測。
