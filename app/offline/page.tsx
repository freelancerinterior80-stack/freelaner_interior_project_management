import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OfflineQueue } from "@/features/offline/components/offline-queue";

export default function OfflinePage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-10">
      <div className="mx-auto max-w-md space-y-5">
        <div>
          <p className="text-sm font-medium text-wood-700">Offline</p>
          <h1 className="text-2xl font-semibold text-charcoal-900">Saved on this phone</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Queued work syncs automatically. Failed drafts stay here so you can review, retry, or remove them.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to app</Link>
        </Button>
        <OfflineQueue />
      </div>
    </main>
  );
}
