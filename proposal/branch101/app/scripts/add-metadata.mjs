import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const pages = [
  { path: "app/initial-setup/page.tsx", title: "初期セットアップ" },
  { path: "app/home/page.tsx", title: "ホーム" },
  { path: "app/my-shifts/page.tsx", title: "マイシフト" },
  { path: "app/admin/periods/page.tsx", title: "シフト受付期間管理" },
  { path: "app/admin/scheduling/by-date/page.tsx", title: "シフト作成 (日付別)" },
  { path: "app/admin/scheduling/by-cast/page.tsx", title: "シフト作成 (キャスト別)" },
  { path: "app/admin/publications/page.tsx", title: "シフト公開" },
  { path: "app/admin/roles/page.tsx", title: "権限管理" },
  { path: "app/admin/unsubmitted/page.tsx", title: "未提出者" },
  { path: "app/admin/audit/page.tsx", title: "監査ログ" },
  { path: "app/admin/csv/page.tsx", title: "CSV入出力" },
  { path: "app/admin/users/page.tsx", title: "キャスト管理" },
  { path: "app/admin/submissions/page.tsx", title: "シフト提出状況" },
  { path: "app/admin/notification-templates/page.tsx", title: "通知テンプレート" },
  { path: "app/admin/events/page.tsx", title: "イベント管理" },
  { path: "app/admin/page.tsx", title: "管理ダッシュボード" },
  { path: "app/admin/differences/page.tsx", title: "希望と確定の差分" },
  { path: "app/my-submissions/page.tsx", title: "自分のシフト提出状況" },
  { path: "app/password-reset/page.tsx", title: "パスワードリセット" },
  { path: "app/my-shift-differences/page.tsx", title: "希望と確定の差分 (キャスト)" },
  { path: "app/standard-shift/page.tsx", title: "標準シフト" },
  { path: "app/availability/page.tsx", title: "シフト希望入力" },
  { path: "app/login/page.tsx", title: "ログイン" },
];

async function run() {
  for (const page of pages) {
    try {
      const p = join(process.cwd(), page.path);
      let content = await readFile(p, "utf-8");
      
      if (!content.includes("export const metadata")) {
        const metadataStr = `\nexport const metadata = {\n  title: "${page.title} | Milk Planet",\n};\n`;
        content = content + metadataStr;
        await writeFile(p, content, "utf-8");
        console.log("Updated", page.path);
      }
    } catch (e) {
      console.log("Error or file missing:", page.path, e.message);
    }
  }
}

run();
