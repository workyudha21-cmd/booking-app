"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
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
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
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
      body: JSON.stringify(form),
    });

    if (res.ok) {
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

  if (isPending || loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Konfigurasi toko dan akun Anda.</p>
        </div>
        <div className="rounded-lg border p-6 sm:p-12 text-center">
          <p className="text-muted-foreground">
            Anda belum memiliki toko.{" "}
            <a href="/dashboard/store/create" className="text-primary hover:underline">
              Buat toko sekarang
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi toko dan akun Anda.</p>
      </div>

      {/* Profil Toko */}
      <div className="rounded-lg border p-4 sm:p-6 space-y-4 sm:space-y-6">
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
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Menyimpan..." : "Simpan Profil Toko"}
          </Button>
        </form>
      </div>

      {/* Jam Operasional */}
      <div className="rounded-lg border p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
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
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2 sm:w-28">
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

          <Button type="submit" disabled={savingHours} className="w-full sm:w-auto">
            {savingHours ? "Menyimpan..." : "Simpan Jam Operasional"}
          </Button>
        </form>
      </div>
    </div>
  );
}
