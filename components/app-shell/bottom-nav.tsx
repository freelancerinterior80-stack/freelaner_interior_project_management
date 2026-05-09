"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, ClipboardList, Home, MoreHorizontal, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/boq", label: "BOQ", icon: ClipboardList },
  { href: "/money", label: "Money", icon: WalletCards },
  { href: "/more", label: "More", icon: MoreHorizontal }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 px-2 py-2 shadow-soft backdrop-blur md:hidden">
      <div className="safe-bottom grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-md text-xs font-medium text-muted-foreground transition-colors",
                active && "bg-secondary text-primary"
              )}
            >
              <item.icon className="mb-1 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
