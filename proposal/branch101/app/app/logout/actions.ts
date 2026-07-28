"use server";

import { redirect } from "next/navigation";
import { logout } from "@/lib/modules/auth/logout";

export async function logoutAction() {
  await logout();
  redirect("/login");
}
