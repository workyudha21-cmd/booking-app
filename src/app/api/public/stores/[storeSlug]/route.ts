import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: {
      slug: storeSlug,
      isActive: true,
    },
    include: {
      services: {
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({
    store: {
      id: store.id,
      name: store.name,
      description: store.description,
      image: store.image,
      phone: store.phone,
      address: store.address,
      city: store.city,
      province: store.province,
      latitude: store.latitude,
      longitude: store.longitude,
      mapsUrl: store.mapsUrl,
      services: store.services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration: s.duration,
        price: s.price,
        category: s.category,
      })),
    },
  });
}
