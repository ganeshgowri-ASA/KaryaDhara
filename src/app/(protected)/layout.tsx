import { UserNav } from "@/components/user-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchDialog } from "@/components/search/search-dialog";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <h1 className="text-lg font-semibold">KaryaDhara</h1>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
      <SearchDialog />
    </div>
  );
}
