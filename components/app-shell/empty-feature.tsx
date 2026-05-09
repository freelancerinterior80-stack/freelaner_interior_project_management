import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyFeature({
  icon: Icon,
  title,
  description
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold text-charcoal-900">{title}</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
