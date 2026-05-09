"use client";

import type { InputHTMLAttributes } from "react";
import { useActionState } from "react";
import { Building2, CreditCard, FileBadge, Languages, Save, Upload } from "lucide-react";
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
              rows={3}
              defaultValue={settings.companyAddress ?? ""}
              className="w-full rounded-md border border-input bg-card px-3 py-3 text-base"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FileUpload id="logo" label="Logo" currentLabel={settings.logoPath ? "Current logo saved" : undefined} />
            <FileUpload id="signature" label="Signature" currentLabel={settings.signaturePath ? "Current signature saved" : undefined} />
          </div>
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
            <Field id="vatRate" label="VAT rate" type="number" step="0.0001" min="0" max="1" defaultValue={settings.vatRate} required />
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
            <Field id="bankAccountName" label="Account name" defaultValue={settings.bankAccountName} />
          </div>
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
              Arabic
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

function FileUpload({ id, label, currentLabel }: { id: string; label: string; currentLabel?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="rounded-md border border-input bg-card p-3">
        <Input id={id} name={id} type="file" accept="image/*" className="border-0 p-0" />
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Upload className="h-3.5 w-3.5" />
          <span>{currentLabel ?? "PNG or JPG"}</span>
        </div>
      </div>
    </div>
  );
}
