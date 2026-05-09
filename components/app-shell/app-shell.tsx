import { MobileHeader } from "@/components/app-shell/mobile-header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { DesktopSidebar } from "@/components/app-shell/desktop-sidebar";
import { FloatingActionButton } from "@/components/app-shell/floating-action-button";
import { OfflineStatus } from "@/features/offline/components/offline-status";
import { OfflineSyncManager } from "@/features/offline/components/offline-sync-manager";

export function AppShell({
  children,
  userName
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <MobileHeader userName={userName} />
      <DesktopSidebar />
      <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-28 pt-20 md:pl-72 md:pr-8 md:pt-8">
        {children}
      </main>
      <OfflineSyncManager />
      <OfflineStatus />
      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
