import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Boq } from "@/features/boq/types";
import type { DocumentItem, Invoice, Quotation } from "@/features/documents/types";
import type { AppSettings } from "@/features/settings/types";

Font.register({
  family: "NotoSansArabic",
  src: "/fonts/NotoSansArabic-Regular.ttf"
});

const BRAND = "#6f4926";
const BRAND_LIGHT = "#f3eadb";
const MUTED = "#65605a";
const ROW_ALT = "#f9f6f0";
const BORDER = "#e8ddd0";

const EN: Record<string, string> = {
  description: "Description",
  qty: "Qty",
  unit: "Unit",
  rate: "Rate",
  total: "Total",
  subtotal: "Subtotal",
  discount: "Discount",
  vat: "VAT",
  paid: "Paid",
  termsTitle: "Terms & Conditions",
  bankDetails: "Bank Details",
  authorizedSignature: "Authorized Signature",
  quotation: "Quotation",
  invoice: "Invoice",
  boq: "Bill of Quantities",
  project: "Project",
  client: "Client",
  date: "Date",
  validUntil: "Valid Until",
  dueDate: "Due Date",
  quotationTotal: "Quotation Total",
  balanceDue: "Balance Due",
  boqTotal: "BOQ Total"
};

const AR: Record<string, string> = {
  description: "الوصف",
  qty: "الكمية",
  unit: "الوحدة",
  rate: "السعر",
  total: "الإجمالي",
  subtotal: "المجموع الفرعي",
  discount: "الخصم",
  vat: "ضريبة القيمة المضافة",
  paid: "المدفوع",
  termsTitle: "الشروط والأحكام",
  bankDetails: "تفاصيل البنك",
  authorizedSignature: "التوقيع المخول",
  quotation: "عرض سعر",
  invoice: "فاتورة",
  boq: "جدول الكميات",
  project: "المشروع",
  client: "العميل",
  date: "التاريخ",
  validUntil: "صالح حتى",
  dueDate: "تاريخ الاستحقاق",
  quotationTotal: "إجمالي عرض السعر",
  balanceDue: "المبلغ المستحق",
  boqTotal: "إجمالي الكميات"
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    color: "#171717",
    fontSize: 9,
    backgroundColor: "#ffffff"
  },
  pageAr: {
    padding: 36,
    fontFamily: "NotoSansArabic",
    color: "#171717",
    fontSize: 9,
    backgroundColor: "#ffffff"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingBottom: 16,
    borderBottom: `2px solid ${BRAND}`,
    marginBottom: 20
  },
  headerAr: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingBottom: 16,
    borderBottom: `2px solid ${BRAND}`,
    marginBottom: 20
  },
  logo: {
    width: 80,
    height: 44,
    objectFit: "contain",
    marginBottom: 6
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: BRAND,
    marginBottom: 3
  },
  companyDetail: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
    lineHeight: 1.4
  },
  docBlock: {
    alignItems: "flex-end"
  },
  docBlockAr: {
    alignItems: "flex-start"
  },
  docType: {
    fontSize: 22,
    fontWeight: 700,
    color: BRAND,
    marginBottom: 4
  },
  docNumber: {
    fontSize: 11,
    fontWeight: 700,
    color: "#171717",
    marginBottom: 6
  },
  docMeta: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
    textAlign: "right"
  },
  docMetaAr: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
    textAlign: "left"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND,
    paddingVertical: 7,
    paddingHorizontal: 8
  },
  tableHeaderAr: {
    flexDirection: "row-reverse",
    backgroundColor: BRAND,
    paddingVertical: 7,
    paddingHorizontal: 8
  },
  tableHeaderText: {
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 8
  },
  tableRowEven: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: ROW_ALT
  },
  tableRowOdd: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff"
  },
  tableRowEvenAr: {
    flexDirection: "row-reverse",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: ROW_ALT
  },
  tableRowOddAr: {
    flexDirection: "row-reverse",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff"
  },
  colDesc: { width: "40%", fontSize: 8 },
  colQty: { width: "12%", textAlign: "right", fontSize: 8 },
  colUnit: { width: "13%", textAlign: "center", fontSize: 8 },
  colRate: { width: "17%", textAlign: "right", fontSize: 8 },
  colTotal: { width: "18%", textAlign: "right", fontSize: 8 },
  colDescAr: { width: "40%", fontSize: 8, textAlign: "right" },
  colQtyAr: { width: "12%", textAlign: "left", fontSize: 8 },
  colUnitAr: { width: "13%", textAlign: "center", fontSize: 8 },
  colRateAr: { width: "17%", textAlign: "left", fontSize: 8 },
  colTotalAr: { width: "18%", textAlign: "left", fontSize: 8 },
  tableHeaderCell: { color: "#ffffff", fontWeight: 700, fontSize: 8 },
  totalsBlock: {
    marginLeft: "auto",
    width: "42%",
    marginTop: 14,
    borderTop: `1px solid ${BORDER}`
  },
  totalsBlockAr: {
    marginRight: "auto",
    width: "42%",
    marginTop: 14,
    borderTop: `1px solid ${BORDER}`
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: `1px solid ${BORDER}`
  },
  totalsRowAr: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: `1px solid ${BORDER}`
  },
  totalsLabel: { color: MUTED, fontSize: 9 },
  totalsValue: { fontSize: 9 },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 8,
    marginTop: 2
  },
  totalsFinalRowAr: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 7,
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 8,
    marginTop: 2
  },
  totalsFinalLabel: { fontSize: 11, fontWeight: 700, color: BRAND },
  totalsFinalValue: { fontSize: 11, fontWeight: 700, color: BRAND },
  footerGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20
  },
  footerGridAr: {
    flexDirection: "row-reverse",
    gap: 12,
    marginTop: 20
  },
  footerBox: {
    flex: 1,
    padding: 12,
    backgroundColor: ROW_ALT,
    borderRadius: 4,
    lineHeight: 1.6
  },
  footerBoxTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  footerBoxText: { fontSize: 8, color: MUTED, marginBottom: 2 },
  signatureImg: {
    width: 120,
    height: 48,
    objectFit: "contain",
    marginTop: 6,
    marginBottom: 4
  },
  signatureLine: {
    borderBottom: `1px solid #ccc`,
    marginTop: 28,
    marginBottom: 4,
    width: 140
  },
  signerName: { fontSize: 8, color: "#171717", fontWeight: 700 },
  terms: {
    marginTop: 16,
    padding: 12,
    backgroundColor: ROW_ALT,
    borderRadius: 4,
    lineHeight: 1.6
  },
  termsTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND,
    marginBottom: 5,
    textTransform: "uppercase"
  },
  termsText: { fontSize: 8, color: MUTED }
});

