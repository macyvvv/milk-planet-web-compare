# Change

このチャットから、Planet系サイト制作を反復可能にするOODA / PDCA親Skillを作成する。

## Viewing situation

- USER: Planet系サイトを継続的に改修・監査するCodex利用者
- 状態: ページの見た目ではなく、判断・監査・学習・リリースの手順を再利用したい
- 環境: 静的HTML/CSS、原典画像、GitHub Pages、CodexのSkillとrepo契約

## Business and human outcome

- USER: 店舗固有性を失わず、AIが一般化したページを繰り返し生成するリスクを下げたい
- INFERENCE: 原典の情報欠落、重複、視認性欠陥、リリース状態の混乱を早期に検出できれば、来店・料金確認の信頼性と制作効率が上がる

## Source lock

- FACT: `skills/design-intent/SKILL.md`は実装前の意図固定を担当する
- FACT: `skills/visual-fidelity/SKILL.md`は実装後の視覚監査を担当する
- USER: この会話の失敗と発見を再利用可能なシャーシへ変換する
- FACT: Shandyのスキン化、ヒーロー境界、HTMLとの文字重複、新宿`event1.jpg`の情報欠落、merge状態の混乱が発生した

## Hierarchy

1. 正本と作業範囲を確定する
2. 原典の意味のある情報と利用者の最初の行動を整理する
3. 実装前の意図を固定する
4. 実装後に独立監査する
5. 失敗をSkill・validator・判断ログへ戻す
6. commit、push、PR、merge、publishを個別に確認する

## Commitments

1. OODA / PDCAを状態と証跡に分け、作業パケットで再実行可能にする
2. `design-intent`と`visual-fidelity`の責務を親Skillから順序づける
3. 今回の失敗を一般化し、次回のContent、Audit、Releaseゲートへ接続する

## Deliberate exclusions

- サイト本体のHTML/CSSは変更しない
- AIらしさを隠すためのノイズ、不規則さ、装飾は追加しない
- 事業KPIを推測で設定しない
- すべてのPlanetページを一度に再監査しない

## Tradeoffs and unknowns

- CONSTRAINT: 証跡を増やすほど作業負荷は上がるが、同じ失敗の再発確認には必要
- UNKNOWN: 料金確認、予約、応募などの定量KPIと目標値は未定義
- UNKNOWN: 別店舗・別ページで親Skillが同じ精度で機能するかは未検証
