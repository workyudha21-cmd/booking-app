"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Clock, XCircle, Ban, MoreHorizontal } from "lucide-react";

interface Booking {
  id: string;
  date: string;
  endTime: string;
  status: string;
  customerNotes: string | null;
  customer: { id: string; name: string; phone: string };
  service: { id: string; name: string; price: number; duration: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CONFIRMED: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  COMPLETED: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: XCircle },
  NO_SHOW: { label: "Tidak Hadir", color: "bg-gray-100 text-gray-800", icon: Ban },
};

export default function BookingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  if (isPending || loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Kelola semua reservasi Anda.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">Belum ada booking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;
            const bookingDate = new Date(booking.date);
            const endDate = new Date(booking.endTime);

            return (
              <div key={booking.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{booking.customer.name}</h3>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {bookingDate.toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      {bookingDate.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {endDate.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm font-medium">
                      Rp {booking.service.price.toLocaleString("id-ID")}
                    </p>
                    {booking.customerNotes && (
                      <p className="text-sm text-muted-foreground italic">
                        Catatan: {booking.customerNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {booking.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(booking.id, "CONFIRMED")}
                          disabled={updatingId === booking.id}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Konfirmasi
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(booking.id, "CANCELLED")}
                          disabled={updatingId === booking.id}
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
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Selesai
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(booking.id, "NO_SHOW")}
                          disabled={updatingId === booking.id}
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
