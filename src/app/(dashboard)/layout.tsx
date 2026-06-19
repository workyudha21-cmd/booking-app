import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b px-6 pl-16 lg:pl-6">
          <div />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
