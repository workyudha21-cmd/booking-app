import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { storeSlug, serviceId, date, customerName, customerPhone, notes } = body;

  // Validate required fields
  if (!storeSlug || !serviceId || !date || !customerName || !customerPhone) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Find store
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug, isActive: true },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Find service
  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true, deletedAt: null },
  });

  if (!service || service.storeId !== store.id) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Parse date
  const bookingDate = new Date(date);
  const endDate = new Date(bookingDate.getTime() + service.duration * 60 * 1000);

  // Check for conflicts
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      storeId: store.id,
      serviceId,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { lt: endDate },
      endTime: { gt: bookingDate },
    },
  });

  if (conflictingBooking) {
    return NextResponse.json(
      { error: "Waktu sudah terisi, silakan pilih waktu lain" },
      { status: 409 }
    );
  }

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: {
      storeId_phone: {
        storeId: store.id,
        phone: customerPhone,
      },
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: customerName,
        phone: customerPhone,
      },
    });
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      storeId: store.id,
      serviceId,
      customerId: customer.id,
      date: bookingDate,
      endTime: endDate,
      originalPrice: service.price,
      finalPrice: service.price,
      customerNotes: notes,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    booking: {
      id: booking.id,
      date: booking.date,
      status: booking.status,
      service: service.name,
      price: service.price,
    },
  });
}
