import { NextResponse } from "next/server";

const TEMPLATES: Record<string, string[]> = {
  stores: [
    "operation,store_code,name,status",
    "UPSERT,MAIN,本店,ACTIVE",
  ],
  standard_shifts: [
    "operation,login_name,day_of_week,is_working,start_time,end_time,note",
    "UPSERT,yamada,1,true,18:00,23:30,",
  ],
  period_settings: [
    "operation,period_start_date,store_code,submission_open_at,submission_deadline_at",
    "UPSERT,2026-08-01,MAIN,2026-07-20T09:00:00+09:00,2026-07-27T23:59:00+09:00",
  ],
  period_cast_targets: [
    "operation,period_start_date,store_code,user_id,login_name,target_status,exclusion_reason",
    "UPSERT,2026-08-01,MAIN,,yamada,ACTIVE,",
    "UPSERT,2026-08-01,MAIN,,sato,EXCLUDED_LONG_ABSENCE,休職中",
  ],
  notification_templates: [
    "operation,template_type,store_code,body",
    "UPSERT,STORE_UNSUBMITTED,MAIN,シフト未提出者がいます。",
    "UPSERT,ALL_STORES_UNSUBMITTED,,全店舗の未提出状況を確認してください。",
  ],
  memberships: [
    "operation,login_name,store_code,valid_from,valid_to,membership_type",
    "UPSERT,yamada,MAIN,2026-08-01,,PRIMARY",
  ],
  events: [
    "operation,event_id,name,event_date,is_all_stores,store_codes,cast_note,admin_note,change_reason",
    "UPSERT,,夏祭り,2026-08-15,true,,混雑予定,管理者メモ,",
  ],
  confirmed_shifts: [
    "operation,login_name,store_code,period_start_date,work_date,start_time,end_time,cast_note,admin_note,change_reason",
    "UPSERT,yamada,MAIN,2026-08-01,2026-08-03,18:00,23:30,,,",
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  const template = TEMPLATES[kind];
  if (!template) return NextResponse.json({ error: "unknown template" }, { status: 404 });
  return new Response(`\uFEFF${template.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind}-template.csv"`,
    },
  });
}
