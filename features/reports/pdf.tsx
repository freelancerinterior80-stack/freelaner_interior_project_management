import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReportData } from "@/features/reports/types";
import type { AppSettings } from "@/features/settings/types";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    color: "#171717",
    fontSize: 10
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
    borderBottom: "1px solid #d8c9b5",
    paddingBottom: 16,
    marginBottom: 18
  },
  logo: {
    width: 72,
    height: 42,
    objectFit: "contain",
    marginBottom: 8
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
    color: "#6f4926"
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 700
  },
  muted: {
    color: "#65605a"
  },
  right: {
    textAlign: "right"
  },
  grid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  metric: {
    flex: 1,
    backgroundColor: "#fbf7f0",
    padding: 10
  },
  metricLabel: {
    color: "#65605a",
    marginBottom: 4
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 700
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: "#6f4926"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottom: "1px solid #eee7dd",
    paddingVertical: 7
  },
  name: {
    width: "38%"
  },
  small: {
    width: "20%",
    textAlign: "right"
  }
});

export function ReportPdf({ data, settings }: { data: ReportData; settings?: AppSettings }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {settings?.logoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={settings.logoUrl} style={styles.logo} />
            ) : null}
            <Text style={styles.brand}>{settings?.companyName || "Freelancerinterior Operation"}</Text>
            {settings?.companyAddress ? <Text style={styles.muted}>{settings.companyAddress}</Text> : null}
            {settings?.companyPhone ? <Text style={styles.muted}>Phone: {settings.companyPhone}</Text> : null}
            {settings?.companyEmail ? <Text style={styles.muted}>Email: {settings.companyEmail}</Text> : null}
          </View>
          <View style={styles.right}>
            <Text style={styles.title}>Business Snapshot</Text>
            <Text style={styles.muted}>Generated: {new Date(data.generatedAt).toLocaleDateString("en")}</Text>
            {settings?.vatNumber ? <Text style={styles.muted}>VAT: {settings.vatNumber}</Text> : null}
          </View>
        </View>

        <View style={styles.grid}>
          <Metric label="Income" value={money(data.totals.income, settings?.currency)} />
          <Metric label="Expense" value={money(data.totals.expense, settings?.currency)} />
          <Metric label="Profit" value={money(data.totals.profit, settings?.currency)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Profit</Text>
          {data.projectSummaries.map((project) => (
            <View key={project.id} style={styles.row}>
              <Text style={styles.name}>{project.name}</Text>
              <Text style={styles.small}>{project.progressPercent}%</Text>
              <Text style={styles.small}>{money(project.expense, settings?.currency)}</Text>
              <Text style={styles.small}>{money(project.profit, settings?.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          {data.expenseByCategory.map((category) => (
            <View key={category.label} style={styles.row}>
              <Text>{category.label}</Text>
              <Text>{money(category.value, settings?.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Low Stock Materials</Text>
          {data.lowStockMaterials.length === 0 ? <Text style={styles.muted}>No low stock materials.</Text> : null}
          {data.lowStockMaterials.map((material) => (
            <View key={material.id} style={styles.row}>
              <Text>{material.name}</Text>
              <Text>
                {material.currentStock}/{material.threshold}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function money(value: number, currency = "KWD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KWD" ? 3 : 2
  }).format(value);
}
