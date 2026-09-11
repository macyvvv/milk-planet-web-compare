# Change

Skill改善後に、Planet系メニュー全体と既存変更ページを再監査し、店舗固有性を守る判断原理を再利用可能な証跡へ接続する。

## Viewing situation

FACT: 制作者が複数店舗のページを作成・監査し、単一ページの見た目ではなく、次のページでも判断を再現するために使う。

## Business and human outcome

USER: AIが場当たり的に作った見た目ではなく、利用者の理解・来店判断・注文判断へ接続する設計を再現できる制作基盤を得る。

## Source lock

CONSTRAINT: `proposal/branch5/shop/<store>/menu/index.html`と元画像版を比較正本とし、`menu-html`と既存variantは比較対象として扱う。ページ本体、画像、`currently/`は変更しない。

## Hierarchy

FACT: まず対象範囲・正本・利用状況を確定し、次に情報・視覚・構造の差分を確認し、最後にSkillへ一般化できる原理だけを記録する。

## Commitments

1. USER: 哲学を「装飾」ではなく、目的・根拠・非採用・トレードオフからなる判断原理として記録する。
2. CONSTRAINT: 単一ページの好みを共通ルールへ昇格させず、店舗固有判断と構造的学びを分離する。
3. FACT: 既存変更ページを未変更の比較基準と同じ監査へ含め、過去の判断の回帰を確認する。

## Deliberate exclusions

CONSTRAINT: `menu/index.html`、元画像、公開URL、既存legacy packet、未追跡PPTX、PR、push、merge、publishは変更・実行しない。

## Tradeoffs and unknowns

INFERENCE: validatorを強化すると証跡欠落は早期検出できるが、哲学的妥当性や店舗固有性の判断は自動化できない。

## Principle under test

USER: 状況に根ざした判断、明示的な非採用、引き受けたトレードオフを保存すれば、AI的な均一化を避けながら別ページへ再利用できる。

## No-change option

FACT: 現行Skillsのまま監査を続ける案も可能だが、今回確認された対象漏れ、404、DOM補正依存、既存変更ページの回帰を共通ゲートへ接続できないため採用しない。

## Transfer boundary

STRUCTURAL: 対象Coverage、resource integrity、独立監査、LOCAL / STRUCTURAL / UNKNOWN分類は複数ページへ転用する。

LOCAL: 店舗色、画像の役割、固有の改行、残す密度は店舗ごとに再判定する。

UNKNOWN: 原典更新の責任者、実際の事業KPI、正式なW3C実行環境はこの作業だけでは確定しない。
