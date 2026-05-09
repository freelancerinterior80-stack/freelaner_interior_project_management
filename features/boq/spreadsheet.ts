import type { Boq, BoqUnit } from "@/features/boq/types";

export type BoqImportRow = {
  categoryName?: string;
  description: string;
  quantity: number;
  unit: BoqUnit;
  unitRate: number;
  notes?: string;
};

const headers = ["Category", "Description", "Qty", "Unit", "Unit Rate", "Notes"];
const units: BoqUnit[] = ["m2", "ls", "mtr", "ps", "units"];

export function boqToCsv(boq: Boq) {
  const rows = [
    headers,
    ...boq.categories.flatMap((category) =>
      category.items.map((item) => [
        category.name,
        item.description,
        String(item.quantity),
        item.unit,
        String(item.unitRate),
        item.notes ?? ""
      ])
    ),
    ...boq.ungroupedItems.map((item) => [
      "",
      item.description,
      String(item.quantity),
      item.unit,
      String(item.unitRate),
      item.notes ?? ""
    ])
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

export function parseBoqCsv(text: string): BoqImportRow[] {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim().length > 0));

  if (rows.length < 2) {
    throw new Error("The file has no BOQ rows.");
  }

  const header = rows[0].map((cell) => normalizeHeader(cell));
  const categoryIndex = header.indexOf("category");
  const descriptionIndex = header.indexOf("description");
  const qtyIndex = header.findIndex((cell) => cell === "qty" || cell === "quantity");
  const unitIndex = header.indexOf("unit");
  const rateIndex = header.findIndex((cell) => cell === "unitrate" || cell === "rate");
  const notesIndex = header.indexOf("notes");

  if (descriptionIndex === -1 || qtyIndex === -1 || unitIndex === -1 || rateIndex === -1) {
    throw new Error("Use columns: Category, Description, Qty, Unit, Unit Rate, Notes.");
  }

  return rows.slice(1).map((row, index) => {
    const description = row[descriptionIndex]?.trim();
    const quantity = Number(row[qtyIndex]);
    const unitRate = Number(row[rateIndex]);
    const unit = normalizeUnit(row[unitIndex]);

    if (!description) {
      throw new Error(`Row ${index + 2}: description is required.`);
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      throw new Error(`Row ${index + 2}: quantity must be a valid number.`);
    }
    if (!Number.isFinite(unitRate) || unitRate < 0) {
      throw new Error(`Row ${index + 2}: unit rate must be a valid number.`);
    }
    if (!unit) {
      throw new Error(`Row ${index + 2}: unit must be M2, LS, Mtr, PS, or Units.`);
    }

    return {
      categoryName: categoryIndex === -1 ? undefined : row[categoryIndex]?.trim() || undefined,
      description,
      quantity,
      unit,
      unitRate,
      notes: notesIndex === -1 ? undefined : row[notesIndex]?.trim() || undefined
    };
  });
}

export function getBoqCsvTemplate() {
  return [
    headers,
    ["Flooring", "Porcelain floor tiles", "25", "m2", "120", "Living and dining"],
    ["Ceiling", "Gypsum ceiling work", "1", "ls", "8500", ""]
  ]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}

function escapeCsvCell(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.replace(/\r$/, ""));
  rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function normalizeUnit(value?: string): BoqUnit | null {
  const clean = value?.trim().toLowerCase().replace("²", "2");
  if (!clean) {
    return null;
  }
  if (clean === "m2" || clean === "sqm" || clean === "sq m") {
    return "m2";
  }
  if (clean === "unit" || clean === "units" || clean === "nos" || clean === "no") {
    return "units";
  }
  if (units.includes(clean as BoqUnit)) {
    return clean as BoqUnit;
  }
  return null;
}
