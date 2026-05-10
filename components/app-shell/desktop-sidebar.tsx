import Link from "next/link";
import type { Route } from "next";
import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  ClipboardList,
  Home,
  ImagePlus,
  LogOut,
  Receipt,
  Settings,
  Truck,
  WalletCards
} from "lucide-react";
import { signOut } from "@/features/auth/actions";

const items = [
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

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border/70 bg-card px-4 py-6 md:flex">
      <div className="mb-8">
        <p className="text-sm font-medium text-wood-700">Freelancerinterior</p>
        <h1 className="text-xl font-semibold text-charcoal-900">Operation</h1>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href as Route}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-charcoal-700 transition-colors hover:bg-secondary hover:text-primary"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 border-t border-border/70 pt-4">
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
    </aside>
  );
}
