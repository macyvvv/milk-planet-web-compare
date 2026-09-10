# Non Functional Requirements

- 可読性: 主要情報は 1 スクリーン内で役割が判別できる。
- 操作性: リンク、ボタン、カードのクリック領域が十分に大きい。
- 一貫性: 同一種別の要素は同じ見た目とふるまいを持つ。
- 保守性: 店舗追加、イベント追加、更新停止が容易。
- 再現性: デザインルールに従ってページを増やせる。

## 検証可能な受入基準

| ID | 基準 | 確認方法 |
| --- | --- | --- |
| NFR-01 | 390px、768px、1440px前後で主要情報・主要導線が判別でき、意図しない横スクロールがない | ブラウザ実表示と`scrollWidth`確認 |
| NFR-02 | 見出し、リンク、画像`alt`、フォーカス、キーボード操作、コントラストを確認できる | HTML/CSS検査、ブラウザ操作、必要に応じたW3C相当検査 |
| NFR-03 | 原典の価格、注意事項、更新情報、画像の意味に未説明の欠落がない | source map、traceability、独立監査 |
| NFR-04 | 画像主体ページでは、原典容量、実表示幅、候補画像、fallback、`currentSrc`を記録する | 静的確認とブラウザ観測 |
| NFR-05 | 公開URL、アンカー、主要リンク、画像参照が壊れていない | リンク検査、ブラウザ確認、Pages確認 |
| NFR-06 | `currently/`と原典画像メニュー`proposal/branch5/shop/<store>/menu/`を変更せず、HTML化比較実装の変更対象を説明できる | git差分とwork packet |
| NFR-07 | 変更は再実行可能で、変換条件・検証コマンド・未検証範囲が記録されている | retrospective、audit、release記録 |
| NFR-08 | 公開ページは`lang`、固有の`title`、description、canonical、OGPの要否を確認し、対象外理由を記録する | HTML検査、source map、audit |
| NFR-09 | 外部依存、秘密情報、第三者画像・フォントの権利、個人情報入力の有無を確認し、必要な制約を記録する | dependency・asset・privacy review |
| NFR-10 | 公開前に、更新対象のcontent owner、release owner、次回鮮度確認、rollback対象を記録する | decision、release、operations |
| NFR-11 | KPI・実利用者テストを定義できない場合、未確定のまま公開成功や事業効果を主張しない | decision log、retrospective |

数値基準を設定できない項目は、合格を推測せず、観測方法と残存リスクを記録する。

## 適用範囲の明示

- SEO・外部依存・権利・個人情報は、静的ページであっても最小確認を行う。該当しない場合は`NOT APPLICABLE`と理由を記録する。
- KPIと実利用者テストは、事業Ownerと計測方法が確定するまで、このrepoの自動完了条件には含めない。ただし、未計測をRevenueや利用価値の改善実績として報告しない。
- W3C正式検証、RUM、実ネットワーク性能は、実行できない場合に代替確認と残存リスクを記録する。
