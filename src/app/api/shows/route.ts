import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CreateShowBody = {
  name?: string;
  date?: string;
  venue?: string;
  city?: string;
  soundcheckTime?: string;
  notes?: string;
};

async function getOwner() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  return prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
}

export async function GET() {
  const owner = await getOwner();

  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shows = await prisma.show.findMany({
    where: { ownerId: owner.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ shows });
}

export async function POST(request: Request) {
  const owner = await getOwner();

  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateShowBody;
  try {
    body = (await request.json()) as CreateShowBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Show name is required" }, { status: 400 });
  }

  if (!body.date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const date = new Date(body.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  let soundcheckTime: Date | null = null;
  if (body.soundcheckTime) {
    const [hours, minutes] = body.soundcheckTime.split(":").map(Number);
    if (hours !== undefined && minutes !== undefined) {
      soundcheckTime = new Date(date);
      soundcheckTime.setHours(hours, minutes, 0, 0);
    }
  }

  try {
    const show = await prisma.show.create({
      data: {
        name,
        date,
        venue: body.venue?.trim() || null,
        city: body.city?.trim() || null,
        notes: body.notes?.trim() || null,
        soundcheckTime,
        ownerId: owner.id,
      },
    });

    return NextResponse.json({ show }, { status: 201 });
  } catch (error) {
    console.error("Create show failed:", error);
    return NextResponse.json(
      { error: "Failed to create show" },
      { status: 500 },
    );
  }
}
