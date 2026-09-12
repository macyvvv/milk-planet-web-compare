# Retrospective

## Observed event

FACT: 新宿店のCTAが画面中央の継ぎ目に浮き、縦積みと無効なpaddingにより小さく見えていた。同じ旧構造が他店舗にも複製されていた。実装後は2導線を横並び、1導線を中央配置し、44px操作領域へ統一した。

## Detection phase

FACT: Observeで新宿の実表示とCSSを確認し、Orientで11店舗のCTA数とmarkup差分を分類した。Decisionで2リンク／1リンクの可変構造へ方針を変更し、Actで実装した。Checkでは静的validator、代表ブラウザ幅、スクリーンショット、非独立の順次レビューを完了した。

## Missed gate or cause

FACT: 店舗ごとのCTA有無を考慮せず、同じ入れ子構造、手動改行、無効なpaddingを複製していた。単一ページの美的評価だけでは、空ラッパーと1リンク店舗の下部余白を横断検出できなかった。今回の構造走査で11店舗の差分を先に分類した。

## Generalizable rule

STRUCTURAL: 複数ページへUIを展開する場合、共通化対象を「見た目」ではなく、実在する導線数に対応できる意味構造として定義し、空状態を含むconsumer matrixを先に作る。

LOCAL: 店舗ごとのCTA数、リンク先、色、ロゴ、背景は個別判断として保持する。

## Principle update

STRUCTURAL候補: 可変数のCTAコンテナは、1件時の中央配置と複数件時の並列配置を同じ構造で表現できることを完了条件に含める。

UNKNOWN: 将来のキャスト導線追加時に、ページ原稿と運用OwnerがどのタイミングでHTMLへ反映するかは未確定。

## Skill or validator change

PASS: 今回の再発は店舗トップCTAの複製構造に固有であり、新規validatorを追加せず、作業パケットと既存validatorによる再現可能な検証で足りると判断した。

## Follow-up

実装後の非独立ブラウザ監査で、代表2店舗・390 / 768 / 1440pxのCTA位置、操作領域、店舗固有性、共有consumerの非波及を確認した。全11店舗は静的構造検査で補完した。別担当者による独立監査は今後の残課題。
