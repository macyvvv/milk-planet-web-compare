import { AdminNavigation } from "./admin-navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNavigation />
      {children}
    </>
  );
}
