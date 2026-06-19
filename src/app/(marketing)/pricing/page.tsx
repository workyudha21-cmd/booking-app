import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Cocok untuk mencoba",
    features: [
      "1 Toko",
      "5 Layanan",
      "10 Booking/bulan",
      "Link booking publik",
    ],
    cta: "Mulai Gratis",
  },
  {
    name: "Pro",
    price: "Rp 149.000",
    period: "/bulan",
    description: "Untuk bisnis yang berkembang",
    features: [
      "3 Toko",
      "Unlimited Layanan",
      "Unlimited Booking",
      "Notifikasi WhatsApp",
      "Laporan pendapatan",
      "Domain custom",
    ],
    cta: "Upgrade ke Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Rp 499.000",
    period: "/bulan",
    description: "Untuk bisnis besar",
    features: [
      "Unlimited Toko",
      "Unlimited Layanan",
      "Unlimited Booking",
      "Multi-staff",
      "API access",
      "Priority support",
      "White-label",
    ],
    cta: "Hubungi Kami",
  },
];

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">Harga yang Transparan</h1>
          <p className="text-muted-foreground mt-2">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-8 ${
                plan.popular ? "border-primary shadow-lg relative" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Paling Populer
                </span>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <span className="mr-2 text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-8"
                variant={plan.popular ? "default" : "outline"}
                asChild
              >
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
