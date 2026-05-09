import { Camera, FileText, Image as ImageIcon, Play, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import type { ProgressFile, ProgressUpdate } from "@/features/progress/types";

export function ProgressTimeline({ updates }: { updates: ProgressUpdate[] }) {
  if (updates.length === 0) {
    return (
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No site updates yet. Add today&apos;s photos and note from your phone.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {updates.map((update) => (
        <Card key={update.id} className="border-0 shadow-soft">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-wood-700">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-900">{update.projectName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {update.clientName ?? "Client"} - {formatDate(update.updateDate)}
                  </p>
                </div>
              </div>
              {typeof update.progressPercent === "number" ? <Badge variant="success">{update.progressPercent}%</Badge> : null}
            </div>

            {typeof update.progressPercent === "number" ? <Progress value={update.progressPercent} /> : null}
            {update.note ? <p className="rounded-md bg-secondary p-3 text-sm leading-6 text-charcoal-700">{update.note}</p> : null}
            {update.files.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {update.files.map((file) => (
                  <MediaTile key={file.id} file={file} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MediaTile({ file }: { file: ProgressFile }) {
  if (file.kind === "image" && file.url) {
    return (
      <a href={file.url} target="_blank" className="relative aspect-[4/3] overflow-hidden rounded-md bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={file.url} alt={file.fileName} className="h-full w-full object-cover" />
      </a>
    );
  }

  const Icon = file.kind === "video" ? Play : file.kind === "image" ? ImageIcon : file.kind === "pdf" ? FileText : UploadCloud;
  const content = (
    <div className="flex aspect-[4/3] flex-col justify-between rounded-md bg-secondary p-3 text-sm">
      <Icon className="h-5 w-5 text-wood-700" />
      <span className="line-clamp-2 text-xs font-medium text-charcoal-900">{file.fileName}</span>
    </div>
  );

  return file.url ? (
    <a href={file.url} target="_blank">
      {content}
    </a>
  ) : (
    content
  );
}
