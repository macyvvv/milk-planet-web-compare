import { NextRequest, NextResponse } from "next/server";
import { requireRole, requireStoreAccess, resolveStoreScope } from "@/lib/modules/auth/dal";
import { Role } from "@/app/generated/prisma/client";
import {
  exportCasts,
  exportAvailability,
  exportSubmissions,
  exportConfirmedShifts,
  exportDifferences,
  exportEvents,
  exportMemberships,
} from "@/lib/modules/csv/export.service";

/** REQ-CSV-001: 各種CSVエクスポート。Route HandlerでBOM付きCSVを都度生成して返す(永続化しない)。 */
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const periodId = req.nextUrl.searchParams.get("periodId") ?? undefined;
  const storeId = req.nextUrl.searchParams.get("storeId") ?? undefined;

  const user = await requireRole(
    Role.STORE_MANAGER,
    Role.STORE_DEPUTY_MANAGER,
    Role.AREA_MANAGER,
    Role.SUPER_USER,
  );

  let bytes: Uint8Array;
  let filename: string;

  switch (type) {
    case "CASTS": {
      const scope = resolveStoreScope(user);
      bytes = await exportCasts(scope, user.id);
      filename = "casts.csv";
      break;
    }
    case "AVAILABILITY": {
      if (!periodId || !storeId) return NextResponse.json({ error: "periodId/storeId required" }, { status: 400 });
      await requireStoreAccess(storeId);
      bytes = await exportAvailability(periodId, storeId, user.id);
      filename = "availability.csv";
      break;
    }
    case "SUBMISSIONS": {
      if (!periodId || !storeId) return NextResponse.json({ error: "periodId/storeId required" }, { status: 400 });
      await requireStoreAccess(storeId);
      bytes = await exportSubmissions(periodId, storeId, user.id);
      filename = "submissions.csv";
      break;
    }
    case "CONFIRMED_SHIFTS": {
      if (!periodId || !storeId) return NextResponse.json({ error: "periodId/storeId required" }, { status: 400 });
      await requireStoreAccess(storeId);
      bytes = await exportConfirmedShifts(periodId, storeId, user.id);
      filename = "confirmed_shifts.csv";
      break;
    }
    case "DIFFERENCES": {
      if (!periodId || !storeId) return NextResponse.json({ error: "periodId/storeId required" }, { status: 400 });
      await requireStoreAccess(storeId);
      bytes = await exportDifferences(periodId, storeId, user.id);
      filename = "differences.csv";
      break;
    }
    case "EVENTS": {
      const scope = resolveStoreScope(user);
      bytes = await exportEvents(scope, user.id);
      filename = "events.csv";
      break;
    }
    case "MEMBERSHIPS": {
      const scope = resolveStoreScope(user);
      bytes = await exportMemberships(scope, user.id);
      filename = "memberships.csv";
      break;
    }
    default:
      return NextResponse.json({ error: "unknown type" }, { status: 400 });
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
