import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <FileQuestion className="h-12 w-12 text-wood-700" />
      <h1 className="mt-4 text-xl font-semibold text-charcoal-900">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page does not exist or was removed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>
      </Button>
    </div>
  );
}
