"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";
import { toast } from "sonner";
import { Camera, Loader2, User, X, Check, ZoomIn } from "lucide-react";
import Image from "next/image";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setForm({
            name: data.name || "",
            phone: data.phone || "",
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        toast.success("Profil berhasil disimpan");
      } else {
        toast.error("Gagal menyimpan profil");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }

    setSaving(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, atau GIF.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    // Create preview URL
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
    if (!selectedFile) return;

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

      // Update profile with new image
      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (updateRes.ok) {
        const updated = await updateRes.json();
        setProfile(updated);
        toast.success("Photo profil berhasil diubah");
        handleCancelPreview();
      } else {
        toast.error("Gagal menyimpan photo profil");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }

    setUploading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password berhasil diubah");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Gagal mengubah password");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }

    setChangingPassword(false);
  };

  if (isPending || loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Gagal memuat profil</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda.</p>
        </div>

        {/* Photo Profil */}
        <div className="rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Photo Profil</h2>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <div 
                className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer"
                onClick={() => {
                  if (previewUrl) return;
                  if (profile.image) {
                    setShowImageModal(true);
                  }
                }}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name || "User"}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              {/* Zoom overlay on hover */}
              {profile.image && !previewUrl && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                >
                  <ZoomIn className="h-6 w-6 text-white" />
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
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
                  {profile.image && (
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
                    JPEG, PNG, WebP, atau GIF. Maksimal 5MB. Klik photo untuk preview.
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Preview photo baru. Klik &quot;Upload&quot; untuk menyimpan atau &quot;Batal&quot; untuk membatalkan.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirmUpload}
                      disabled={uploading}
                    >
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
                    <Button
                      variant="outline"
                      onClick={handleCancelPreview}
                      disabled={uploading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informasi Profil */}
        <div className="rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Profil</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>Bergabung Sejak</Label>
                <Input
                  value={new Date(profile.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </div>

        {/* Ubah Password */}
        <div className="rounded-lg border p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Ubah Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="Masukkan password saat ini"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Ulangi password baru"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Menyimpan..." : "Ubah Password"}
            </Button>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && profile.image && (
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
              src={profile.image}
              alt={profile.name || "User"}
              width={600}
              height={600}
              className="rounded-lg object-contain max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white text-sm mt-2">
              {profile.name || "User"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
