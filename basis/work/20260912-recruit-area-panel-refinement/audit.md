# Independent audit

## Compared sources

- `currently/recruit/`を参照し、店舗画像、ラベル、応募先URLが保持されていることを確認した。
- 東京・大阪の共通連絡先と福岡の店舗別連絡先の違いを比較した。

## Viewports

390px、768px、1440pxで確認し、横溢れと画像の固定1,080px高が解消されたことを確認した。

- 390px: 画像317×178px、東京パネル約1,239px
- 768px: 画像340×192px、東京パネル約638px
- 1440px: 画像490×276px、東京パネル約831px

## Static checks

- `python3 tools/validate_static_contract.py proposal/branch5/recruit`: PASS
- `python3 tools/validate_repo_contract.py`: PASS
- `git diff --check`: PASS
- 福岡の店舗カード: 2件、対応連絡先: 2件

## Browser observations

- 東京・大阪・福岡のエリア切替が動作する。
- 店舗画像が表示幅に応じた16:9で表示される。
- 福岡は各画像の直下に対応する連絡先が表示される。
- 390px / 768px / 1440pxで横スクロールが発生しない。
- 390pxの福岡パネルは2店舗カード・2連絡先で構成され、各画像直下に対応CTAがある。

## Accessibility and content checks

- 既存の画像alt、連絡先URL、ラベルを保持した。
- エリア選択のラジオ・hidden状態を変更していない。
- 店舗画像と連絡先を同一articleへまとめ、対応関係を構造化した。

## Findings

- STRUCTURAL: HTMLの画像・連絡先対応を店舗単位へ整理した。
- LOCAL: 画像の高さ、カード余白、レスポンシブ列数を調整した。

## Residual risks

- 募集条件・応募先URLの鮮度と応募率は運用確認事項として残る。
