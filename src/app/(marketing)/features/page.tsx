import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, ConciergeBell, BarChart3, Bell, DollarSign, Users } from "lucide-react";

const features = [
  {
    title: "Booking Online 24/7",
    description: "Pelanggan bisa booking kapan saja tanpa perlu menelepon.",
    icon: CalendarDays,
  },
  {
    title: "Manajemen Layanan",
    description: "Atur layanan, harga, dan durasi dengan mudah.",
    icon: ConciergeBell,
  },
  {
    title: "Kalender Visual",
    description: "Lihat semua jadwal dalam satu tampilan kalender.",
    icon: BarChart3,
  },
  {
    title: "Notifikasi Otomatis",
    description: "Kirim pengingat otomatis ke pelanggan.",
    icon: Bell,
  },
  {
    title: "Laporan Pendapatan",
    description: "Pantau pendapatan dan statistik bisnis.",
    icon: DollarSign,
  },
  {
    title: "Multi-Staff",
    description: "Kelola jadwal beberapa staff sekaligus.",
    icon: Users,
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold">Fitur Lengkap</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola booking bisnis Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-lg border p-6">
                <div className="mb-4 text-primary">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" asChild>
            <Link href="/register">Mulai Gratis Sekarang</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
