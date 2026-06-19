import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const dateStr = searchParams.get("date");

  if (!serviceId || !dateStr) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { store: true },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  // Get store working hours for this day
  const workingHour = await prisma.workingHour.findUnique({
    where: {
      storeId_dayOfWeek: {
        storeId: service.storeId,
        dayOfWeek,
      },
    },
  });

  // Default working hours if not configured
  const openTime = workingHour?.openTime || "09:00";
  const closeTime = workingHour?.closeTime || "17:00";
  const isClosed = workingHour?.isClosed || false;

  if (isClosed) {
    return NextResponse.json({ slots: [] });
  }

  // Generate time slots
  const slots: { time: string; available: boolean }[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  let currentMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const slotDuration = service.duration + (service.bufferBefore || 0) + (service.bufferAfter || 0);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      serviceId,
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: {
      date: true,
      endTime: true,
    },
  });

  while (currentMinutes + slotDuration <= closeMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const slotStart = new Date(date);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

    // Check if slot conflicts with existing bookings
    const isAvailable = !existingBookings.some((booking) => {
      const bookingEnd = booking.endTime;
      return slotStart < bookingEnd && slotEnd > booking.date;
    });

    // Also check if slot is in the past
    const now = new Date();
    const isPast = slotStart <= now;

    slots.push({
      time: timeStr,
      available: isAvailable && !isPast,
    });

    currentMinutes += slotDuration;
  }

  return NextResponse.json({ slots });
}
