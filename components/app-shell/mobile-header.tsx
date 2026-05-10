"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  ClipboardList,
  Home,
  ImagePlus,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Truck,
  WalletCards,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { signOut } from "@/features/auth/actions";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/boq", label: "BOQ", icon: ClipboardList },
  { href: "/money", label: "Money", icon: WalletCards },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/materials", label: "Materials", icon: Boxes },
  { href: "/payments", label: "Payments", icon: Truck },
  { href: "/progress", label: "Progress", icon: ImagePlus },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function MobileHeader({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
            <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="border-b border-border/70 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold text-charcoal-900">Menu</SheetTitle>
                <p className="text-xs text-muted-foreground">{userName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <nav className="flex flex-col gap-0.5 p-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-charcoal-700 transition-colors hover:bg-secondary hover:text-primary"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-8 left-0 right-0 px-3">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
