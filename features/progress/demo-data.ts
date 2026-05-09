import type { ProgressUpdate } from "@/features/progress/types";

export const demoProgressUpdates: ProgressUpdate[] = [
  {
    id: "demo-progress-1",
    projectId: "demo-villa-fit-out",
    projectName: "Villa Fit-out",
    clientName: "Ahmed Al Saud",
    progressPercent: 65,
    note: "Ceiling frame completed in majlis and gypsum boards delivered to site.",
    updateDate: "2026-05-09",
    files: [
      {
        id: "demo-file-1",
        kind: "image",
        fileName: "majlis-ceiling.jpg",
        mimeType: "image/jpeg"
      },
      {
        id: "demo-file-2",
        kind: "video",
        fileName: "site-walkthrough.mp4",
        mimeType: "video/mp4"
      }
    ]
  },
  {
    id: "demo-progress-2",
    projectId: "demo-office-interior",
    projectName: "Office Interior",
    clientName: "Noura Studio",
    progressPercent: 30,
    note: "Client approved reception wall direction. Waiting on BOQ sign-off before procurement.",
    updateDate: "2026-05-08",
    files: [
      {
        id: "demo-file-3",
        kind: "image",
        fileName: "reception-wall.jpg",
        mimeType: "image/jpeg"
      }
    ]
  }
];
