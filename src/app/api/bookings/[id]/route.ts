import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!booking || booking.store.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const body = await request.json();
  const { status } = body;

  const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status,
      ...(status === "CANCELLED" && { cancelledAt: new Date(), cancelledBy: session.user.id }),
    },
    include: {
      customer: true,
      service: true,
    },
  });

  return NextResponse.json({ booking: updated });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      service: true,
      store: true,
    },
  });

  if (!booking || booking.store.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
