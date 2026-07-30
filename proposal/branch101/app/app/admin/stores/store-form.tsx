"use client";

import { useActionState, useState } from "react";
import { saveStoreAction, type StoreFormState } from "./actions";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const initialState: StoreFormState = {};

export function StoreForm({ store }: { store?: { id: string; code: string; name: string; status: string } }) {
  const [state, formAction, pending] = useActionState(saveStoreAction, initialState);
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen && !store) {
    return <Button onClick={() => setIsOpen(true)}>新規店舗登録</Button>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-4 bg-card shadow-sm">
      <h3 className="font-semibold text-lg">{store ? "店舗編集" : "新規店舗登録"}</h3>
      
      {store && <input type="hidden" name="id" value={store.id} />}
      
      <div className="grid gap-2">
        <label className="text-sm font-medium">店舗コード</label>
        <input 
          name="code" 
          defaultValue={store?.code ?? ""} 
          required 
          className="rounded-md border border-input px-3 py-2 text-sm bg-background" 
        />
      </div>
      
      <div className="grid gap-2">
        <label className="text-sm font-medium">店舗名</label>
        <input 
          name="name" 
          defaultValue={store?.name ?? ""} 
          required 
          className="rounded-md border border-input px-3 py-2 text-sm bg-background" 
        />
      </div>

      {store && (
        <div className="grid gap-2">
          <label className="text-sm font-medium">ステータス</label>
          <select 
            name="status" 
            defaultValue={store.status} 
            className="rounded-md border border-input px-3 py-2 text-sm bg-background"
          >
            <option value="ACTIVE">有効</option>
            <option value="INACTIVE">無効</option>
          </select>
        </div>
      )}

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950/50">
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 mt-2">
        <Button type="submit" loading={pending} disabled={pending}>
          保存
        </Button>
        {!store && (
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
}
