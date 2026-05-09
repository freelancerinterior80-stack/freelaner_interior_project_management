"use client";

import { CloudOff, RefreshCw } from "lucide-react";
import { useOfflineStore } from "@/features/offline/store";

export function OfflineStatus() {
  const online = useOfflineStore((state) => state.online);
  const drafts = useOfflineStore((state) => state.drafts);
  const failedCount = drafts.filter((draft) => draft.status === "failed").length;
  const queuedCount = drafts.filter((draft) => draft.status !== "failed").length;

  if (online && drafts.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-44 z-40 rounded-md bg-charcoal-900 px-4 py-3 text-sm text-white shadow-soft md:left-auto md:right-6 md:top-6 md:bottom-auto md:w-80">
      <div className="flex items-center gap-3">
        {online ? <RefreshCw className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
        <div>
          <p className="font-medium">{failedCount > 0 ? "Review offline drafts" : online ? "Syncing queued work" : "Offline mode"}</p>
          <p className="text-xs text-white/75">
            {failedCount > 0 ? `${failedCount} need review` : `${queuedCount} saved on this device`}
          </p>
        </div>
      </div>
    </div>
  );
}
