"use client";
import { useActionState, useId } from "react";
import { saveTemplateAction, type TemplateFormState } from "./actions";
import { NotificationTemplateType } from "@/app/generated/prisma/client";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: TemplateFormState = {};

export function TemplateEditor({
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
  const [state, formAction, pending] = useActionState(saveTemplateAction, initialState);
  const errorId = useId();

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4 bg-muted/50 p-2 rounded-md border border-dashed border-muted-foreground/30">
        {description}
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="templateType" value={templateType} />
        
        <textarea
          name="body"
          defaultValue={initialBody}
          rows={6}
          required
          aria-describedby={state?.error ? errorId : undefined}
          className="w-full rounded-md border border-input p-3 text-sm bg-background min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="テンプレートが未設定の場合は、デフォルトのメッセージが送信されます。"
        />
        
        <div aria-live="polite" aria-atomic="true">
          {state?.error && (
            <Alert variant="destructive" id={errorId}>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          {state?.success && (
            <Alert className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950/50">
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button
          type="submit"
          loading={pending}
          disabled={pending}
          className="self-start"
        >
          {pending ? "保存中…" : "保存"}
        </Button>
      </form>
    </div>
  );
}
