"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, TrendingUp, Clock } from "lucide-react";

interface Booking {
  id: string;
  date: string;
  status: string;
  finalPrice: number;
  customer: { name: string; phone: string };
  service: { name: string; price: number };
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch("/api/stores").then((res) => res.json()),
        fetch("/api/bookings").then((res) => res.json()),
      ])
        .then(([storesData, bookingsData]) => {
          if (Array.isArray(storesData)) {
            setStores(storesData);
          }
          if (bookingsData.bookings) {
            setBookings(bookingsData.bookings);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (isPending || loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const hasStore = stores.length > 0;

  // Calculate statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.date);
    return bookingDate >= today && bookingDate < tomorrow && b.status !== "CANCELLED";
  });

  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED" || b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.finalPrice, 0);

  const recentBookings = bookings
    .filter((b) => b.status !== "CANCELLED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Selamat Datang, {session?.user?.name}</h1>
        <p className="text-muted-foreground">Kelola booking dan bisnis Anda di sini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CalendarDays className="h-4 w-4" />
            <p className="text-sm font-medium">Total Bookings</p>
          </div>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <p className="text-sm font-medium">Hari Ini</p>
          </div>
          <p className="text-3xl font-bold">{todayBookings.length}</p>
        </div>
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <p className="text-sm font-medium">Pendapatan</p>
          </div>
          <p className="text-3xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {!hasStore && (
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Langkah Selanjutnya</h2>
          <ul className="space-y-3">
            <li className="flex items-center text-sm">
              <span className="mr-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
              <Link href="/dashboard/store/create" className="font-medium text-primary hover:underline">
                Buat toko Anda
              </Link>
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-3 h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">2</span>
              Tambahkan layanan
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-3 h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">3</span>
              Bagikan link booking
            </li>
          </ul>
        </div>
      )}

      {hasStore && (
        <>
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Toko Anda</h2>
            <div className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="font-medium">{store.name}</span>
                  <Link href={`/b/${store.slug}`} className="text-sm text-primary hover:underline">
                    Lihat Booking Page
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {recentBookings.length > 0 && (
            <div className="rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Booking Terbaru</h2>
                <Link href="/dashboard/bookings" className="text-sm text-primary hover:underline">
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">{booking.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.service.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {new Date(booking.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
