import { requireRole } from "@/lib/modules/auth/dal";
import { Role, NotificationTemplateType } from "@/app/generated/prisma/client";
import { listTemplates } from "@/lib/modules/notifications/templates.service";
import { TemplateEditor } from "./template-editor";

export default async function NotificationTemplatesPage() {
  await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  const templates = await listTemplates(null);

  const getTemplateBody = (type: NotificationTemplateType) => {
    return templates.find((t) => t.templateType === type)?.body ?? "";
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
      <header className="border-b pb-4 flex justify-between items-end">
        <div>
          <p className="text-sm text-muted-foreground">管理ダッシュボード</p>
          <h1 className="text-2xl font-bold">通知テンプレート編集</h1>
        </div>
      </header>

      <div className="space-y-8">
        <TemplateEditor
          title="【全店舗】シフト未提出通知"
          templateType={NotificationTemplateType.ALL_STORES_UNSUBMITTED}
          initialBody={getTemplateBody(NotificationTemplateType.ALL_STORES_UNSUBMITTED)}
          description="利用可能な変数: {{PERIOD_LABEL}}, {{BODY}}"
        />
        <TemplateEditor
          title="【個別店舗】シフト未提出通知"
          templateType={NotificationTemplateType.STORE_UNSUBMITTED}
          initialBody={getTemplateBody(NotificationTemplateType.STORE_UNSUBMITTED)}
          description="利用可能な変数: {{PERIOD_LABEL}}, {{STORE_NAME}}, {{CAST_NAMES}}, {{DEADLINE_LABEL}}"
        />
        <TemplateEditor
          title="イベント変更再通知"
          templateType={NotificationTemplateType.EVENT_CHANGE_RENOTIFY}
          initialBody={getTemplateBody(NotificationTemplateType.EVENT_CHANGE_RENOTIFY)}
          description="利用可能な変数: {{EVENT_NAME}}, {{EVENT_DATE}}"
        />
      </div>
    </div>
  );
}

export const metadata = {
  title: "通知テンプレート | Milk Planet",
};
