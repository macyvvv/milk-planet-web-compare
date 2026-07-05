# GitHub Pages Deploy

## 想定構成
- `index.html`: comparison entry
- `clone/`: currently の静的複製
- `proposal/`: 改修案モック
- `basis/`: 設計メモ

## 配置方法
1. このリポジトリを GitHub に push する
2. GitHub Pages の公開元を `main` ブランチの root にする
3. もしくは `docs/` へ移したうえで公開する

## 公開後の確認
- `/` で左右比較が出ること
- `clone/milk-planet.com/index.html` が開くこと
- `proposal/index.html` が開くこと

## 注意
- 外部CDNへの依存は残っている
- Instagram/TikTok の一部は完全静的再現ではない
- 必要なら次段で画像を最適化し、オフライン寄りにする