type Language = "en" | "ar";

function t(key: string, lang: Language): string {
  return lang === "ar" ? (AR[key] ?? EN[key]) : (EN[key] ?? key);
}

function money(value: number, currency = "KWD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KWD" ? 3 : 2
  }).format(value);
}

// ─── Public PDF components ────────────────────────────────────────────────────

export function BoqPdf({
  boq,
  settings,
  language = "en"
}: {
  boq: Boq;
  settings?: AppSettings;
  language?: Language;
}) {
  const items = [...boq.categories.flatMap((c) => c.items), ...boq.ungroupedItems];
  const ar = language === "ar";

  return (
    <Document>
      <Page size="A4" style={ar ? styles.pageAr : styles.page}>
        <Header title={t("boq", language)} number={boq.name} project={boq.projectName} client={boq.clientName} settings={settings} language={language} />
        <ItemsTable items={items} currency={settings?.currency} language={language} />
        <TotalsBlock
          rows={[]}
          finalLabel={t("boqTotal", language)}
          finalValue={money(boq.subtotal, settings?.currency)}
          ar={ar}
        />
        {boq.notes ? <View style={styles.terms}><Text style={styles.termsText}>{boq.notes}</Text></View> : null}
        <FooterRow settings={settings} language={language} showBank={false} />
      </Page>
    </Document>
  );
}

export function QuotationPdf({
  quotation,
  settings,
  language = "en"
}: {
  quotation: Quotation;
  settings?: AppSettings;
  language?: Language;
}) {
  const ar = language === "ar";
  const cur = settings?.currency;

  const totalsRows: [string, string][] = [
    [t("subtotal", language), money(quotation.subtotal, cur)]
  ];
  if (quotation.discountAmount > 0) {
    totalsRows.push([t("discount", language), `- ${money(quotation.discountAmount, cur)}`]);
  }
  if (quotation.vatRate > 0) {
    totalsRows.push([`${t("vat", language)} ${Math.round(quotation.vatRate * 100)}%`, money(quotation.vatAmount, cur)]);
  }

  return (
    <Document>
      <Page size="A4" style={ar ? styles.pageAr : styles.page}>
        <Header
          title={t("quotation", language)}
          number={quotation.quotationNumber}
          project={quotation.projectName}
          client={quotation.clientName}
          date={quotation.issueDate}
          validUntil={quotation.validUntil}
          settings={settings}
          language={language}
        />
        <ItemsTable items={quotation.items} currency={cur} language={language} />
        <TotalsBlock
          rows={totalsRows}
          finalLabel={t("quotationTotal", language)}
          finalValue={money(quotation.total, cur)}
          ar={ar}
        />
        <FooterRow settings={settings} language={language} showBank={false} />
        <TermsSection
          text={ar ? (quotation.termsAr ?? settings?.defaultTermsAr) : (quotation.termsEn ?? settings?.defaultTermsEn)}
          title={t("termsTitle", language)}
          ar={ar}
        />
      </Page>
    </Document>
  );
}

