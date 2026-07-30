"use client";

import { useActionState, useState } from "react";
import { updateResignationAction, updateMembershipsAction } from "./actions";
import { Button } from "@/app/components/ui/button";

export function ResignationForm({ userId, currentResignationDate }: { userId: string, currentResignationDate?: string | null }) {
  const [state, formAction, pending] = useActionState(updateResignationAction, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>退店予定日を設定</Button>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border p-3 bg-muted/30">
      <h4 className="text-sm font-semibold">退店予定日の設定</h4>
      <input type="hidden" name="userId" value={userId} />
      
      <div className="flex items-center gap-2">
        <input 
          type="date" 
          name="resignationDate" 
          defaultValue={currentResignationDate ? currentResignationDate.split('T')[0] : ""}
          className="rounded-md border border-input px-2 py-1 text-sm bg-background" 
        />
      </div>
      
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.message && <p className="text-sm text-green-600">{state.message}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} loading={pending}>保存</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>閉じる</Button>
      </div>
    </form>
  );
}

export function MembershipForm({ 
  userId, 
  availableStores, 
  currentStoreIds 
}: { 
  userId: string, 
  availableStores: { id: string, name: string }[],
  currentStoreIds: string[]
}) {
  const [state, formAction, pending] = useActionState(updateMembershipsAction, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>所属店舗を変更</Button>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border p-3 bg-muted/30">
      <h4 className="text-sm font-semibold">所属店舗の設定</h4>
      <input type="hidden" name="userId" value={userId} />
      
      <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
        {availableStores.map(store => (
          <label key={store.id} className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              name="storeIds" 
              value={store.id} 
              defaultChecked={currentStoreIds.includes(store.id)} 
            />
            {store.name}
          </label>
        ))}
      </div>
      
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.message && <p className="text-sm text-green-600">{state.message}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} loading={pending}>保存</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>閉じる</Button>
      </div>
    </form>
  );
}
