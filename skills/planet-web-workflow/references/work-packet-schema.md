# Planet web work packet schema

`basis/work/<change-id>/`に置く作業証跡の最小構成。文章の美しさではなく、次の担当者が判断を再現できることを目的にする。

## `intent.md`

必須見出し:

- `# Change`
- `## Viewing situation`
- `## Business and human outcome`
- `## Source lock`
- `## Hierarchy`
- `## Commitments`
- `## Deliberate exclusions`
- `## Tradeoffs and unknowns`

各判断は`FACT`、`USER`、`CONSTRAINT`、`INFERENCE`、`UNKNOWN`のいずれかで始める。推論だけの主要判断は採用しない。

## `source-map.md`

原典の意味のある要素を表で管理する。

| Source | Content | Role | Treatment | Canonical | Evidence / risk |
| --- | --- | --- | --- | --- | --- |
| `menu1.jpg` | 歓迎ビジュアル | hero | source-derived crop | image | 境界を確認 |

`Treatment`は`HTML化`、`画像として保持`、`リンク・別導線へ移動`、`意図的除外`のいずれかにする。

## `decision.md`

必須見出し:

- `# Decision`
- `## Scope`
- `## Target files`
- `## State`
- `## Gate status`
- `## Definition of done`
- `## Parking lot`

`State`は`PLANNED`、`OBSERVED`、`ORIENTED`、`DECIDED`、`IMPLEMENTED`、`AUDITED`、`LEARNED`、`RELEASED`のいずれか。`Gate status`には、`Source lock`、`Content and task`、`Structure`、`Intent`、`Independent audit`、`Release`を1行ずつ記録し、各行に`PASS`、`FAIL`、`NOT RUN`のいずれかと理由を持たせる。`DECIDED` / `IMPLEMENTED`では実装前4ゲート、`AUDITED` / `LEARNED`ではそれらに加えて`Independent audit`、`RELEASED`では6ゲートすべてを`PASS`にする。

## `audit.md`

必須見出し:

- `# Independent audit`
- `## Compared sources`
- `## Viewports`
- `## Static checks`
- `## Browser observations`
- `## Accessibility and content checks`
- `## Findings`
- `## Residual risks`

スクリーンショットは好みの証明ではなく、観測事実の証拠として扱う。未実施の検査は`NOT RUN`と理由を書く。

## `retrospective.md`

必須見出し:

- `# Retrospective`
- `## Observed event`
- `## Detection phase`
- `## Missed gate or cause`
- `## Generalizable rule`
- `## Skill or validator change`
- `## Follow-up`

今回だけの判断と、再利用可能なルールを分ける。

## `release.md`

必須見出し:

- `# Release verification`
- `## Commit`
- `## Push`
- `## Pull request`
- `## Merge`
- `## Published URL`

各節に`Status:`、識別子またはURL、確認日時、確認者を記録する。未依頼の外部操作は`NOT REQUESTED`とする。節の件数ではなく、各見出しの直下にStatusがあることを検証する。

`RELEASED`へ進める場合は、`Merge`が`MERGED`、`Published URL`が`VERIFIED`であることを確認する。PRが作成されただけ、またはローカルcommitがあるだけでは`RELEASED`にしない。

### Operational record for new packets

新規packetでは、`release.md`に次の記録を追加する。

```text
## Ownership and freshness
Content owner: <role or UNKNOWN>
Visual reviewer: <role or UNKNOWN>
Release owner: <role or UNKNOWN>
Next freshness review: <date or UNKNOWN>
Rollback target: <commit or asset reference>
External dependency / rights review: PASS / NOT APPLICABLE / UNKNOWN
```

`UNKNOWN`を実在のOwnerや承認の代わりに使ってはならない。公開を伴う新規変更でOwner、次回確認、rollback対象が`UNKNOWN`の場合は、公開前に停止して再計画する。既存packetは導入前のlegacy証跡として保持し、過去の外部状態を改変しない。
