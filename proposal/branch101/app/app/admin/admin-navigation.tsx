"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function parentFor(pathname: string): { href: string; label: string } | null {
  if (pathname === "/admin") return null;
  if (pathname.startsWith("/admin/csv/preview/")) {
    return { href: "/admin/csv", label: "CSV入出力へ戻る" };
  }
  if (/^\/admin\/events\/[^/]+\/edit$/.test(pathname)) {
    return { href: "/admin/events", label: "イベント管理へ戻る" };
  }
  return { href: "/admin", label: "管理トップへ戻る" };
}

export function AdminNavigation() {
  const parent = parentFor(usePathname());
  if (!parent) return null;
  return (
    <nav aria-label="管理画面の戻り先" className="mx-auto w-full max-w-5xl px-4 pt-4">
      <Link
        href={parent.href}
        className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-3 text-sm font-medium dark:border-slate-700"
      >
        ← {parent.label}
      </Link>
    </nav>
  );
}
