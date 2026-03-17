import { scrapeOilPrices, generateDateRange } from "./index";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function main() {
  const daysBack = parseInt(process.argv[2] || "730", 10);
  const delayMs = parseInt(process.argv[3] || "3000", 10);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  console.log(`Backfill: ${startStr} to ${endStr} (${daysBack} days)`);
  console.log(`Delay between requests: ${delayMs}ms`);

  // Check which dates already exist in the database
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: existingDates } = await supabase
    .from("oil_prices")
    .select("date")
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date");

  const existingSet = new Set(
    (existingDates ?? []).map((d: { date: string }) => d.date)
  );

  const allDates = generateDateRange(startStr, endStr);
  const datesToScrape = allDates.filter((d) => !existingSet.has(d));

  console.log(`Total dates in range: ${allDates.length}`);
  console.log(`Already scraped: ${existingSet.size}`);
  console.log(`Remaining to scrape: ${datesToScrape.length}`);

  if (datesToScrape.length === 0) {
    console.log("Nothing to scrape!");
    return;
  }

  await scrapeOilPrices({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_KEY,
    dates: datesToScrape,
    headless: true,
    delayMs,
  });
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
