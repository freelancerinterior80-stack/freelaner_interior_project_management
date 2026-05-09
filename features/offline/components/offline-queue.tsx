"use client";

import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useOfflineStore, type OfflineDraft } from "@/features/offline/store";

export function OfflineQueue() {
  const drafts = useOfflineStore((state) => state.drafts);
  const markQueued = useOfflineStore((state) => state.markQueued);
  const removeDraft = useOfflineStore((state) => state.removeDraft);

  if (drafts.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4 text-sm text-muted-foreground">No offline drafts on this device.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <Card key={draft.id} className="border-0 shadow-soft">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-wood-700">
                  {draft.status === "failed" ? <AlertTriangle className="h-5 w-5 text-amber-700" /> : <Clock3 className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-charcoal-900">{draft.label}</p>
                    <StatusBadge status={draft.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {draft.kind.replace("_", " ")} - {formatDate(draft.createdAt)}
                  </p>
                  {draft.error ? <p className="mt-1 text-sm text-destructive">{draft.error}</p> : null}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Remove draft" onClick={() => removeDraft(draft.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <DraftDetails draft={draft} />
            {draft.status === "failed" ? (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={() => markQueued(draft.id)}>
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                <Button variant="outline" onClick={() => removeDraft(draft.id)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: OfflineDraft["status"] }) {
  if (status === "failed") {
    return <Badge variant="warning">Needs review</Badge>;
  }
  if (status === "syncing") {
    return <Badge variant="secondary">Syncing</Badge>;
  }
  return <Badge variant="outline">Queued</Badge>;
}

function DraftDetails({ draft }: { draft: OfflineDraft }) {
  const entries = Object.entries(draft.payload).filter(([, value]) => value !== undefined && value !== "");

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md bg-secondary p-3 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-3 py-1">
          <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span>
          <span className="max-w-[60%] break-words text-right font-medium text-charcoal-900">{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
