# Retrospective

## Observed event

実ブラウザで、CSSの標準番号が残る応募ステップを追加検出した。静的なクラス存在確認だけでは、`ol`の既定マーカーまでは検出できなかった。

## Detection phase

Check。

## Missed gate or cause

CSSクラスの存在確認を先行し、標準要素の既定スタイルを含むスクリーンショット確認を後段にしていた。

## Generalizable rule

- CSSクラスの存在だけでなく、実DOMのcomputed styleとスクリーンショットを同じゲートで確認する。
- 固定タイトルとスムーススクロールは、縮小前後のレイアウト計算を分けずに監査する。
- 表示用数値は原稿の意味を変えず、4桁以上だけを3桁区切りへ整形する。

## Skill or validator change

採用ページの監査では、`ol` / `ul`の標準マーカー、computed style、実幅スクリーンショットを必須確認とする。今回のルールは複数ページで再発するまでSkill本体へ昇格しない。

## Follow-up

- 390 / 768 / 1440pxの実幅スクリーンショット確認。
- 共有アンカーを持つ他ページの回帰確認。
