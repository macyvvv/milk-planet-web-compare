import { NextResponse } from "next/server";
import { ensurePeriodsGenerated } from "@/lib/modules/periods/periods.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await ensurePeriodsGenerated();
    return NextResponse.json({ success: true, message: "Periods successfully generated/ensured." });
  } catch (error) {
    console.error("Failed to run cron job ensurePeriodsGenerated:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
