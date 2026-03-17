import * as XLSX from "xlsx";
import { COMPANIES, FUEL_TYPES } from "../lib/constants";

export interface ParsedPrice {
  fuel_type_en: string;
  company_en: string;
  price: number | null;
  effective_at: string | null;
}

export interface ParsedXLSResult {
  date: string;
  prices: ParsedPrice[];
}

export function parseOilPriceXLS(filePath: string): ParsedXLSResult {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
  });

  // Extract date from title row (row 0)
  // Format in file: "ราคาขายปลีก ณ วันที่ DD/MM/YYYY" or similar
  const titleRow = String(raw[0]?.[0] ?? "");
  const dateMatch = titleRow.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  let date = "";
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Extract effective dates from row 24
  const effectiveDates: Record<number, string | null> = {};
  if (raw[24]) {
    for (const company of COMPANIES) {
      const val = raw[24]?.[company.column];
      effectiveDates[company.column] = val ? String(val) : null;
    }
  }

  // Extract prices: rows 13-23 (fuel types) × columns 1-10 (companies)
  const prices: ParsedPrice[] = [];

  for (const fuelType of FUEL_TYPES) {
    const row = raw[fuelType.row];
    if (!row) continue;

    for (const company of COMPANIES) {
      const rawPrice = row[company.column];
      let price: number | null = null;

      if (rawPrice !== null && rawPrice !== undefined) {
        const numPrice = Number(rawPrice);
        // 0 means the company doesn't sell this fuel type
        price = numPrice === 0 ? null : numPrice;
      }

      prices.push({
        fuel_type_en: fuelType.name_en,
        company_en: company.name_en,
        price,
        effective_at: effectiveDates[company.column] ?? null,
      });
    }
  }

  return { date, prices };
}
