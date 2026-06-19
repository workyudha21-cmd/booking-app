"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  description: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingPage() {
  const params = useParams();
  const slug = params.storeSlug as string;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/public/stores/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Store not found");
        return res.json();
      })
      .then((data) => setStore(data.store))
      .catch(() => setError("Toko tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetch(
        `/api/public/availability?serviceId=${selectedService.id}&date=${selectedDate}`
      )
        .then((res) => res.json())
        .then((data) => setTimeSlots(data.slots || []))
        .catch(() => setTimeSlots([]));
    }
  }, [selectedService, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);

    const res = await fetch("/api/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeSlug: slug,
        serviceId: selectedService.id,
        date: `${selectedDate}T${selectedTime}:00`,
        customerName,
        customerPhone,
        notes: customerNotes,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      toast.success("Booking berhasil dibuat!");
    } else {
      const data = await res.json();
      toast.error(data.error || "Gagal membuat booking");
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">{error || "Toko tidak ditemukan"}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-8 text-center">
          <div className="text-4xl mb-4 text-green-500"><CheckCircle className="h-16 w-16 mx-auto" /></div>
          <h1 className="text-2xl font-bold mb-2">Booking Berhasil!</h1>
          <p className="text-muted-foreground mb-6">
            Kami akan menghubungi Anda untuk konfirmasi.
          </p>
          <Button onClick={() => window.location.reload()}>Booking Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{store.name}</h1>
          {store.description && (
            <p className="text-muted-foreground mt-2">{store.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Select Service */}
          <div className="rounded-lg border bg-background p-6">
            <h2 className="text-lg font-semibold mb-4">1. Pilih Layanan</h2>
            <div className="space-y-3">
              {store.services.map((service) => (
                <label
                  key={service.id}
                  className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${
                    selectedService?.id === service.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={selectedService?.id === service.id}
                      onChange={() => setSelectedService(service)}
                      className="h-4 w-4"
                    />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.duration} menit
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    Rp {service.price.toLocaleString("id-ID")}
                  </p>
                </label>
              ))}
              {store.services.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Belum ada layanan tersedia
                </p>
              )}
            </div>
          </div>

          {/* Step 2: Select Date & Time */}
          {selectedService && (
            <div className="rounded-lg border bg-background p-6">
              <h2 className="text-lg font-semibold mb-4">2. Pilih Jadwal</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                    required
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Waktu</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-md border p-2 text-sm transition-colors ${
                            !slot.available
                              ? "opacity-50 cursor-not-allowed"
                              : selectedTime === slot.time
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                    {timeSlots.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Tidak ada slot tersedia
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Customer Info */}
          {selectedService && selectedDate && selectedTime && (
            <div className="rounded-lg border bg-background p-6">
              <h2 className="text-lg font-semibold mb-4">3. Data Diri</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Input
                    id="notes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Permintaan khusus..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          {selectedService && selectedDate && selectedTime && customerName && customerPhone && (
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Membuat Booking..." : "Konfirmasi Booking"}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
