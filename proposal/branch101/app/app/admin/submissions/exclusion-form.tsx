"use client";

import { useActionState, useState } from "react";
import { updateTargetStatusAction } from "./actions";
import { Button } from "@/app/components/ui/button";

export function ExclusionForm({
  targetId,
  storeId,
  currentStatus,
  currentReason,
}: {
  targetId: string;
  storeId: string;
  currentStatus: string;
  currentReason?: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateTargetStatusAction, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        対象設定
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border p-3 mt-2 bg-muted/20">
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="storeId" value={storeId} />

      <label className="text-sm font-medium">対象ステータス</label>
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-md border border-input px-2 py-1 text-sm bg-background"
      >
        <option value="ACTIVE">通常（提出対象）</option>
        <option value="EXCLUDED_RESIGNED">除外（退店済・予定）</option>
        <option value="EXCLUDED_LONG_ABSENCE">除外（長期休職）</option>
        <option value="EXCLUDED_OTHER">除外（その他）</option>
      </select>

      <label className="text-sm font-medium mt-1">除外理由（除外時のみ）</label>
      <input
        name="reason"
        defaultValue={currentReason ?? ""}
        placeholder="理由を入力"
        className="rounded-md border border-input px-2 py-1 text-sm bg-background"
      />

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.message && <p className="text-sm text-green-600">{state.message}</p>}

      <div className="flex gap-2 mt-2">
        <Button type="submit" size="sm" disabled={pending} loading={pending}>
          保存
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          閉じる
        </Button>
      </div>
    </form>
  );
}
