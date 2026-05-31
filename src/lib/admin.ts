import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export function getAdminUserId() {
  return process.env.ADMIN_USER_ID;
}

export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  const adminUserId = getAdminUserId();
  return Boolean(userId && adminUserId && userId === adminUserId);
}

export async function requireAdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const adminUserId = getAdminUserId();
  if (!adminUserId || userId !== adminUserId) {
    redirect("/dashboard");
  }

  return userId;
}

export async function requireAdminApi() {
  const { userId } = await auth();
  const adminUserId = getAdminUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminUserId || userId !== adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