export function InvoicePdf({
  invoice,
  settings,
  language = "en"
}: {
  invoice: Invoice;
  settings?: AppSettings;
  language?: Language;
}) {
  const ar = language === "ar";
  const cur = settings?.currency;

  const totalsRows: [string, string][] = [
    [t("subtotal", language), money(invoice.subtotal, cur)]
  ];
  if (invoice.discountAmount > 0) {
    totalsRows.push([t("discount", language), `- ${money(invoice.discountAmount, cur)}`]);
  }
  if (invoice.vatRate > 0) {
    totalsRows.push([`${t("vat", language)} ${Math.round(invoice.vatRate * 100)}%`, money(invoice.vatAmount, cur)]);
  }
  if (invoice.paidAmount > 0) {
    totalsRows.push([t("paid", language), money(invoice.paidAmount, cur)]);
  }

  return (
    <Document>
      <Page size="A4" style={ar ? styles.pageAr : styles.page}>
        <Header
          title={t("invoice", language)}
          number={invoice.invoiceNumber}
          project={invoice.projectName}
          client={invoice.clientName}
          date={invoice.issueDate}
          dueDate={invoice.dueDate}
          settings={settings}
          language={language}
        />
        <ItemsTable items={invoice.items} currency={cur} language={language} />
        <TotalsBlock
          rows={totalsRows}
          finalLabel={t("balanceDue", language)}
          finalValue={money(invoice.balanceDue, cur)}
          ar={ar}
        />
        <FooterRow settings={settings} language={language} showBank={true} />
        <TermsSection
          text={ar ? (invoice.termsAr ?? settings?.defaultTermsAr) : (invoice.termsEn ?? settings?.defaultTermsEn)}
          title={t("termsTitle", language)}
          ar={ar}
        />
      </Page>
    </Document>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header({
  title,
  number,
  project,
  client,
  date,
  validUntil,
  dueDate,
  settings,
  language
}: {
  title: string;
  number: string;
  project?: string | null;
  client?: string | null;
  date?: string | null;
  validUntil?: string | null;
  dueDate?: string | null;
  settings?: AppSettings;
  language: Language;
}) {
  const ar = language === "ar";

  return (
    <View style={ar ? styles.headerAr : styles.header}>
      {/* Left: company info */}
      <View style={{ flex: 1 }}>
        {settings?.logoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={settings.logoUrl} style={styles.logo} />
        ) : null}
        <Text style={styles.companyName}>{settings?.companyName || "Freelancer Interior"}</Text>
        {settings?.companyAddress ? <Text style={styles.companyDetail}>{settings.companyAddress}</Text> : null}
        {settings?.companyPhone ? <Text style={styles.companyDetail}>{settings.companyPhone}</Text> : null}
        {settings?.companyEmail ? <Text style={styles.companyDetail}>{settings.companyEmail}</Text> : null}
        {settings?.companyWebsite ? <Text style={styles.companyDetail}>🌐 {settings.companyWebsite}</Text> : null}
        {settings?.companyInstagram ? <Text style={styles.companyDetail}>@ {settings.companyInstagram}</Text> : null}
        {settings?.vatNumber ? <Text style={styles.companyDetail}>VAT: {settings.vatNumber}</Text> : null}
      </View>

      {/* Right: document info */}
      <View style={ar ? styles.docBlockAr : styles.docBlock}>
        <Text style={styles.docType}>{title}</Text>
        <Text style={styles.docNumber}># {number}</Text>
        {project ? <Text style={ar ? styles.docMetaAr : styles.docMeta}>{t("project", language)}: {project}</Text> : null}
        {client ? <Text style={ar ? styles.docMetaAr : styles.docMeta}>{t("client", language)}: {client}</Text> : null}
        {date ? <Text style={ar ? styles.docMetaAr : styles.docMeta}>{t("date", language)}: {date}</Text> : null}
        {validUntil ? <Text style={ar ? styles.docMetaAr : styles.docMeta}>{t("validUntil", language)}: {validUntil}</Text> : null}
        {dueDate ? <Text style={ar ? styles.docMetaAr : styles.docMeta}>{t("dueDate", language)}: {dueDate}</Text> : null}
      </View>
    </View>
  );
}

function ItemsTable({
  items,
  currency,
  language
}: {
  items: DocumentItem[];
  currency?: string;
  language: Language;
}) {
  const ar = language === "ar";

  return (
    <View>
      <View style={ar ? styles.tableHeaderAr : styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, ar ? styles.colDescAr : styles.colDesc]}>{t("description", language)}</Text>
        <Text style={[styles.tableHeaderCell, ar ? styles.colQtyAr : styles.colQty]}>{t("qty", language)}</Text>
        <Text style={[styles.tableHeaderCell, ar ? styles.colUnitAr : styles.colUnit]}>{t("unit", language)}</Text>
        <Text style={[styles.tableHeaderCell, ar ? styles.colRateAr : styles.colRate]}>{t("rate", language)}</Text>
        <Text style={[styles.tableHeaderCell, ar ? styles.colTotalAr : styles.colTotal]}>{t("total", language)}</Text>
      </View>
      {items.map((item, i) => (
        <View key={item.id} style={ar ? (i % 2 === 0 ? styles.tableRowEvenAr : styles.tableRowOddAr) : (i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd)}>
          <Text style={ar ? styles.colDescAr : styles.colDesc}>{item.description}</Text>
          <Text style={ar ? styles.colQtyAr : styles.colQty}>{item.quantity}</Text>
          <Text style={ar ? styles.colUnitAr : styles.colUnit}>{item.unit.toUpperCase()}</Text>
          <Text style={ar ? styles.colRateAr : styles.colRate}>{money(item.unitRate, currency)}</Text>
          <Text style={ar ? styles.colTotalAr : styles.colTotal}>{money(item.total, currency)}</Text>
        </View>
      ))}
    </View>
  );
}

