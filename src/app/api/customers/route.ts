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
      customers: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              finalPrice: true,
              date: true,
            },
          },
        },
      },
    },
  });

  const customers = stores.flatMap((store) =>
    store.customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      totalBookings: customer.bookings.length,
      totalSpent: customer.bookings
        .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
        .reduce((sum, b) => sum + b.finalPrice, 0),
      lastBookingAt: customer.bookings.length > 0
        ? customer.bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null,
      createdAt: customer.createdAt,
    }))
  );

  return NextResponse.json({ customers });
}
