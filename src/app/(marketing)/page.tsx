import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Mudah Digunakan",
    description: "Interface sederhana yang tidak memerlukan pelatihan khusus.",
    icon: Sparkles,
  },
  {
    title: "Real-time Booking",
    description: "Pelanggan bisa booking kapan saja, 24/7.",
    icon: Clock,
  },
  {
    title: "Laporan Lengkap",
    description: "Pantau pendapatan dan statistik bisnis Anda.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Kelola Booking Bisnis Anda{" "}
              <span className="text-primary">Lebih Mudah</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Solusi booking online untuk salon, klinik, bengkel, dan bisnis jasa lainnya.
              Tingkatkan produktivitas dan kepuasan pelanggan.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Mulai Gratis</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Lihat Fitur</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kenapa BookingApp?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border p-6 text-center"
                >
                  <div className="mb-4 text-primary">
                    <Icon className="h-10 w-10 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Memulai?</h2>
          <p className="text-muted-foreground mb-8">
            Daftar sekarang dan kelola booking bisnis Anda dengan mudah.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Daftar Gratis Sekarang</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
