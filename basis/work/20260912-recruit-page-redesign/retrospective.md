# Retrospective

## Observed event

採用情報は存在するが、表組み、空白用のinline style、画像CTA、地域別表示が別々の責務として積み重なっていた。実装後のブラウザ監査では、ページ専用CSSが共有ナビを上書きしていたことを検出し、共通ナビをcanonical ownerへ戻してから監査を継続した。

## Detection phase

Observe / Orient。

## Missed gate or cause

採用ページを既存レイアウトの継承として扱い、応募判断の情報階層とアクセシビリティをページ単位で固定する工程が不足していた。

## Generalizable rule

採用・問い合わせページでは、条件、選択、連絡先を同じ導線モデルで監査し、非表示状態が支援技術にも反映されることを完了条件に含める。

## Skill or validator change

単一ページ固有の色・カード・画像配置はLOCALに留める。一方、採用・問い合わせページで条件、選択、連絡先を同じ導線モデルで監査し、非表示状態を支援技術へ反映する規則はSTRUCTURAL候補としてwork packetへ保存する。複数ページで再発するまでSkillへ昇格しない。

## Follow-up

応募率と応募先クリック率の計測設計をParking lotへ残す。

## Principle update

既存の視覚言語を保ちながら、応募判断の情報階層を第一評価軸とする方針を確認した。実装後に共通CSSの責務を越えないことを必須の監査項目へ追加する。
