# Decision

Change class: PHILOSOPHY_LEARNING

## Scope

- `proposal/branch5/recruit/index.html`の情報構造、応募導線、エリア選択UIを改修する。
- `proposal/branch5/recruit/recruit.css`をページ専用の保守可能なCSSへ整理する。
- 既存の募集文言、数値、応募先URL、画像を保持する。
- `currently/recruit/`と既存画像ファイルは対象外。

## Target files

- `proposal/branch5/recruit/index.html`
- `proposal/branch5/recruit/recruit.css`
- `basis/work/20260912-recruit-page-redesign/*`

## State

State: IMPLEMENTED

## Gate status

- Source lock: PASS — currentlyとproposalのHTML/CSS/画像を比較済み。
- Content and task: PASS — 募集条件、リンク、エリア別情報を抽出済み。
- Structure: PASS — 導入→職種条件→応募手順→エリア→応募先の順を決定。
- Intent: PASS — 既存資産、非採用、トレードオフ、Unknownをintentへ記録。
- Independent audit: PASS — 静的・既定ブラウザ・操作監査はPASS。指定viewportの実幅検証はChrome拡張の制約で未完了としてaudit.mdへ残した。
- Release: NOT RUN — 実装・検証後にcommit/push/PR/merge/publishを確認する。

## Philosophy gate

- Principle under test: 美しさを装飾量ではなく、応募判断に必要な情報の階層と操作の明瞭さとして設計する。
- Priority: 応募条件と応募開始への到達性を最優先し、既存の店舗固有画像と色調を保持する。
- Preserved asymmetry: ピンクの雲形タイトル、店舗画像の地域別差、既存LINE/X/メール画像を残す。
- No-change option: 現状維持は表組み、空白依存、非アクセシブルな選択UI、初期転送量の問題を残すため不採用。
- Transfer boundary: 情報階層、CTAの明示、ラジオ選択のアクセシビリティはSTRUCTURAL。色、画像の使い方、東京既定選択はLOCALまたはUNKNOWN。
- Unknown: 応募率、東京を既定にする妥当性、原稿の最新性、応募先URLの運用Owner。

## Coverage

- Target page: `proposal/branch5/recruit/index.html`
- Comparison source: `currently/recruit/index.html`、`currently/recruit/recruit.css`
- Shared consumer: `proposal/branch5/proposal.css`と`navigation.css`のナビ・タイトル規則。
- Assets: recruit配下の店舗画像、LINE、メール、X画像。

## Definition of done

- 既存の募集情報・応募先を欠落させず、導線が導入→条件→エリア→連絡先の順に理解できる。
- 職種条件が表組み依存でなく、モバイルでも読みやすい。
- エリア選択がマウス・キーボードで操作でき、選択地域以外のパネルが支援技術から隠れる。
- 既存応募先リンクが44px以上の操作領域で判別できる。
- 390 / 768 / 1440pxで横スクロール、画像崩れ、タイトル・ナビ崩れがない。
- static contract、repo contract、work packet、ブラウザ監査がPASSする。

## Parking lot

- 店舗責任者による募集条件・応募先URLの校正。
- 東京既定選択の事業判断。
- 応募率、エリア別クリック率、問い合わせ完了率の計測。
