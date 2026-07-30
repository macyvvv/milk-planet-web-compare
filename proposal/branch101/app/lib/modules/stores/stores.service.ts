import "server-only";
import { db } from "@/lib/db";

export async function listActiveStores() {
  return db.store.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } });
}

export async function listAllStores() {
  return db.store.findMany({ orderBy: { name: "asc" } });
}

export async function getStore(storeId: string) {
  return db.store.findUnique({ where: { id: storeId } });
}

export interface CreateStoreInput {
  code: string;
  name: string;
}

/** Store master data is small and rarely changes (8 stores, requirements.md 3.2) — no history table. */
export async function createStore(input: CreateStoreInput) {
  return db.store.create({ data: { code: input.code, name: input.name } });
}

export interface UpdateStoreInput {
  storeId: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

export async function updateStore(input: UpdateStoreInput) {
  return db.store.update({
    where: { id: input.storeId },
    data: { code: input.code, name: input.name, status: input.status }
  });
}
