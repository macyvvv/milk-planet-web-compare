---
name: design-intent
description: Define and test the situated purpose, business outcome, source evidence, deliberate exclusions, and tradeoffs for a visual deliverable before implementation. Use when a new visual direction or substantial redesign is being considered; do not use for post-render pixel review alone.
---

# milk planet design intent

このSkillは、AIが不足した文脈を「それらしいスタイル」で埋めることを防ぐための実装前工程である。AIらしさを隠すための装飾や、手作り感を演出するための不規則さを生成してはならない。人間の経験や動機を捏造せず、観測できる事実・ユーザーの明示的な意図・事業上の制約から、採用できる判断だけを作る。

## When to use

- 新しいページ、ビジュアル案、店舗固有の方向性を作る前
- 既存のHTML/CSSを大きく組み替える前
- 「モダン」「洗練」「雰囲気を出す」など、抽象的な依頼を実装へ変換する前
- 既存案が汎用テンプレートや単なるスキン変更へ収束しているか疑うとき

既存の表示欠陥を直すだけで視覚方針が変わらない場合は、`visual-fidelity`へ直接進んでよい。ただし、方針変更を途中で発見したら本Skillへ戻る。

## Intent gate

実装前に、次の内容を短いIntent Memoとして確定する。抽象語だけで埋めず、各判断を`FACT`（観測事実）、`USER`（明示要求）、`CONSTRAINT`（仕様・制約）、`INFERENCE`（推論）、`UNKNOWN`（不明）に分ける。

1. **Viewing situation**: 誰が、何を知りたい状態で、どの環境で見るか。
2. **Business and human outcome**: 何を理解し、何を感じ、次に何をしてほしいか。Revenueまたは来店・応募・問い合わせ等の行動へ接続する。
3. **Source evidence**: 元画像、隣接ページ、既存文言、店舗資産、ユーザー指示から、方向性を拘束する具体的な証拠を列挙する。
4. **Hierarchy**: 最初に見る情報、次に理解する関係、最後に取る行動を決める。
5. **Commitments**: 採用する重要な視覚判断を最大3つに絞り、各判断に証拠とユーザー影響を対応付ける。
6. **Deliberate exclusions**: 使わない装飾、直さない不均衡、残す独特な表現を明記する。何も変えないことも有効な判断とする。
7. **Tradeoffs and unknowns**: 読みやすさ、速度、原版の密度、店舗らしさ、更新性などの衝突と、確認できていない前提を記録する。

## Evidence ledger

主要な判断は、次の4列で追跡できる状態にする。

| Decision | Evidence | Intended effect | Cost / risk |
| --- | --- | --- | --- |
| 何を変えるか | FACT / USER / CONSTRAINTの参照 | ユーザー・事業への効果 | 何を失うか、不明点は何か |

`INFERENCE`だけで装飾を追加してはならない。根拠が足りない場合は`UNKNOWN`として保留し、確認なしで実装しない。

## Anti-generic tests

- **Swap test**: 店名と色だけを別店舗へ差し替えて成立するなら、店舗固有の判断が不足していないか再確認する。
- **Skin test**: HTML構造を変えずCSSだけを差し替える場合、それが意図した制約なのか、単なる雰囲気適用なのかを明記する。
- **Evidence removal test**: その装飾の根拠を元資料から外したとき、残す理由があるか確認する。理由がなければ削除または保留する。
- **No-fix test**: 原版の崩れや不均衡を直すことで、何の価値が増え、何の個性が失われるかを説明できるか確認する。

不規則さ、ノイズ、手書き風の崩しを「人間らしさ」の証拠として追加してはならない。根拠のある不均衡だけを残す。

## Stop conditions

次の場合は完成品を推測で出さず、`保留`として不足情報を示す。

- Viewer/Userや最終行動が不明
- 元資料と既存ページのどちらを正本にするか決まっていない
- 重要な視覚判断が`INFERENCE`しか持たない
- 店舗固有性と共通基盤の境界を説明できない
- 変更の効果と犠牲が評価できない

## Handoff to visual-fidelity

Intent MemoとEvidence Ledgerを確定した後、`visual-fidelity`へ渡す。`visual-fidelity`はその意図が実装で保たれたか、元資料との差分、表示品質、アクセシビリティを検証する。理由を実装後に作り直してはならない。

## Completion gate

- Viewing situation、Business and human outcome、Hierarchyが明記されている
- 重要な判断が元資料・ユーザー指示・制約のいずれかへ追跡できる
- 意図的に使わないもの、直さないもの、保留するものが明記されている
- 少なくとも1つのトレードオフが明記されている
- 根拠のない装飾や、捏造した人間の動機を実装していない
- `visual-fidelity`へ渡す差分・残存リスクが定義されている
