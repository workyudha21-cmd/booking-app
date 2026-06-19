import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
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

  const service = await prisma.service.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!service || service.store.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  return NextResponse.json({ success: true });
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

  const service = await prisma.service.findUnique({
    where: { id },
    include: { store: true },
  });

  if (!service || service.store.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, duration, price, description, category, isActive } = body;

  const updated = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(duration !== undefined && { duration: Number(duration) }),
      ...(price !== undefined && { price: Number(price) }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ service: updated });
}
