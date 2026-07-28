# シフト管理システム(branch101)

設計正本は [`../basis/`](../basis/README.md)。実装で判断に迷ったら、まず `basis/requirements.md`
の該当REQ-ID、`basis/data_model.md`、`basis/decision_log.md` を確認すること。

## セットアップ

```bash
npm install
cp .env.example .env   # DATABASE_URL を実際のPostgres接続文字列に置き換える
npx prisma generate
npx prisma migrate dev --name init   # DBへ初回マイグレーションを適用
npm run dev
```

`DATABASE_URL` が無い状態でも `npm run dev` 自体は起動する(認証UIは表示される)が、ログイン・
DB参照を伴う操作はすべて失敗する。ローカルDBを素早く用意したい場合は `npx prisma dev` でも良い。

初回マイグレーション適用後、`prisma/manual-constraints.sql` の内容を追加の空マイグレーションへ
貼り付けて適用すること(部分一意インデックス・排他制約・CHECK制約はPrismaのスキーマDSLでは
表現できないため。詳細はそのファイル冒頭のコメントと `basis/decision_log.md` D-002/D-004を参照)。

```bash
npx prisma migrate dev --name manual_constraints --create-only
# 生成された prisma/migrations/<timestamp>_manual_constraints/migration.sql の中身を
# prisma/manual-constraints.sql の内容で置き換えてから:
npx prisma migrate dev
```

## よく使うコマンド

```bash
npm run dev          # 開発サーバー(Turbopack)
npm run build         # 本番ビルド
npm run lint           # ESLint
npm run test            # 単体テスト(Vitest, 一回実行)
npm run test:watch       # 単体テスト(watchモード)
npx prisma studio         # DBブラウザ
npx prisma migrate dev     # スキーマ変更をマイグレーションとして適用(開発用)
```

## 既知の環境依存事項

- リポジトリのパスに `#_amagi` が含まれるため、Tailwind CSS v4のネイティブエンジン
  (`@tailwindcss/postcss`)は `#` を含む絶対パスの処理でクラッシュする(URLフラグメントとして
  誤解釈される既知のバグ)。そのため本プロジェクトは意図的にTailwind v3系(純JSのPostCSS
  プラグイン)を使用している。`tailwindcss` を安易にv4系へ上げないこと。

## デプロイ

`basis/decision_log.md` D-001のとおり、本アプリはGitHub Pagesにはデプロイしない
(Next.jsのサーバー実行・DB接続が必要なため)。`proposal/branch101/index.html`
(このディレクトリの一つ上)が既存branchと同様の静的エントリページで、そこから実アプリ
(Vercel等にデプロイ)へリンクする。デプロイ手順は `../basis/operations.md` を参照。
