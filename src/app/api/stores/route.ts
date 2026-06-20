import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, phone, email, address, city, province, postalCode } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Nama dan slug wajib diisi" }, { status: 400 });
    }

    const existingStore = await prisma.store.findUnique({
      where: { slug },
    });

    if (existingStore) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        description,
        phone,
        email,
        address,
        city,
        province,
        postalCode,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json({ error: "Gagal membuat toko" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optimasi: Select hanya field yang diperlukan untuk dashboard
    const stores = await prisma.store.findMany({
      where: { 
        ownerId: session.user.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        mapsUrl: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json({ error: "Gagal mengambil data toko" }, { status: 500 });
  }
}
