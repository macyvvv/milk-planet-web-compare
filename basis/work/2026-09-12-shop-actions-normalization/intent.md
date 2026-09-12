# Change

店舗トップ11ページの下部CTAを、利用可能な導線数に応じて可変配置へ正規化する。

## Viewing situation

FACT: 初見来訪者または再訪者が、PC・スマートフォンで店舗情報を確認した後、キャスト一覧またはメニューへ進む。

## Business and human outcome

USER: 店舗の来店判断に必要な情報を確認した後、次の行動を迷わず選べるようにする。

CONSTRAINT: 既存のリンク先・文言・店舗固有の色、ロゴ、地図、背景、情報量は維持する。

## Source lock

CONSTRAINT: `proposal/branch5/shop/*/index.html`を対象とし、同一ページの既存HTML/CSS、`DESIGN.md`、`basis/system_spec.md`、`basis/policy.md`を根拠とする。

FACT: 11店舗すべてにメニュー導線がある。メイド一覧導線が有効なのはchocolat、Royal Sugar、ShandyLove、新宿の4店舗で、残り7店舗はメニューのみである。

## Hierarchy

FACT: 店舗識別、住所・営業時間・設備などの確認を先に置き、その後の関連導線をひとまとまりのCTAとして提示する。

## Commitments

1. STRUCTURAL: CTAは1リンクまたは2リンクの実在する導線だけを含み、1リンクは中央、2リンクは横並びを基本とする。
2. STRUCTURAL: 操作領域を最低44px程度にし、手動`<br>`と空ラッパーによる余白を廃止する。
3. LOCAL: 店舗色、ロゴ、背景、地図、情報文言、メイド一覧リンクの有無は店舗ごとの既存状態を維持する。

## Deliberate exclusions

CONSTRAINT: コメントアウトされたメイド一覧リンクは再有効化しない。新しい見出し、説明文、アイコン、外部依存、店舗固有表現の共通化は追加しない。

## Tradeoffs and unknowns

INFERENCE: CTAの横並び化と空白削減は到達性と視線誘導を改善する一方、原版の縦方向の不均衡は変更される。

UNKNOWN: コメントアウトされたキャスト導線の再開時期と運用責任はこの変更では確定しない。

## Principle under test

STRUCTURAL: 共通化するのは「有効な導線数に応じた配置、十分な操作領域、意味構造」であり、店舗固有のスキンやCTAの存在そのものではない。

## No-change option

FACT: 現状維持なら比較正本との差分は増えないが、無効なpadding、22px程度の操作領域、空ラッパー、過大な余白が残るため不採用とする。

## Transfer boundary

STRUCTURAL: `.shop-actions`のレイアウト、サイズ、フォーカス表示、1/2リンクの可変配置は11店舗へ適用する。

LOCAL: CTAの数、リンク先、店舗色、ロゴ、背景、情報密度は店舗ごとに保持する。

UNKNOWN: 未確認の店舗固有CSSが将来CTAの形状を上書きする可能性は、実装後の全幅ブラウザ確認で判定する。
