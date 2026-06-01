import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { getAdminStats } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin stats failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
