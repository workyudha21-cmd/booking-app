"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreateStorePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat toko");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Terjadi kesalahan");
      setLoading(false);
    }
  };

  if (isPending) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buat Toko Anda</h1>
        <p className="text-muted-foreground">Isi informasi dasar toko Anda untuk memulai.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border p-6 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nama Toko *</Label>
          <Input
            id="name"
            placeholder="Contoh: Salon Cantik"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Link Booking *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">/b/</span>
            <Input
              id="slug"
              placeholder="salon-cantik"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Link unik untuk halaman booking Anda</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Input
            id="description"
            placeholder="Deskripsi singkat tentang toko Anda"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@toko.com"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat</Label>
          <Input
            id="address"
            placeholder="Alamat lengkap"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              placeholder="Jakarta"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>
            <Input
              id="province"
              placeholder="DKI Jakarta"
              value={form.province}
              onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Kode Pos</Label>
            <Input
              id="postalCode"
              placeholder="12345"
              value={form.postalCode}
              onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Membuat toko..." : "Buat Toko"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
