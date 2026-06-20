import Link from "next/link";
import { CalendarDays } from "lucide-react";

export const metadata = {
  title: "BookingApp",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <CalendarDays className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">BookingApp</span>
          </Link>
          <h1 className="text-3xl font-bold mb-4">
            Kelola Bisnis Booking Anda dengan Mudah
          </h1>
          <p className="text-lg opacity-90">
            Platform all-in-one untuk mengelola reservasi, pelanggan, dan layanan bisnis Anda.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm opacity-80">Bisnis Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-sm opacity-80">Booking</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">4.9</p>
              <p className="text-sm opacity-80">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BookingApp</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
