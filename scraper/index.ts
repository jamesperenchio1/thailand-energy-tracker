import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { parseOilPriceXLS } from "./parse-xls";
import { createClient } from "@supabase/supabase-js";
import { COMPANIES, FUEL_TYPES } from "../lib/constants";

const EPPO_URL =
  "https://www.eppo.go.th/epposite/index.php/th/petroleum/price/oil-price?orders&orders[publishUp]=publishUp&issearch=1";

const DOWNLOAD_DIR = path.resolve(__dirname, "downloads");

interface ScraperOptions {
  supabaseUrl: string;
  supabaseKey: string;
  dates: string[]; // YYYY-MM-DD format
  headless?: boolean;
  delayMs?: number;
}

export async function scrapeOilPrices(options: ScraperOptions) {
  const {
    supabaseUrl,
    supabaseKey,
    dates,
    headless = true,
    delayMs = 3000,
  } = options;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Ensure download directory exists
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  // Fetch company and fuel type IDs from Supabase
  const { data: companies } = await supabase.from("companies").select("*");
  const { data: fuelTypes } = await supabase.from("fuel_types").select("*");

  if (!companies || !fuelTypes) {
    throw new Error("Failed to fetch companies or fuel types from Supabase");
  }

  const companyMap = new Map(companies.map((c: { name_en: string; id: number }) => [c.name_en, c.id]));
  const fuelTypeMap = new Map(fuelTypes.map((f: { name_en: string; id: number }) => [f.name_en, f.id]));

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();

  console.log(`Starting scrape for ${dates.length} date(s)...`);

  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i];
    console.log(
      `[${i + 1}/${dates.length}] Scraping ${dateStr}...`
    );

    try {
      // Navigate to the EPPO page
      await page.goto(EPPO_URL, { waitUntil: "networkidle", timeout: 30000 });

      // Find the date input and set it
      // The page has a date picker - we need to find it and set the date
      // Format: DD/MM/YYYY for Thai date inputs
      const [year, month, day] = dateStr.split("-");
      const thaiDateStr = `${day}/${month}/${year}`;

      // Look for the date input field near the "ข้อมูลย้อนหลัง" section
      // We need to scroll down to find it
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Find the date input - it's typically an input field near the generate button
      const dateInput = await page.locator('input[type="text"]').last();
      await dateInput.clear();
      await dateInput.fill(thaiDateStr);

      // Click the generate/download button
      // Look for a button or link that triggers the XLS download
      const downloadPromise = page.waitForEvent("download", { timeout: 15000 });

      // Try to find the generate button - common patterns on EPPO site
      const generateButton = page.locator(
        'button:has-text("Generate"), input[type="submit"], button:has-text("สร้าง"), a:has-text("Generate")'
      );
      await generateButton.first().click();

      const download = await downloadPromise;
      const downloadPath = path.join(DOWNLOAD_DIR, `oil_${dateStr}.xls`);
      await download.saveAs(downloadPath);

      // Parse the downloaded file
      const result = parseOilPriceXLS(downloadPath);

      if (!result.date) {
        console.warn(`  Warning: Could not extract date from XLS for ${dateStr}`);
        continue;
      }

      // Prepare upsert data
      const rows = result.prices
        .filter((p) => p.price !== null)
        .map((p) => ({
          date: result.date,
          company_id: companyMap.get(p.company_en),
          fuel_type_id: fuelTypeMap.get(p.fuel_type_en),
          price: p.price,
          effective_at: p.effective_at,
        }))
        .filter((r) => r.company_id && r.fuel_type_id);

      // Upsert to Supabase
      const { error } = await supabase
        .from("oil_prices")
        .upsert(rows, { onConflict: "date,company_id,fuel_type_id" });

      if (error) {
        console.error(`  Error upserting data for ${dateStr}:`, error.message);
      } else {
        console.log(`  Inserted ${rows.length} price records for ${dateStr}`);
      }

      // Clean up downloaded file
      fs.unlinkSync(downloadPath);
    } catch (err) {
      console.error(
        `  Failed to scrape ${dateStr}:`,
        err instanceof Error ? err.message : err
      );
    }

    // Polite delay between requests
    if (i < dates.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  await browser.close();
  console.log("Scraping complete!");
}

// Generate array of date strings between start and end
export function generateDateRange(
  startDate: string,
  endDate: string
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
}
