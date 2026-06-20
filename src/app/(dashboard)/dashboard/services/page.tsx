"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, X, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", duration: "30", price: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchServices = () => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (session) {
      fetchServices();
    }
  }, [session]);

  const resetForm = () => {
    setForm({ name: "", duration: "30", price: "", description: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      duration: String(service.duration),
      price: String(service.price),
      description: service.description || "",
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        duration: parseInt(form.duration),
        price: parseInt(form.price),
        description: form.description,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setServices([...services, data.service]);
      resetForm();
      toast.success("Layanan berhasil ditambahkan");
    } else {
      toast.error("Gagal menambahkan layanan");
    }

    setSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);

    const res = await fetch(`/api/services/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        duration: parseInt(form.duration),
        price: parseInt(form.price),
        description: form.description,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setServices(services.map((s) => (s.id === editingId ? data.service : s)));
      resetForm();
      toast.success("Layanan berhasil diperbarui");
    } else {
      toast.error("Gagal memperbarui layanan");
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await fetch(`/api/services/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setServices(services.filter((s) => s.id !== deleteId));
      toast.success("Layanan berhasil dihapus");
    } else {
      toast.error("Gagal menghapus layanan");
    }
    setDeleteId(null);
  };

  if (isPending || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Layanan</h1>
          <p className="text-muted-foreground">Kelola layanan yang tersedia.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? (
            <><X className="mr-2 h-4 w-4" /> Batal</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> Tambah Layanan</>
          )}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="rounded-xl border bg-background p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit Layanan" : "Tambah Layanan Baru"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Layanan</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Potong Rambut"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Durasi (menit)</Label>
              <Input
                id="duration"
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                min="5"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="50000"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi layanan"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : editingId ? "Update" : "Simpan"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="rounded-xl border bg-background p-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Belum ada layanan. Tambahkan layanan pertama Anda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-xl border bg-background p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.duration} menit</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">
                  Rp {service.price.toLocaleString("id-ID")}
                </span>
              </div>
              {service.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(service)}
                >
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(service.id)}
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Layanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
