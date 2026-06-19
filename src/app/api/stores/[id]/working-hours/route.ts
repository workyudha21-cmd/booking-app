import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

  const store = await prisma.store.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const workingHours = await prisma.workingHour.findMany({
    where: { storeId: id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ workingHours });
}

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

  const store = await prisma.store.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();
  const { workingHours } = body;

  if (!Array.isArray(workingHours)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Delete existing working hours
  await prisma.workingHour.deleteMany({
    where: { storeId: id },
  });

  // Create new working hours
  const created = await prisma.workingHour.createMany({
    data: workingHours.map((wh: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }) => ({
      storeId: id,
      dayOfWeek: wh.dayOfWeek,
      openTime: wh.openTime,
      closeTime: wh.closeTime,
      isClosed: wh.isClosed || false,
    })),
  });

  return NextResponse.json({ success: true, count: created.count });
}
