import Link from "next/link";
import { Plus } from "lucide-react";

export function FloatingActionButton() {
  return (
    <Link
      href="/projects/new"
      aria-label="Create project"
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft md:hidden"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
