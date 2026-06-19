"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, Phone, Mail, CalendarDays } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  notes: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBookingAt: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/customers")
        .then((res) => res.json())
        .then((data) => setCustomers(data.customers || []))
        .catch(() => setCustomers([]))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (isPending || loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pelanggan</h1>
        <p className="text-muted-foreground">Daftar pelanggan yang pernah melakukan booking.</p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Belum ada pelanggan. Data pelanggan akan muncul setelah ada booking pertama.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Bergabung {new Date(customer.createdAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.lastBookingAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      Terakhir: {new Date(customer.lastBookingAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-2 border-t">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold">{customer.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">Booking</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-lg font-bold">Rp {customer.totalSpent.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground">Total Belanja</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
