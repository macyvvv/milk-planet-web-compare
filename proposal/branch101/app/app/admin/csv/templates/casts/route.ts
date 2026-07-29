const TEMPLATE = [
  "operation,login_name,display_name,display_name_kana,store_name,pin,permission_level,job_title",
  "UPSERT,yamada,山田太郎,やまだたろう,本店,1234,GENERAL_USER,CAST",
  "UPSERT,sato,佐藤花子,さとうはなこ,本店,,STORE_ADMIN,STORE_DEPUTY_MANAGER",
].join("\r\n");

export async function GET() {
  return new Response(`\uFEFF${TEMPLATE}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="accounts-template.csv"',
    },
  });
}
