import { SettingsScreen } from "@/features/settings/components/settings-screen";
import { getSettings } from "@/features/settings/queries";

export default async function SettingsPage() {
  const settings = await getSettings();

  return <SettingsScreen settings={settings} />;
}
