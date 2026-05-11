"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h1 className="mt-4 text-xl font-semibold text-charcoal-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      {error.digest ? (
        <p className="mt-1 font-mono text-xs text-muted-foreground">ID: {error.digest}</p>
      ) : null}
      <Button className="mt-6" onClick={reset}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
