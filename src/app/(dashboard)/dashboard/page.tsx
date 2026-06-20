"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { CalendarDays, TrendingUp, Clock, ArrowRight } from "lucide-react";

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

  const stats = useMemo(() => {
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

    return { todayBookings, totalRevenue, recentBookings };
  }, [bookings]);

  if (isPending || loading) {
    return <LoadingSpinner />;
  }

  const hasStore = stores.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Selamat Datang, {session?.user?.name}</h1>
        <p className="text-muted-foreground">Kelola booking dan bisnis Anda di sini.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-background p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CalendarDays className="h-4 w-4" />
            <p className="text-sm font-medium">Total Bookings</p>
          </div>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
        <div className="rounded-xl border bg-background p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <p className="text-sm font-medium">Hari Ini</p>
          </div>
          <p className="text-3xl font-bold">{stats.todayBookings.length}</p>
        </div>
        <div className="rounded-xl border bg-background p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <p className="text-sm font-medium">Pendapatan</p>
          </div>
          <p className="text-3xl font-bold">Rp {stats.totalRevenue.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Onboarding Steps */}
      {!hasStore && (
        <div className="rounded-xl border bg-background p-6">
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

      {/* Store Info */}
      {hasStore && (
        <>
          <div className="rounded-xl border bg-background p-6">
            <h2 className="text-lg font-semibold mb-4">Toko Anda</h2>
            <div className="space-y-3">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">{store.name}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/b/${store.slug}`}>
                      Lihat Booking Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          {stats.recentBookings.length > 0 && (
            <div className="rounded-xl border bg-background p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Booking Terbaru</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/bookings">
                    Lihat Semua
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
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
