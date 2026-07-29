# シフト管理システム(branch101)

設計正本は [`../basis/`](../basis/README.md)。実装で判断に迷ったら、まず `basis/requirements.md`
の該当REQ-ID、`basis/data_model.md`、`basis/decision_log.md` を確認すること。

## セットアップ

```bash
npm install
cp .env.example .env   # DATABASE_URLを設定
npx prisma generate
npm run migrate:libsql
npm run bootstrap:su   # 空DBに初期SUPER_USERを一度だけ作成
npm run dev
```

初期SUPER_USERは `admin` / `admin` / `あどみん` でPENDING_SETUPとして作成される。コマンドが一度だけ
表示する英数字10文字・72時間有効の初期設定コードを使い、`/initial-setup` で本人が数字4桁のPINを設定する。
固定初期PINは存在しない。ユーザーが1件でも存在するDBではbootstrapは拒否される。

本番ではVercelの一時ファイルDBを使用せず、永続libSQLの `DATABASE_URL` と
`DATABASE_AUTH_TOKEN` を設定する。

`migrate:libsql` はmigrationディレクトリを名前順に適用し、`app_migrations`で適用履歴を管理する。
同じDBへ再実行しても適用済みmigrationはスキップされる。

## よく使うコマンド

```bash
npm run dev          # 開発サーバー(Turbopack)
npm run build         # 本番ビルド
npm run lint           # ESLint
npm run test            # 単体テスト(Node.js test runner)
npx prisma studio         # DBブラウザ
npm run migrate:libsql     # local/remote libSQLへmigration適用
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
