import { Download, ShieldCheck } from "lucide-react";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppSettings } from "@/features/settings/types";

export function SettingsScreen({ settings }: { settings: AppSettings }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-wood-700">Settings</p>
        <h1 className="text-2xl font-semibold text-charcoal-900">Company setup</h1>
      </div>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-wood-700" />
            Backup
          </CardTitle>
          <CardDescription>Download a private JSON backup of projects, BOQs, invoices, expenses, materials, payments, and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" variant="outline" className="w-full">
            <a href="/api/exports/backup" download>
              <Download className="h-4 w-4" />
              Download backup
            </a>
          </Button>
        </CardContent>
      </Card>

      <SettingsForm settings={settings} />
    </div>
  );
}
