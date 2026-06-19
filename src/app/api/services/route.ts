import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: session.user.id },
    include: {
      services: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const services = stores.flatMap((store) => store.services);

  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, duration, price, description, storeId } = body;

  let store;

  if (storeId) {
    store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: session.user.id },
    });
  }

  if (!store) {
    store = await prisma.store.findFirst({
      where: { ownerId: session.user.id },
    });
  }

  if (!store) {
    store = await prisma.store.create({
      data: {
        name: `${session.user.name}'s Store`,
        slug: `${session.user.name?.toLowerCase().replace(/\s+/g, "-") || "store"}-${Date.now()}`,
        ownerId: session.user.id,
      },
    });
  }

  const service = await prisma.service.create({
    data: {
      storeId: store.id,
      name,
      duration,
      price,
      description,
    },
  });

  return NextResponse.json({ service });
}
