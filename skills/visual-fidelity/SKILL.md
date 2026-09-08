---
name: visual-fidelity
description: Reconstruct and review milk planet pages against Branch5 source pages while preventing generic or AI-generated-looking UI. Use for menu HTML work, visual polish, tone-and-manner checks, and screenshot-based regression review.
---

# milk planet visual fidelity

このrepoの既存ページを改修するときは、ルートの`DESIGN.md`を視覚的な正本として扱い、`agents/22_VISUAL_FIDELITY_REVIEWER.md`のレビュー手順を実行する。

新しいビジュアル方向や大幅な再構成では、実装前に`skills/design-intent/SKILL.md`を通す。`design-intent`が定義した意図・証拠・トレードオフを、実装後に都合よく書き換えない。このSkillは、意図を生成するのではなく、意図が画面に保持されたかを確認する。

## Routing

- 既存ページの見た目を記録・抽出する場合: `DESIGN.md`と対象店舗の元画像版を先に読む。
- HTML/CSSを変更する場合: 元画像版、HTML版、店舗固有CSS、共有CSSを比較してから編集する。
- 見た目の確認を求められた場合: ブラウザで390px、768px、1440px前後を確認し、対象・幅・観測結果を報告する。
- 新規ビジュアルを生成する場合: 原版に相当する素材がないか確認する。店舗ロゴやメニュー画像を`imagegen`で作り直さない。

## Hard constraints

1. 元画像版と既存サイトをHTML版より優先する。
2. 元画像にないコピー、見出し、装飾、機能を追加しない。
3. 全店舗へ同じカード、角丸、淡色、列数を機械的に適用しない。
4. 色、余白、折返し、画像比率は店舗ごとの観測結果を優先する。
5. 共有CSSは意味構造、基本レスポンシブ、フォーカス、アクセシビリティに限定し、店舗固有の造形は`system.css`へ置く。
6. 見た目の「きれいさ」ではなく、元ページとの差分とユーザー影響で修正の優先度を決める。

## Implementation loop

1. `design-intent`のViewing situation、Hierarchy、Evidence Ledgerと変更対象を照合する。
2. 比較元を`DESIGN.md`、元画像版、隣接ページ、必要に応じて`currently/`へ照合する。
3. 情報量・文言・順序・改行を確認する。
4. 店舗固有CSSを優先し、共通CSSへの変更は複数店舗に共通する欠陥だけに限定する。
5. ブラウザ表示を確認し、白帯、枠外文字列、左寄せ、語中分断、ロゴ縮小を探す。
6. アクセシビリティ（見出し、alt、フォーカス、コントラスト、キーボード）を確認する。
7. 意図のないスキン変更、根拠のない装飾、共通部品による店舗固有性の消失を確認する。
8. `agents/99_DESIGN_REVIEWER.md`へ採用・保留・却下とDone条件を渡す。
9. `basis/decision_log.md`へ、元ページを根拠にした店舗固有判断だけを記録する。

## Completion gate

変更は、次を満たすまで完了扱いにしない。

- 元画像版との情報差分が説明できる
- 店舗固有の表現が共通テンプレートに埋没していない
- 主要幅で横スクロール、欠落、不要な白帯、画像配置の欠陥がない
- 見出しと改行が意味構造に一致している
- ブラウザ確認を実施したか、できなかった理由を明記している
- 自動テストだけで「デザインが正しい」と判断していない
- 実装前の意図・証拠・トレードオフが実装後も追跡できる
- CSSのスキン変更だけで方向性を成立させた場合、その制約と理由が明記されている
- 根拠のない「人間らしさ」や手作り感を追加していない
