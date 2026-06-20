"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CheckCircle,
  Clock,
  MapPin,
  CalendarDays,
  ChevronRight,
  ArrowLeft,
  Star,
  Loader2,
  Store,
  MessageCircle,
  Phone,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const STEPS = [
  { id: 1, title: "Layanan", icon: Star },
  { id: 2, title: "Jadwal", icon: CalendarDays },
  { id: 3, title: "Data Diri", icon: MessageCircle },
];

export default function BookingPage() {
  const params = useParams();
  const slug = params.storeSlug as string;
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

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

  // Initialize map when store has location
  useEffect(() => {
    if (!store?.latitude || !store?.longitude || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([store.latitude!, store.longitude!], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([store.latitude!, store.longitude!]).addTo(map);
      marker.bindPopup(`<b>${store.name}</b><br>${store.address || ''}`).openPopup();

      mapInstanceRef.current = map;
    };

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [store]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        setSelectedTime("");
        try {
          const res = await fetch(
            `/api/public/availability?serviceId=${selectedService.id}&date=${selectedDate}`
          );
          const data = await res.json();
          setTimeSlots(data.slots || []);
        } catch {
          setTimeSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedService, selectedDate]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(3);
  };

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
        customerEmail,
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

  // Get unique categories
  const categories = store
    ? [...new Set(store.services.map((s) => s.category).filter(Boolean))]
    : [];

  // Group services by category
  const servicesByCategory = store
    ? store.services.reduce((acc, service) => {
        const category = service.category || "Lainnya";
        if (!acc[category]) acc[category] = [];
        acc[category].push(service);
        return acc;
      }, {} as Record<string, Service[]>)
    : {};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Store className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">Toko Tidak Ditemukan</h1>
          <p className="text-muted-foreground">{error || "Toko yang Anda cari tidak tersedia."}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">Booking Berhasil!</h1>
            <p className="text-muted-foreground">
              Terima kasih telah melakukan booking di <strong>{store.name}</strong>.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Layanan</span>
              <span className="font-medium text-right">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tanggal</span>
              <span className="font-medium text-right">
                {new Date(selectedDate).toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Waktu</span>
              <span className="font-medium">{selectedTime} WIB</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">
                Rp {selectedService?.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => window.location.reload()}>
              Booking Lagi
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Kami akan menghubungi Anda via WhatsApp untuk konfirmasi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {store.image ? (
                <Image
                  src={store.image}
                  alt={store.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-primary">
                  {store.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">{store.name}</h1>
              {store.address && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {store.address}{store.city ? `, ${store.city}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-1.5 flex-1 justify-center">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-px flex-1 mx-2 ${isCompleted ? "bg-green-300" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Store Location Map */}
      {store.latitude && store.longitude && (
        <div className="border-b bg-muted/30">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="rounded-xl border bg-background overflow-hidden">
              {/* Map Header */}
              <div className="flex items-center gap-2 p-3 border-b bg-muted/50">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Lokasi Toko</span>
              </div>
              
              {/* Map Container */}
              <div 
                ref={mapRef} 
                className="w-full" 
                style={{ height: "200px" }}
              />
              
              {/* Store Info */}
              <div className="p-3 space-y-2">
                {store.address && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>
                      {store.address}
                      {store.city ? `, ${store.city}` : ""}
                      {store.province ? `, ${store.province}` : ""}
                    </span>
                  </p>
                )}
                
                <div className="flex gap-2">
                  {store.phone && (
                    <a
                      href={`https://wa.me/${store.phone.replace(/^0/, "62")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  )}
                  <a
                    href={store.mapsUrl || `https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Rute
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Select Service */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Pilih Layanan</h2>
                {selectedService && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedService(null);
                      setSelectedDate("");
                      setSelectedTime("");
                      setCurrentStep(1);
                    }}
                    className="h-8 text-xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Ubah
                  </Button>
                )}
              </div>

              {selectedService ? (
                <div className="rounded-xl border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{selectedService.name}</p>
                      {selectedService.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {selectedService.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{selectedService.duration} menit</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      Rp {selectedService.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(servicesByCategory).map(([category, services]) => (
                    <div key={category}>
                      {categories.length > 0 && (
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                          {category}
                        </h3>
                      )}
                      <div className="space-y-2">
                        {services.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleServiceSelect(service)}
                            className="w-full rounded-xl border bg-background p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 mr-3">
                                <p className="font-semibold text-sm">{service.name}</p>
                                {service.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {service.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{service.duration} menit</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <p className="text-sm font-bold text-primary">
                                  Rp {service.price.toLocaleString("id-ID")}
                                </p>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {store.services.length === 0 && (
                    <div className="rounded-xl border bg-muted/50 p-8 text-center">
                      <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Belum ada layanan tersedia</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Select Date & Time */}
            {selectedService && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Pilih Jadwal</h2>
                  {selectedDate && selectedTime && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDate("");
                        setSelectedTime("");
                        setCurrentStep(2);
                      }}
                      className="h-8 text-xs"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                      Ubah
                    </Button>
                  )}
                </div>

                {selectedDate && selectedTime ? (
                  <div className="rounded-xl border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {new Date(selectedDate).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">{selectedTime} WIB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border bg-muted/50 p-4 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Tanggal</Label>
                      <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        placeholder="Pilih tanggal booking"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {selectedDate && (
                      <div className="space-y-2">
                        <Label className="text-sm">Waktu Tersedia</Label>
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : timeSlots.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.available}
                                onClick={() => handleTimeSelect(slot.time)}
                                className={`rounded-lg border p-2.5 text-xs font-medium transition-all ${
                                  !slot.available
                                    ? "opacity-30 cursor-not-allowed bg-muted"
                                    : selectedTime === slot.time
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "hover:border-primary/50 hover:bg-primary/5"
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground">
                              Tidak ada slot tersedia
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Customer Info */}
            {selectedService && selectedDate && selectedTime && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold">Data Diri</h2>
                <div className="rounded-xl border bg-muted/50 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm">
                      Nomor WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Untuk konfirmasi booking via WhatsApp
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">Email (Opsional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-sm">Catatan (Opsional)</Label>
                    <textarea
                      id="notes"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Permintaan khusus, alergi, dll..."
                      rows={2}
                      className="w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary & Submit */}
            {selectedService && selectedDate && selectedTime && customerName && customerPhone && (
              <div className="space-y-3 pb-4">
                {/* Booking Summary */}
                <div className="rounded-xl border bg-muted/50 p-4 space-y-2.5">
                  <h3 className="text-sm font-semibold">Ringkasan Booking</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Layanan</span>
                      <span className="font-medium text-right">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Durasi</span>
                      <span className="font-medium">{selectedService.duration} menit</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tanggal</span>
                      <span className="font-medium text-right">
                        {new Date(selectedDate).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Waktu</span>
                      <span className="font-medium">{selectedTime} WIB</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-sm font-semibold">Total</span>
                      <span className="text-base font-bold text-primary">
                        Rp {selectedService.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button - Sticky on mobile */}
                <div className="sticky bottom-0 pt-2 pb-4 bg-background">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Membuat Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Konfirmasi Booking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-3">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Powered by <span className="font-semibold">BookingApp</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
