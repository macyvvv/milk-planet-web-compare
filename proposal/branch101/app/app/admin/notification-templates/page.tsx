import { requireRole } from "@/lib/modules/auth/dal";
import { Role, NotificationTemplateType } from "@/app/generated/prisma/client";
import { listTemplates } from "@/lib/modules/notifications/templates.service";
import { saveTemplateAction } from "./actions";

export default async function NotificationTemplatesPage() {
  await requireRole(Role.AREA_MANAGER, Role.SUPER_USER);
  const templates = await listTemplates(null);

  const getTemplateBody = (type: NotificationTemplateType) => {
    return templates.find((t) => t.templateType === type)?.body ?? "";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">LINE通知テンプレート編集</h1>
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

function TemplateEditor({
  title,
  templateType,
  initialBody,
  description,
}: {
  title: string;
  templateType: NotificationTemplateType;
  initialBody: string;
  description: string;
}) {
  return (
    <div className="border p-4 rounded bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <form action={saveTemplateAction} className="space-y-4">
        <input type="hidden" name="templateType" value={templateType} />
        <textarea
          name="body"
          defaultValue={initialBody}
          rows={6}
          className="w-full border rounded p-2 text-sm"
          placeholder="テンプレートが未設定の場合は、デフォルトのメッセージが送信されます。"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
        >
          保存
        </button>
      </form>
    </div>
  );
}
