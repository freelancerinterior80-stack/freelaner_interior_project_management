import { AppShell } from "@/components/app-shell/app-shell";
import { requireUser } from "@/lib/auth/guards";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return <AppShell userName={user.fullName}>{children}</AppShell>;
}
