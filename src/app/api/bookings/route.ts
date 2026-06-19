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
      bookings: {
        include: {
          customer: true,
          service: true,
        },
        orderBy: { date: "desc" },
      },
    },
  });

  const bookings = stores.flatMap((store) => store.bookings);

  return NextResponse.json({ bookings });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { serviceId, customerId, date, notes } = body;

  // Get user's store
  const store = await prisma.store.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Get service
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Calculate end time
  const startDate = new Date(date);
  const endDate = new Date(startDate.getTime() + service.duration * 60 * 1000);

  // Check for conflicts
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      storeId: store.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { lt: endDate },
      endTime: { gt: startDate },
    },
  });

  if (conflictingBooking) {
    return NextResponse.json({ error: "Time slot already booked" }, { status: 409 });
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      storeId: store.id,
      serviceId,
      customerId,
      date: startDate,
      endTime: endDate,
      originalPrice: service.price,
      finalPrice: service.price,
      customerNotes: notes,
      status: "PENDING",
    },
  });

  return NextResponse.json({ booking });
}
