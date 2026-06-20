"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { LocationPicker } from "@/components/ui/location-picker";
import { toast } from "sonner";
import { Clock, Loader2, Camera, MapPin, X, Check, ZoomIn } from "lucide-react";
import Image from "next/image";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
}

interface WorkingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DAYS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
];

const DEFAULT_WORKING_HOURS: WorkingHour[] = DAYS.map((day) => ({
  dayOfWeek: day.value,
  openTime: "09:00",
  closeTime: "17:00",
  isClosed: day.value === 0,
}));

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    mapsUrl: "",
  });
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(DEFAULT_WORKING_HOURS);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/stores")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const s = data[0];
            setStore(s);
            setForm({
              name: s.name || "",
              phone: s.phone || "",
              email: s.email || "",
              address: s.address || "",
              city: s.city || "",
              province: s.province || "",
              postalCode: s.postalCode || "",
              latitude: s.latitude?.toString() || "",
              longitude: s.longitude?.toString() || "",
              mapsUrl: s.mapsUrl || "",
            });

            fetch(`/api/stores/${s.id}/working-hours`)
              .then((res) => res.json())
              .then((whData) => {
                if (whData.workingHours && whData.workingHours.length > 0) {
                  setWorkingHours(
                    DAYS.map((day) => {
                      const wh = whData.workingHours.find(
                        (w: { dayOfWeek: number }) => w.dayOfWeek === day.value
                      );
                      return wh
                        ? {
                            dayOfWeek: wh.dayOfWeek,
                            openTime: wh.openTime,
                            closeTime: wh.closeTime,
                            isClosed: wh.isClosed,
                          }
                        : {
                            dayOfWeek: day.value,
                            openTime: "09:00",
                            closeTime: "17:00",
                            isClosed: false,
                          };
                    })
                  );
                }
              })
              .catch(() => {});
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setSaving(true);

    const res = await fetch(`/api/stores/${store.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setStore(updated.store);
      toast.success("Profil toko berhasil disimpan");
    } else {
      toast.error("Gagal menyimpan profil toko");
    }

    setSaving(false);
  };

  const handleWorkingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setSavingHours(true);

    const res = await fetch(`/api/stores/${store.id}/working-hours`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workingHours }),
    });

    if (res.ok) {
      toast.success("Jam operasional berhasil disimpan");
    } else {
      toast.error("Gagal menyimpan jam operasional");
    }

    setSavingHours(false);
  };

  const updateWorkingHour = (dayOfWeek: number, field: keyof WorkingHour, value: string | boolean) => {
    setWorkingHours(
      workingHours.map((wh) =>
        wh.dayOfWeek === dayOfWeek ? { ...wh, [field]: value } : wh
      )
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !store) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        toast.error(error.error || "Gagal mengupload gambar");
        setUploading(false);
        return;
      }

      const { url } = await uploadRes.json();

      const updateRes = await fetch(`/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (updateRes.ok) {
        const updated = await updateRes.json();
        setStore(updated.store);
        toast.success("Photo toko berhasil diubah");
        handleCancelPreview();
      } else {
        toast.error("Gagal menyimpan photo toko");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }

    setUploading(false);
  };

  if (isPending || loading) {
    return <LoadingSpinner />;
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Konfigurasi toko dan akun Anda.</p>
        </div>
        <div className="rounded-xl border bg-background p-12 text-center">
          <p className="text-muted-foreground">
            Anda belum memiliki toko.{" "}
            <a href="/dashboard/store/create" className="text-primary hover:underline font-medium">
              Buat toko sekarang
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Konfigurasi toko dan akun Anda.</p>
        </div>

        {/* Store Photo */}
        <div className="rounded-xl border bg-background p-6 space-y-6">
          <h2 className="text-lg font-semibold">Photo Toko</h2>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <div
                className="h-32 w-32 rounded-xl overflow-hidden bg-muted flex items-center justify-center cursor-pointer"
                onClick={() => {
                  if (previewUrl) return;
                  if (store.image) {
                    setShowImageModal(true);
                  }
                }}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : store.image ? (
                  <Image
                    src={store.image}
                    alt={store.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              {store.image && !previewUrl && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                >
                  <ZoomIn className="h-6 w-6 text-white" />
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!previewUrl ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Ubah Photo
                  </Button>
                  {store.image && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => setShowImageModal(true)}
                    >
                      <ZoomIn className="mr-2 h-4 w-4" />
                      Lihat Photo
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG, PNG, WebP, atau GIF. Maksimal 5MB.
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Preview photo baru. Klik &quot;Upload&quot; untuk menyimpan atau &quot;Batal&quot; untuk membatalkan.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleConfirmUpload} disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancelPreview} disabled={uploading}>
                      <X className="mr-2 h-4 w-4" />
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Profile */}
        <div className="rounded-xl border bg-background p-6 space-y-6">
          <h2 className="text-lg font-semibold">Profil Toko</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nama Toko</Label>
                <Input
                  id="storeName"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Toko Anda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@toko.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi</Label>
                <Input
                  id="province"
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="DKI Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kode Pos</Label>
                <Input
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="12345"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Profil Toko"
              )}
            </Button>
          </form>
        </div>

        {/* Location & Maps */}
        <div className="rounded-xl border bg-background p-6 space-y-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Lokasi & Maps</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Atur lokasi toko Anda untuk memudahkan pelanggan menemukan toko Anda.
          </p>

          <div className="space-y-4">
            <LocationPicker
              latitude={form.latitude ? parseFloat(form.latitude) : null}
              longitude={form.longitude ? parseFloat(form.longitude) : null}
              onLocationChange={(lat, lng) => {
                setForm({
                  ...form,
                  latitude: lat.toString(),
                  longitude: lng.toString(),
                });
              }}
              onAddressChange={(addressData) => {
                setForm({
                  ...form,
                  address: addressData.address || form.address,
                  city: addressData.city || form.city,
                  province: addressData.province || form.province,
                  postalCode: addressData.postalCode || form.postalCode,
                });
                toast.success("Alamat terisi otomatis dari maps");
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="mapsUrl">Google Maps URL (Opsional)</Label>
              <Input
                id="mapsUrl"
                value={form.mapsUrl}
                onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste link Google Maps untuk memudahkan pelanggan menemukan lokasi Anda.
              </p>
            </div>

            <Button type="button" onClick={handleSubmit} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Lokasi"
              )}
            </Button>
          </div>
        </div>

        {/* Working Hours */}
        <div className="rounded-xl border bg-background p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Jam Operasional</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Atur jam kerja toko Anda. Pelanggan hanya bisa booking pada jam yang tersedia.
          </p>

          <form onSubmit={handleWorkingHoursSubmit} className="space-y-4">
            <div className="space-y-3">
              {DAYS.map((day) => {
                const wh = workingHours.find((w) => w.dayOfWeek === day.value);
                return (
                  <div
                    key={day.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-center gap-3 sm:w-28">
                      <input
                        type="checkbox"
                        checked={wh ? !wh.isClosed : true}
                        onChange={(e) =>
                          updateWorkingHour(day.value, "isClosed", !e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </div>

                    {wh && !wh.isClosed ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={wh.openTime}
                          onChange={(e) =>
                            updateWorkingHour(day.value, "openTime", e.target.value)
                          }
                          className="w-full sm:w-32"
                        />
                        <span className="text-sm text-muted-foreground shrink-0">-</span>
                        <Input
                          type="time"
                          value={wh.closeTime}
                          onChange={(e) =>
                            updateWorkingHour(day.value, "closeTime", e.target.value)
                          }
                          className="w-full sm:w-32"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">Tutup</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button type="submit" disabled={savingHours}>
              {savingHours ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Jam Operasional"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && store.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setShowImageModal(false)}
            >
              <X className="h-8 w-8" />
            </button>
            <Image
              src={store.image}
              alt={store.name}
              width={600}
              height={600}
              className="rounded-lg object-contain max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white text-sm mt-2">{store.name}</p>
          </div>
        </div>
      )}
    </>
  );
}
