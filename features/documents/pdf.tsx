import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Boq } from "@/features/boq/types";
import type { DocumentItem, Invoice, Quotation } from "@/features/documents/types";
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
  section: {
    marginBottom: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottom: "1px solid #eee7dd",
    paddingVertical: 7
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3eadb",
    padding: 8,
    fontWeight: 700
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee7dd",
    padding: 8
  },
  desc: {
    width: "48%"
  },
  small: {
    width: "13%",
    textAlign: "right"
  },
  totals: {
    marginLeft: "auto",
    width: "45%",
    marginTop: 12
  },
  totalText: {
    fontSize: 14,
    fontWeight: 700
  },
  terms: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fbf7f0",
    lineHeight: 1.5
  },
  footerGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18
  },
  footerBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fbf7f0",
    lineHeight: 1.5
  },
  signature: {
    width: 120,
    height: 48,
    objectFit: "contain",
    marginTop: 8
  }
});

export function BoqPdf({ boq, settings }: { boq: Boq; settings?: AppSettings }) {
  const items = [...boq.categories.flatMap((category) => category.items), ...boq.ungroupedItems];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header title="Bill of Quantities" number={boq.name} client={boq.clientName} project={boq.projectName} settings={settings} />
        <ItemsTable items={items} />
        <Totals
          rows={[["Subtotal", money(boq.subtotal, settings?.currency)]]}
          finalLabel="BOQ Total"
          finalValue={money(boq.subtotal, settings?.currency)}
        />
        {boq.notes ? <Text style={styles.terms}>{boq.notes}</Text> : null}
        <Signature settings={settings} />
      </Page>
    </Document>
  );
}

export function QuotationPdf({ quotation, settings }: { quotation: Quotation; settings?: AppSettings }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header
          title="Quotation"
          number={quotation.quotationNumber}
          client={quotation.clientName}
          project={quotation.projectName}
          settings={settings}
        />
        <ItemsTable items={quotation.items} currency={settings?.currency} />
        <Totals
          rows={[
            ["Subtotal", money(quotation.subtotal, settings?.currency)],
            ["Discount", money(quotation.discountAmount, settings?.currency)],
            [`VAT ${Math.round(quotation.vatRate * 100)}%`, money(quotation.vatAmount, settings?.currency)]
          ]}
          finalLabel="Quotation Total"
          finalValue={money(quotation.total, settings?.currency)}
        />
        <Terms en={quotation.termsEn ?? settings?.defaultTermsEn} ar={quotation.termsAr ?? settings?.defaultTermsAr} />
        <Signature settings={settings} />
      </Page>
    </Document>
  );
}

export function InvoicePdf({ invoice, settings }: { invoice: Invoice; settings?: AppSettings }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header
          title="Invoice"
          number={invoice.invoiceNumber}
          client={invoice.clientName}
          project={invoice.projectName}
          settings={settings}
        />
        <ItemsTable items={invoice.items} currency={settings?.currency} />
        <Totals
          rows={[
            ["Subtotal", money(invoice.subtotal, settings?.currency)],
            ["Discount", money(invoice.discountAmount, settings?.currency)],
            [`VAT ${Math.round(invoice.vatRate * 100)}%`, money(invoice.vatAmount, settings?.currency)],
            ["Paid", money(invoice.paidAmount, settings?.currency)]
          ]}
          finalLabel="Balance Due"
          finalValue={money(invoice.balanceDue, settings?.currency)}
        />
        <View style={styles.footerGrid}>
          <BankDetails settings={settings} />
          <Signature settings={settings} />
        </View>
        <Terms en={invoice.termsEn ?? settings?.defaultTermsEn} ar={invoice.termsAr ?? settings?.defaultTermsAr} />
      </Page>
    </Document>
  );
}

function Header({
  title,
  number,
  client,
  project,
  settings
}: {
  title: string;
  number: string;
  client?: string | null;
  project?: string | null;
  settings?: AppSettings;
}) {
  return (
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
        {settings?.vatNumber ? <Text style={styles.muted}>VAT: {settings.vatNumber}</Text> : null}
      </View>
      <View style={styles.right}>
        <Text style={styles.title}>
          {title} - {number}
        </Text>
        <Text style={styles.muted}>Project: {project ?? "Not assigned"}</Text>
        <Text style={styles.muted}>Client: {client ?? "Not assigned"}</Text>
      </View>
    </View>
  );
}

function ItemsTable({ items, currency }: { items: DocumentItem[]; currency?: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.tableHeader}>
        <Text style={styles.desc}>Description</Text>
        <Text style={styles.small}>Qty</Text>
        <Text style={styles.small}>Unit</Text>
        <Text style={styles.small}>Rate</Text>
        <Text style={styles.small}>Total</Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.small}>{item.quantity}</Text>
          <Text style={styles.small}>{item.unit.toUpperCase()}</Text>
          <Text style={styles.small}>{money(item.unitRate, currency)}</Text>
          <Text style={styles.small}>{money(item.total, currency)}</Text>
        </View>
      ))}
    </View>
  );
}

function Totals({
  rows,
  finalLabel,
  finalValue
}: {
  rows: [string, string][];
  finalLabel: string;
  finalValue: string;
}) {
  return (
    <View style={styles.totals}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text>{label}</Text>
          <Text>{value}</Text>
        </View>
      ))}
      <View style={styles.row}>
        <Text style={styles.totalText}>{finalLabel}</Text>
        <Text style={styles.totalText}>{finalValue}</Text>
      </View>
    </View>
  );
}

function BankDetails({ settings }: { settings?: AppSettings }) {
  if (!settings?.bankName && !settings?.bankIban && !settings?.bankAccountName) {
    return null;
  }

  return (
    <View style={styles.footerBox}>
      <Text>Bank details</Text>
      {settings.bankName ? <Text>{settings.bankName}</Text> : null}
      {settings.bankAccountName ? <Text>{settings.bankAccountName}</Text> : null}
      {settings.bankIban ? <Text>IBAN: {settings.bankIban}</Text> : null}
      {settings.bankSwift ? <Text>SWIFT: {settings.bankSwift}</Text> : null}
    </View>
  );
}

function Signature({ settings }: { settings?: AppSettings }) {
  if (!settings?.signatureUrl) {
    return (
      <View style={styles.footerBox}>
        <Text>Authorized signature</Text>
      </View>
    );
  }

  return (
    <View style={styles.footerBox}>
      <Text>Authorized signature</Text>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={settings.signatureUrl} style={styles.signature} />
    </View>
  );
}

function Terms({ en, ar }: { en?: string | null; ar?: string | null }) {
  if (!en && !ar) {
    return null;
  }

  return (
    <View style={styles.terms}>
      <Text>Terms and conditions</Text>
      {en ? <Text>{en}</Text> : null}
      {ar ? <Text>{ar}</Text> : null}
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
