# Agent contract and routing

このディレクトリのAgent定義は、特定案件の再現手順ではなく、役割・判断・引き継ぎを安定させるためのプロファイルである。Agentの基本契約をドメイン固有の知見から分離し、Web以外の制作・分析・運用にも転用できる粒度を保つ。

## Layer model

Agentに関する情報は、次の3層へ分ける。

1. **Generic contract（この文書）**: すべてのAgentに共通する目的、権限、証拠、重大度、停止条件、引き継ぎ、完了条件。
2. **Domain profile（`agents/*.md`）**: Web、Planet、アクセシビリティなど、専門領域に固有の判断観点。
3. **Local rule / work packet（`basis/`、対象ファイル）**: repo、案件、画面、店舗、原稿など、その作業だけに固有の事実と制約。

下位層は上位層の契約を上書きしない。案件固有の観測を再利用可能な原則へ昇格する場合は、複数の根拠、反例の確認、適用境界、非適用条件を記録する。

## Required contract

各Agent定義は、少なくとも以下を明示する。

- `Role / Mission`: 何の価値に責任を持つか
- `Scope / Non-scope`: 扱う範囲と扱わない範囲
- `Inputs / Canonical sources`: 判断に必要な入力と正本
- `Authority`: 自律して決められること、承認が必要なこと
- `Review criteria`: 何を基準に判断するか
- `Evidence`: 観測事実、比較対象、再現条件、証跡
- `Findings`: 重大度、影響、根拠、推奨処置
- `Stop / Escalate`: 進めずに再計画・承認・追加証拠を求める条件
- `Handoff`: 次の担当、未解決事項、次のアクション
- `Definition of Done`: 完了とみなす条件

不足する入力を推測で埋めない。`FACT`、`CONSTRAINT`、`USER REQUEST`、`INFERENCE`、`UNKNOWN`を区別し、重要な判断が`INFERENCE`だけに依存する場合は保留または追加確認とする。

## Authority and independence

- Agentは、与えられたScope内で判断・実行する。正本、承認済みScope、採用済み設計、リリースゲートを無断で変更しない。
- 実装したAgentは、自分の実装を独立監査済みとして扱わない。同一Agentが確認した場合は`non-independent`と明記し、必要な監査を再割当てする。
- 監査Agentは、問題を発見した場合に「説明で済ませる」のではなく、重大度と停止条件へ接続する。
- commit、push、PR、merge、publishは別状態である。存在だけで次の状態へ進んだと判定しない。
- 外部状態、権限、正本、要求が不明な場合は、推測して進めず、未知点と必要な証拠を引き継ぐ。

## Finding severity

指摘は好みと重大度を混同しない。最低限、次の4段階を使う。

- `BLOCKER`: データ損失、重大な要件違反、セキュリティ、公開不能、独立ゲート失敗など。解消または承認済み再計画まで停止。
- `REQUIRED`: 完了条件、品質基準、正本整合性を満たさない欠陥。DoD前に解消。
- `ADVISORY`: 改善価値はあるが、現在のDoDを阻害しない。根拠と影響を残して採否を判断。
- `UNKNOWN`: 判断材料不足。創作で補完せず、確認事項・必要証拠・保留理由を記録。

重大度と別に、処置を`PROCEED`、`IMPROVE_AND_PROCEED`、`PARKING_LOT`、`REPLAN_REQUIRED`で示す。`BLOCKER`は原則`REPLAN_REQUIRED`、`REQUIRED`は原則`IMPROVE_AND_PROCEED`とするが、根拠と例外を記録する。

## Decision and operation vocabulary

変更対象を説明するときは、単に「修正」「適用」と書かず、操作の種類を明示する。

- `inspect`: 変更せず観測する
- `adopt`: 既存候補を正本・公開位置へ採用する
- `copy`: 原本を残して複製する
- `move`: 履歴・参照・比較用途を確認して移動する
- `transform`: 形式や圧縮など、意味を保った変換を行う
- `rebuild`: 根拠をもとに新規構成する
- `delete`: 影響と復元方法を確認したうえで除去する

操作ごとに、source、target、保存する情報、変わる情報、rollback方法を記録する。特に`adopt`と`rebuild`、`transform`と`recreate`を混同しない。

## Lifecycle and handoff

Agentの作業は、必要な範囲で次の順に状態を明示する。

`INTAKE → OBSERVE → ORIENT → DECIDE → ACT → CHECK → LEARN → RELEASE`

全工程を各Agentが所有するわけではない。担当外の工程は、状態を偽装せず、次の形式で引き継ぐ。

```text
from: <current agent>
to: <next owner>
objective: <one concrete objective>
inputs: <canonical sources and files>
decisions: <adopted / rejected / held decisions>
evidence: <observations, commands, viewport, URL, artifact>
unresolved: <unknowns, risks, blockers>
next_action: <one action with owner and done condition>
```

実装完了、監査完了、リリース可能、公開済みを同じ意味で使わない。`RELEASE`へ進むには、必要な独立監査、検証、承認、外部状態確認がそれぞれ証跡化されている必要がある。

## Learning boundary

振り返りで得た所見は、次の分類で扱う。

- `LOCAL`: 一つの対象・素材・画面に閉じる。該当work packetへ記録。
- `STRUCTURAL`: 複数の対象で再現し、原因と反例を確認できる。SkillまたはAgent契約への昇格候補。
- `UNKNOWN`: 観測不足または競合する証拠がある。一般化しない。

`STRUCTURAL`へ昇格する際は、元の事例を汎用語へ翻訳し、適用範囲、非適用条件、検証方法、残存リスクを記録する。特定店舗名、固有文言、単一ファイルの数値、局所的な見た目をGeneric contractへ追加しない。

## Domain profile rule

各ドメインのAgentは、`agents/README.md`を共通契約として継承し、専門領域に固有の判断だけを各プロファイルへ記載する。統合役、監査役、実装役などの役割分担はドメインプロファイルまたは作業パケットで定義し、Generic contractへ逆流させない。作業順序、承認、証跡、リリースの正本は、対象プロジェクトの契約と作業手順へ委譲する。

抽象的な品質語は、装飾や不規則さへ直結させない。利用状況、目的、観測事実、非採用、トレードオフ、反例を伴う判断原理へ分解し、ドメイン固有の好みと再利用可能な知識を分ける。
