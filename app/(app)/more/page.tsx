import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Boxes, ImagePlus, LogOut, Settings, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "@/features/auth/actions";

const items = [
  { href: "/materials", label: "Materials", icon: Boxes },
  { href: "/payments", label: "Payments", icon: Truck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/progress", label: "Progress", icon: ImagePlus },
  { href: "/settings", label: "Settings", icon: Settings }
];

export default function MorePage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">More</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Tools</h1>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href as Route}>
            <Card className="border-0 shadow-soft">
              <CardContent className="flex h-28 flex-col justify-between p-4">
                <item.icon className="h-6 w-6 text-wood-700" />
                <span className="text-sm font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
        <form action={signOut} className="contents">
          <button type="submit" className="text-left">
            <Card className="border-0 shadow-soft hover:border-destructive/30 transition-colors">
              <CardContent className="flex h-28 flex-col justify-between p-4">
                <LogOut className="h-6 w-6 text-destructive" />
                <span className="text-sm font-medium text-destructive">Log out</span>
              </CardContent>
            </Card>
          </button>
        </form>
      </div>
    </div>
  );
}
