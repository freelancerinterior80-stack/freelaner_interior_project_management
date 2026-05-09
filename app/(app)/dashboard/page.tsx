import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { getDashboardData } from "@/features/dashboard/queries";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardScreen data={data} />;
}