function TotalsBlock({
  rows,
  finalLabel,
  finalValue,
  ar
}: {
  rows: [string, string][];
  finalLabel: string;
  finalValue: string;
  ar: boolean;
}) {
  return (
    <View style={ar ? styles.totalsBlockAr : styles.totalsBlock}>
      {rows.map(([label, value]) => (
        <View key={label} style={ar ? styles.totalsRowAr : styles.totalsRow}>
          <Text style={styles.totalsLabel}>{label}</Text>
          <Text style={styles.totalsValue}>{value}</Text>
        </View>
      ))}
      <View style={ar ? styles.totalsFinalRowAr : styles.totalsFinalRow}>
        <Text style={styles.totalsFinalLabel}>{finalLabel}</Text>
        <Text style={styles.totalsFinalValue}>{finalValue}</Text>
      </View>
    </View>
  );
}

function FooterRow({
  settings,
  language,
  showBank
}: {
  settings?: AppSettings;
  language: Language;
  showBank: boolean;
}) {
  const ar = language === "ar";
  const hasBank = showBank && (settings?.bankName || settings?.bankIban);

  return (
    <View style={ar ? styles.footerGridAr : styles.footerGrid}>
      {hasBank ? (
        <View style={styles.footerBox}>
          <Text style={styles.footerBoxTitle}>{t("bankDetails", language)}</Text>
          {settings?.bankName ? <Text style={styles.footerBoxText}>{settings.bankName}</Text> : null}
          {settings?.bankAccountName ? <Text style={styles.footerBoxText}>{settings.bankAccountName}</Text> : null}
          {settings?.bankAccountNumber ? <Text style={styles.footerBoxText}>A/C: {settings.bankAccountNumber}</Text> : null}
          {settings?.bankIban ? <Text style={styles.footerBoxText}>IBAN: {settings.bankIban}</Text> : null}
          {settings?.bankSwift ? <Text style={styles.footerBoxText}>SWIFT: {settings.bankSwift}</Text> : null}
        </View>
      ) : null}

      <View style={styles.footerBox}>
        <Text style={styles.footerBoxTitle}>{t("authorizedSignature", language)}</Text>
        {settings?.signatureUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={settings.signatureUrl} style={styles.signatureImg} />
        ) : (
          <View style={styles.signatureLine} />
        )}
        {settings?.authorizedSignerName ? (
          <Text style={styles.signerName}>{settings.authorizedSignerName}</Text>
        ) : null}
      </View>
    </View>
  );
}

function TermsSection({
  text,
  title,
  ar
}: {
  text?: string | null;
  title: string;
  ar: boolean;
}) {
  if (!text) return null;

  return (
    <View style={styles.terms}>
      <Text style={styles.termsTitle}>{title}</Text>
      <Text style={[styles.termsText, ar ? { textAlign: "right" } : {}]}>{text}</Text>
    </View>
  );
}
