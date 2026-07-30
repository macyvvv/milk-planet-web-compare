const TEMPLATE = [
  "operation,user_id,login_name,display_name,display_name_kana,store_code,pin,permission_level,job_title,managed_store_codes,resignation_scheduled_on",
  "UPSERT,,yamada,山田太郎,やまだたろう,MAIN,1234,GENERAL_USER,CAST,,",
  "UPSERT,,sato,佐藤花子,さとうはなこ,MAIN,,STORE_ADMIN,STORE_DEPUTY_MANAGER,MAIN,",
].join("\r\n");

export async function GET() {
  return new Response(`\uFEFF${TEMPLATE}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="accounts-template.csv"',
    },
  });
}
