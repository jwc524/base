import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AccountType, Instrument } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type OnboardingBody = {
  name?: string;
  accountType?: AccountType;
  instruments?: Instrument[];
  location?: string;
  bio?: string;
};

function isAccountType(value: unknown): value is AccountType {
  return value === AccountType.ARTIST || value === AccountType.MUSICIAN;
}

function isInstrument(value: unknown): value is Instrument {
  return Object.values(Instrument).includes(value as Instrument);
}

export async function POST(request: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  let body: OnboardingBody;
  try {
    body = (await request.json()) as OnboardingBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const location = body.location?.trim();
  const bio = body.bio?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }

  if (!isAccountType(body.accountType)) {
    return NextResponse.json(
      { error: "A valid account type is required" },
      { status: 400 },
    );
  }

  const instruments = body.instruments ?? [];
  if (!Array.isArray(instruments) || !instruments.every(isInstrument)) {
    return NextResponse.json(
      { error: "Invalid instruments selection" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Profile already exists" },
      { status: 409 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        accountType: body.accountType,
        instruments,
        location,
        bio,
        genres: [],
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding create failed:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 },
    );
  }
}
