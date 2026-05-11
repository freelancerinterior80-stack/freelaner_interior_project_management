"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-charcoal-900">Page error</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {error.message || "Something went wrong loading this page."}
      </p>
      {error.digest ? (
        <p className="mt-1 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
        <Button asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
