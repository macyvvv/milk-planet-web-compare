import { redirect } from "next/navigation";
import { getCurrentUser, hasRole } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";

const ADMIN_ROLES = [
  Role.STORE_MANAGER,
  Role.STORE_DEPUTY_MANAGER,
  Role.AREA_MANAGER,
  Role.SUPER_USER,
];

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(hasRole(user, ...ADMIN_ROLES) ? "/admin" : "/home");
}
