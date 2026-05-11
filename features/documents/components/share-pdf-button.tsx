"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  exportPath: string; // e.g. "/api/exports/quotation/123"
  number: string;
  kind: "quotation" | "invoice";
  appUrl: string;
}

export function SharePdfButton({ exportPath, number, kind, appUrl }: Props) {
  const [sharing, setSharing] = useState(false);
  const label = kind === "quotation" ? "Quotation" : "Invoice";
  const absoluteUrl = `${appUrl.replace(/\/$/, "")}${exportPath}`;

  async function handleShare() {
    setSharing(true);
    try {
      // Tier 1: share the actual PDF file (Android Chrome, iOS Safari 15.1+)
      const res = await fetch(exportPath);
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `${number}.pdf`, { type: "application/pdf" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${label} ${number}` });
          return;
        }
      }

      // Tier 2: share via native share sheet (URL only — iOS Safari, Android)
      if (typeof navigator.share === "function") {
        await navigator.share({
          url: absoluteUrl,
          title: `${label} ${number}`,
          text: `${label} ${number}`
        });
        return;
      }
    } catch (err) {
      // User dismissed the share sheet — do nothing
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Any other error falls through to the WhatsApp link below
    } finally {
      setSharing(false);
    }

    // Tier 3: open WhatsApp with the document link (desktop / unsupported browsers)
    const text = `${label} ${number}\n${absoluteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <Button variant="secondary" className="w-full" onClick={handleShare} disabled={sharing}>
      <MessageCircle className="h-4 w-4" />
      {sharing ? "Preparing…" : "WhatsApp"}
    </Button>
  );
}
