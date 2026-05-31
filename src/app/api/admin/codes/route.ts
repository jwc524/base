import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type CreateCodeBody = {
  code?: string;
  discountPercent?: number;
  maxUses?: number | null;
  expiresAt?: string | null;
  isLifetimeFree?: boolean;
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function GET() {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  let body: CreateCodeBody;
  try {
    body = (await request.json()) as CreateCodeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = (body.code?.trim() || generateCode()).toUpperCase();
  const discountPercent = body.discountPercent ?? 100;

  if (discountPercent < 0 || discountPercent > 100) {
    return NextResponse.json(
      { error: "discountPercent must be between 0 and 100" },
      { status: 400 },
    );
  }

  let expiresAt: Date | null = null;
  if (body.expiresAt) {
    expiresAt = new Date(body.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
    }
  }

  try {
    const discountCode = await prisma.discountCode.create({
      data: {
        code,
        discountPercent,
        maxUses: body.maxUses ?? null,
        isLifetimeFree: body.isLifetimeFree ?? false,
        expiresAt,
      },
    });
    return NextResponse.json({ code: discountCode }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Code already exists" },
      { status: 409 },
    );
  }
}

export async function DELETE(request: Request) {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Code id is required" }, { status: 400 });
  }

  try {
    await prisma.discountCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }
}
