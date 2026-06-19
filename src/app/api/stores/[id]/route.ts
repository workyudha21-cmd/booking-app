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

  const store = await prisma.store.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, phone, email, address, city, province, postalCode, description } = body;

  const updated = await prisma.store.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(province !== undefined && { province }),
      ...(postalCode !== undefined && { postalCode }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json({ store: updated });
}

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

  const store = await prisma.store.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  await prisma.store.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  return NextResponse.json({ success: true });
}
