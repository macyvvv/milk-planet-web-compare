# Retrospective

## Observed event

実ブラウザの小幅表示で、画像がHTML属性の1,080px高のまま残り、エリアパネルが過度に縦長になることを確認した。

## Detection phase

Observe / Check。

## Missed gate or cause

既定のデスクトップ幅では画像の縦長化が目立たず、指定幅での実効高さ確認が不足していた。

## Generalizable rule

レスポンシブ画像はwidthだけでなくcomputed heightと、親コンテナの総高さを確認する。複数の連絡先がある場合は、画像と連絡先の対応をDOM構造でも表現する。

## Skill or validator change

エリア切替UIの監査項目に、各画像のcomputed height、パネル総高さ、画像・CTAの対応関係を追加する。複数ページで再発するまでSkill本体へ昇格しない。

## Follow-up

- 公開後に店舗別の応募先クリック率を確認する。
