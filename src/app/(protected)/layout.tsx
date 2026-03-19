import { UserNav } from "@/components/user-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">KaryaDhara</h1>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
