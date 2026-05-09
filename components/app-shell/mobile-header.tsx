import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileHeader({ userName }: { userName: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Welcome</p>
          <p className="text-sm font-semibold text-charcoal-900">{userName}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
