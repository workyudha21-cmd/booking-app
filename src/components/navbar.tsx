"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">BookingApp</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Fitur
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Harga
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
              >
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push("/login")}>
                Masuk
              </Button>
              <Button onClick={() => router.push("/register")}>
                Daftar Gratis
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
