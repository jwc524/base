import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Instrument } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UpdateProfileBody = {
  name?: string;
  bio?: string;
  location?: string;
  instruments?: Instrument[];
  genres?: string[];
};

function isInstrument(value: unknown): value is Instrument {
  return Object.values(Instrument).includes(value as Instrument);
}

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
  const user = await getOwner();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const existing = await getOwner();

  if (!existing) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateProfileBody;
  try {
    body = (await request.json()) as UpdateProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const instruments = body.instruments;
  if (
    instruments !== undefined &&
    (!Array.isArray(instruments) || !instruments.every(isInstrument))
  ) {
    return NextResponse.json(
      { error: "Invalid instruments selection" },
      { status: 400 },
    );
  }

  const genres = body.genres;
  if (
    genres !== undefined &&
    (!Array.isArray(genres) ||
      genres.some((genre) => typeof genre !== "string" || !genre.trim()))
  ) {
    return NextResponse.json({ error: "Invalid genres" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(body.bio !== undefined ? { bio: body.bio.trim() || null } : {}),
        ...(body.location !== undefined
          ? { location: body.location.trim() || null }
          : {}),
        ...(instruments !== undefined ? { instruments } : {}),
        ...(genres !== undefined
          ? { genres: genres.map((g) => g.trim()).filter(Boolean) }
          : {}),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
