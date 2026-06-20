"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  XCircle,
  Ban,
  Search,
  CalendarDays,
  Phone,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface Booking {
  id: string;
  date: string;
  endTime: string;
  status: string;
  customerNotes: string | null;
  originalPrice: number;
  finalPrice: number;
  customer: { id: string; name: string; phone: string; email?: string };
  service: { id: string; name: string; price: number; duration: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  PENDING: { label: "Menunggu", color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: Clock },
  CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: CheckCircle },
  COMPLETED: { label: "Selesai", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: CheckCircle },
  CANCELLED: { label: "Dibatalkan", color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: XCircle },
  NO_SHOW: { label: "Tidak Hadir", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200", icon: Ban },
};

const STATUS_TABS = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "CONFIRMED", label: "Dikonfirmasi" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "NO_SHOW", label: "Tidak Hadir" },
];

export default function BookingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchBookings = () => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      const data = await res.json();
      setBookings(bookings.map((b) => (b.id === bookingId ? data.booking : b)));
      toast.success(`Booking berhasil diubah ke ${STATUS_CONFIG[newStatus]?.label}`);
    } else {
      toast.error("Gagal mengubah status booking");
    }

    setUpdatingId(null);
  };

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeTab !== "ALL" && booking.status !== activeTab) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          booking.customer.name.toLowerCase().includes(query) ||
          booking.customer.phone.includes(query) ||
          booking.service.name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    });

    return {
      total: bookings.length,
      today: todayBookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
      revenue: bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + b.finalPrice, 0),
    };
  }, [bookings]);

  if (isPending || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Kelola semua reservasi Anda.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">Hari Ini</span>
          </div>
          <p className="text-2xl font-bold">{stats.today}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Menunggu</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Selesai</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Pendapatan</span>
          </div>
          <p className="text-2xl font-bold">
            Rp {(stats.revenue / 1000000).toFixed(1)}jt
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama, telepon, atau layanan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border bg-background p-12 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery
              ? "Tidak ada booking yang cocok dengan pencarian."
              : activeTab !== "ALL"
              ? `Tidak ada booking dengan status "${STATUS_CONFIG[activeTab]?.label}".`
              : "Belum ada booking."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;
            const bookingDate = new Date(booking.date);
            const endDate = new Date(booking.endTime);
            const isToday = new Date().toDateString() === bookingDate.toDateString();

            return (
              <div
                key={booking.id}
                className={`rounded-xl border p-4 sm:p-5 transition-colors ${statusConfig.bgColor}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Booking Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{booking.customer.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color} bg-white/80`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                      {isToday && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground">
                          Hari Ini
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>
                          {bookingDate.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>
                          {bookingDate.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endDate.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span className="text-xs ml-1">({booking.service.duration} menit)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4 shrink-0" />
                        <span className="font-medium text-foreground">{booking.service.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{booking.customer.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold">
                        Rp {booking.finalPrice.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {booking.customerNotes && (
                      <div className="bg-white/60 rounded-lg p-3 text-sm">
                        <p className="font-medium text-muted-foreground mb-1">Catatan Pelanggan:</p>
                        <p className="italic">{booking.customerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    {booking.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(booking.id, "CONFIRMED")}
                          disabled={updatingId === booking.id}
                          className="flex-1 sm:flex-none"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Konfirmasi
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(booking.id, "CANCELLED")}
                          disabled={updatingId === booking.id}
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Batalkan
                        </Button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(booking.id, "COMPLETED")}
                          disabled={updatingId === booking.id}
                          className="flex-1 sm:flex-none"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Selesai
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(booking.id, "NO_SHOW")}
                          disabled={updatingId === booking.id}
                          className="flex-1 sm:flex-none"
                        >
                          <Ban className="mr-1 h-3 w-3" />
                          Tidak Hadir
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
