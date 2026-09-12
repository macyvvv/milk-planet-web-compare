# Decision

Change class: PHILOSOPHY_LEARNING

## Scope

Branch5の店舗トップ11ページについて、店舗情報下の旧CTA構造を有効なリンク数に応じた`.shop-actions`へ正規化する。画像、メニュー原典、currently、外部URLの内容は変更しない。

## Target files

- `proposal/branch5/proposal.css`
- `proposal/branch5/shop/*/index.html`（11店舗）
- `proposal/branch5/shop/*/style.css`（11店舗の旧`.button`ルール整理）
- `basis/work/2026-09-12-shop-actions-normalization/*`
- `basis/decision_log.md`

## State

State: IMPLEMENTED

## Gate status

- Source lock: PASS — 11店舗の同等ページ、既存CTA、店舗固有CSS、DESIGN.mdを確認
- Content and task: PASS — 有効リンクの文言・href・店舗別CTA数を保持
- Structure: PASS — 入れ子div、空ラッパー、装飾目的の連続`<br>`を除去
- Intent: PASS — 共通化の範囲をCTA構造へ限定し、店舗固有表現を保持
- Independent audit: NOT RUN — `agents/22_VISUAL_FIDELITY_REVIEWER.md`と`skills/visual-fidelity`の観点による非独立監査はPASS。別担当者による独立監査は未実施
- Release: NOT RUN — commit / push / PR / merge / publishは今回のScope外

## Philosophy gate

- Principle under test: 有効な次行動の数に応じたCTA配置は、店舗固有性を消さずに複数ページへ転用できるか
- No-change option: 現状の縦積み・小さい操作領域・空ラッパーを維持する案は不採用
- Preserved asymmetry: 店舗ごとのCTA数、色、ロゴ、背景、情報密度、コメントアウト状態
- Transfer boundary: レイアウトと操作領域はSTRUCTURAL、CTA数・リンク先・店舗表現はLOCAL
- Unknown: コメントアウト導線の将来運用、外部ウィジェット完了状態

## Coverage

対象ページ: bloody、chocolat、cybarbkk、cybarbkk2、cybarlaos、cybarshinjuku、melty、roysuga、shandy、shinjuku、tweeny。

比較基準: 各店舗の旧店舗トップ、Branch5の店舗固有CSS、DESIGN.md、system_spec.md。

共有consumer: `proposal.css`を読むBranch5ページ群。新規selectorは`.shop-actions`配下へ限定する。

## Definition of done

- 11店舗で有効なCTAだけが表示される
- 2リンク店舗は横並び、1リンク店舗は中央配置される
- CTAの実表示高さが44px以上で、paddingが有効な単位を持つ
- 390px / 768px / 1440pxで横溢れ・重なり・不自然な折返しがない
- 店舗色、ロゴ、背景、地図、リンク先、文言が保持される
- 静的validator、HTML/CSS差分、ブラウザ観測、独立レビューが記録される

## Parking lot

- コメントアウトされたキャスト導線の運用方針
- 旧店舗トップ全体のHTML5/W3C相当検証
- 外部イベント・SNSウィジェットのロード完了を含む公開後監視
