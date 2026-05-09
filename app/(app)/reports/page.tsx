import { ReportsScreen } from "@/features/reports/components/reports-screen";
import { getReportData } from "@/features/reports/queries";

export default async function ReportsPage() {
  const data = await getReportData();

  return <ReportsScreen data={data} />;
}
