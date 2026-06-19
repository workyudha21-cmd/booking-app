"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X, LayoutDashboard, CalendarDays, ConciergeBell, Users, Settings, LogOut } from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/services", label: "Layanan", icon: ConciergeBell },
  { href: "/dashboard/customers", label: "Pelanggan", icon: Users },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-6 shrink-0">
        <Link href="/dashboard" className="text-lg font-bold">
          BookingApp
        </Link>
        <button className="lg:hidden" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start"
          onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border rounded-md p-2 shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r bg-sidebar lg:block lg:sticky lg:top-0 lg:h-screen">
        <SidebarContent />
      </aside>
    </>
  );
}
