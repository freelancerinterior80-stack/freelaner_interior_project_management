export type ProgressFileKind = "image" | "video" | "pdf" | "excel" | "other";

export type ProgressFile = {
  id: string;
  kind: ProgressFileKind;
  fileName: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  storagePath?: string | null;
  url?: string | null;
};

export type ProgressUpdate = {
  id: string;
  projectId: string;
  projectName: string;
  clientName?: string | null;
  progressPercent?: number | null;
  note?: string | null;
  updateDate: string;
  files: ProgressFile[];
};
