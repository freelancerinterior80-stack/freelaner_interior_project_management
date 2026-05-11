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

  async function handleShare() {
    setSharing(true);
    let sharedViaFile = false;
    try {
      const res = await fetch(exportPath);
      if (res.ok) {
        const blob = await res.blob();
        const file = new File([blob], `${number}.pdf`, { type: "application/pdf" });
        if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${label} ${number}` });
          sharedViaFile = true;
          return;
        }
      }
    } catch (err) {
      // AbortError = user cancelled the share sheet — do nothing
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Other errors (fetch failed, share failed) → fall through to link fallback
    } finally {
      setSharing(false);
    }
    if (sharedViaFile) return;
    // Fallback: send an absolute link via WhatsApp text
    const absoluteUrl = `${appUrl.replace(/\/$/, "")}${exportPath}`;
    const text = `${label} ${number}\n${absoluteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <Button variant="secondary" className="w-full" onClick={handleShare} disabled={sharing}>
      <MessageCircle className="h-4 w-4" />
      {sharing ? "Preparing PDF…" : "WhatsApp"}
    </Button>
  );
}
