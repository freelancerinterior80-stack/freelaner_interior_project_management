"use client";

import { useEffect } from "react";
import { useOfflineStore } from "@/features/offline/store";

export function OfflineSyncManager() {
  const drafts = useOfflineStore((state) => state.drafts);
  const setOnline = useOfflineStore((state) => state.setOnline);
  const markSyncing = useOfflineStore((state) => state.markSyncing);
  const markFailed = useOfflineStore((state) => state.markFailed);
  const removeDraft = useOfflineStore((state) => state.removeDraft);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setOnline]);

  useEffect(() => {
    const queuedDrafts = drafts.filter((draft) => draft.status === "queued");

    if (!navigator.onLine || queuedDrafts.length === 0) {
      return;
    }

    let cancelled = false;

    async function flushDrafts() {
      for (const draft of queuedDrafts) {
        if (cancelled) {
          continue;
        }

        markSyncing(draft.id);
        try {
          const response = await fetch("/api/offline-sync", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(draft)
          });

          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(body?.error ?? "Sync failed.");
          }

          removeDraft(draft.id);
        } catch (error) {
          markFailed(draft.id, error instanceof Error ? error.message : "Sync failed.");
        }
      }
    }

    void flushDrafts();

    return () => {
      cancelled = true;
    };
  }, [drafts, markFailed, markSyncing, removeDraft]);

  return null;
}
