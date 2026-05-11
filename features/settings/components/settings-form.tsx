"use client";

import type { InputHTMLAttributes } from "react";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Building2, CreditCard, FileBadge, Globe, Languages, PenLine, Save, Trash2, Upload } from "lucide-react";
import SignaturePad from "signature_pad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettings, type SettingsActionState } from "@/features/settings/actions";
import type { AppSettings } from "@/features/settings/types";

const initialState: SettingsActionState = { ok: false };

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [state, action, pending] = useActionState(saveSettings, initialState);

  return (
    <form action={action} className="space-y-5">
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-wood-700" />
            Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" defaultValue={settings.companyName} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="companyPhone" label="Phone" defaultValue={settings.companyPhone} />
            <Field id="companyEmail" label="Email" type="email" defaultValue={settings.companyEmail} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <textarea
              id="companyAddress"
              name="companyAddress"
              rows={2}
              defaultValue={settings.companyAddress ?? ""}
              className="w-full rounded-md border border-input bg-card px-3 py-3 text-base"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyWebsite" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-wood-700" /> Website
              </Label>
              <Input id="companyWebsite" name="companyWebsite" defaultValue={settings.companyWebsite ?? ""} placeholder="www.freelancerkw.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyInstagram" className="flex items-center gap-1.5">
                Instagram
              </Label>
              <Input id="companyInstagram" name="companyInstagram" defaultValue={settings.companyInstagram ?? ""} placeholder="@free.lancerinterior" />
            </div>
          </div>
          <Field id="authorizedSignerName" label="Authorized signer name" defaultValue={settings.authorizedSignerName} placeholder="Basir Ahmed" />
          <div className="space-y-2">
            <Label>Logo</Label>
            <FileUpload id="logo" currentLabel={settings.logoPath ? "Current logo saved" : undefined} />
          </div>
          <SignatureField currentUrl={settings.signatureUrl} currentPath={settings.signaturePath} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBadge className="h-5 w-5 text-wood-700" />
            Invoice and tax
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field id="invoicePrefix" label="Invoice prefix" defaultValue={settings.invoicePrefix} required />
            <Field id="quotationPrefix" label="Quote prefix" defaultValue={settings.quotationPrefix} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field id="currency" label="Currency" defaultValue={settings.currency} required />
            <Field id="vatRate" label="VAT rate (0 = no VAT)" type="number" step="0.0001" min="0" max="1" defaultValue={settings.vatRate} required />
          </div>
          <Field id="vatNumber" label="VAT number" defaultValue={settings.vatNumber} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-wood-700" />
            Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="bankName" label="Bank name" defaultValue={settings.bankName} />
            <Field id="bankAccountName" label="Account holder name" defaultValue={settings.bankAccountName} />
          </div>
          <Field id="bankAccountNumber" label="Account number" defaultValue={settings.bankAccountNumber} />
          <Field id="bankIban" label="IBAN" defaultValue={settings.bankIban} />
          <Field id="bankSwift" label="SWIFT" defaultValue={settings.bankSwift} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Default terms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <TextArea id="defaultTermsEn" label="English terms" defaultValue={settings.defaultTermsEn} />
          <TextArea id="defaultTermsAr" label="Arabic terms" defaultValue={settings.defaultTermsAr} dir="rtl" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-wood-700" />
            Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-h-14 items-center gap-3 rounded-md border border-input bg-card px-3 text-sm font-medium">
              <input type="radio" name="preferredLanguage" value="en" defaultChecked={settings.preferredLanguage === "en"} />
              English
            </label>
            <label className="flex min-h-14 items-center gap-3 rounded-md border border-input bg-card px-3 text-sm font-medium">
              <input type="radio" name="preferredLanguage" value="ar" defaultChecked={settings.preferredLanguage === "ar"} />
              Arabic (عربي)
            </label>
          </div>
        </CardContent>
      </Card>

      {state.error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      <Button className="sticky bottom-24 w-full md:static" size="lg" disabled={pending}>
        <Save className="h-4 w-4" />
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}

function SignatureField({ currentUrl, currentPath }: { currentUrl?: string | null; currentPath?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const startDrawing = useCallback(() => {
    setDrawing(true);
    setHasDrawing(false);
    setTimeout(() => {
      if (canvasRef.current) {
        padRef.current = new SignaturePad(canvasRef.current, { penColor: "#171717" });
        padRef.current.addEventListener("endStroke", () => setHasDrawing(true));
      }
    }, 50);
  }, []);

  const clearPad = useCallback(() => {
    padRef.current?.clear();
    setHasDrawing(false);
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";
  }, []);

  const savePad = useCallback(() => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    const dataUrl = padRef.current.toDataURL("image/png");
    // Convert data URL to a File and attach to hidden input via DataTransfer
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "signature.png", { type: "image/png" });
        const dt = new DataTransfer();
        dt.items.add(file);
        if (hiddenInputRef.current) {
          hiddenInputRef.current.files = dt.files;
        }
        setDrawing(false);
        setHasDrawing(true);
      });
  }, []);

  useEffect(() => {
    return () => { padRef.current?.off(); };
  }, []);

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <PenLine className="h-3.5 w-3.5 text-wood-700" /> Signature
      </Label>

      {currentUrl && !drawing ? (
        <div className="rounded-md border border-input bg-card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="Saved signature" className="h-12 object-contain" />
          <button
            type="button"
            onClick={startDrawing}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <PenLine className="h-3 w-3" /> Redraw signature
          </button>
        </div>
      ) : !drawing ? (
        <div className="rounded-md border border-dashed border-input bg-card p-4 text-center">
          <button
            type="button"
            onClick={startDrawing}
            className="flex w-full flex-col items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <PenLine className="h-6 w-6" />
            Draw your signature
          </button>
        </div>
      ) : null}

      {drawing ? (
        <div className="space-y-2 rounded-md border border-input bg-card p-3">
          <p className="text-xs text-muted-foreground">Draw your signature below</p>
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full rounded border border-input bg-white touch-none"
            style={{ cursor: "crosshair" }}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={clearPad}>
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
            <Button type="button" size="sm" onClick={savePad} disabled={!hasDrawing}>
              <Save className="h-3.5 w-3.5" /> Use this signature
            </Button>
          </div>
          {hasDrawing && !drawing ? null : (
            <p className="text-xs text-green-600">
              {hasDrawing ? "Signature ready — click Save settings to apply." : ""}
            </p>
          )}
        </div>
      ) : null}

      {/* Hidden file input — populated from canvas drawing OR kept empty if using existing */}
      <input ref={hiddenInputRef} id="signature" name="signature" type="file" accept="image/*" className="hidden" />
      {!drawing && !currentPath ? (
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="h-3 w-3" />
          <span>Or upload a signature image</span>
          <label htmlFor="signature-upload" className="cursor-pointer underline">Browse</label>
          <input
            id="signature-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && hiddenInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                hiddenInputRef.current.files = dt.files;
              }
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  id,
  label,
  defaultValue,
  ...props
}: {
  id: string;
  label: string;
  defaultValue?: string | number | null;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} defaultValue={defaultValue ?? ""} {...props} />
    </div>
  );
}

function TextArea({
  id,
  label,
  defaultValue,
  dir
}: {
  id: string;
  label: string;
  defaultValue?: string | null;
  dir?: "rtl";
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={id}
        rows={5}
        dir={dir}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-input bg-card px-3 py-3 text-base leading-6"
      />
    </div>
  );
}

function FileUpload({ id, currentLabel }: { id: string; currentLabel?: string }) {
  return (
    <div className="rounded-md border border-input bg-card p-3">
      <Input id={id} name={id} type="file" accept="image/*" className="border-0 p-0" />
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Upload className="h-3.5 w-3.5" />
        <span>{currentLabel ?? "PNG or JPG recommended"}</span>
      </div>
    </div>
  );
}
