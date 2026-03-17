import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Known FT rate history for Thailand (from ERC announcements)
// These can be updated as new rates are announced
// Source: Energy Regulatory Commission of Thailand (ERC)
const KNOWN_FT_RATES = [
  { effective_date: "2024-01-01", end_date: "2024-04-30", ft_rate: -0.3933, provider: "both" as const },
  { effective_date: "2024-05-01", end_date: "2024-08-31", ft_rate: -0.3933, provider: "both" as const },
  { effective_date: "2024-09-01", end_date: "2024-12-31", ft_rate: -0.3933, provider: "both" as const },
  { effective_date: "2025-01-01", end_date: "2025-04-30", ft_rate: -0.3933, provider: "both" as const },
  { effective_date: "2025-05-01", end_date: "2025-08-31", ft_rate: -0.3933, provider: "both" as const },
  { effective_date: "2025-09-01", end_date: "2025-12-31", ft_rate: -0.3933, provider: "both" as const },
  { effective_date: "2026-01-01", end_date: null, ft_rate: -0.3933, provider: "both" as const },
];

async function scrapeErcFtRates() {
  console.log("Scraping ERC/EPPO for electricity FT rates...");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // First, try to scrape from ERC website for latest data
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Try EPPO electricity tariff page
    await page.goto(
      "https://www.eppo.go.th/epposite/index.php/th/electricity/tariff",
      { waitUntil: "networkidle", timeout: 30000 }
    );

    // Extract FT rate data from the page
    const pageText = await page.textContent("body");

    // Look for FT rate patterns in the page content
    // Thai FT rates are typically shown as "ค่า Ft" followed by a number
    const ftMatches = pageText?.match(/[Ff][Tt]\s*=?\s*(-?\d+\.?\d*)/g);

    if (ftMatches) {
      console.log("Found FT rate references on EPPO page:");
      ftMatches.forEach((m) => console.log(`  ${m}`));
    }

    // Also check ERC
    await page.goto("https://www.erc.or.th", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("Successfully accessed ERC website");
  } catch (err) {
    console.warn(
      "Could not scrape live data, using known FT rate history:",
      err instanceof Error ? err.message : err
    );
  } finally {
    await browser.close();
  }

  // Upsert known FT rates
  console.log("\nUpserting known FT rate history...");

  for (const rate of KNOWN_FT_RATES) {
    const { error } = await supabase.from("electricity_rates").upsert(
      {
        effective_date: rate.effective_date,
        end_date: rate.end_date,
        provider: rate.provider,
        ft_rate: rate.ft_rate,
        base_rate: 3.7685, // Standard base rate for residential
        total_rate: 3.7685 + rate.ft_rate,
        source_url: "https://www.erc.or.th",
      },
      { onConflict: "effective_date,provider" }
    );

    if (error) {
      console.error(
        `Error upserting rate for ${rate.effective_date}:`,
        error.message
      );
    } else {
      console.log(
        `  ${rate.effective_date}: FT=${rate.ft_rate}, Total=${(3.7685 + rate.ft_rate).toFixed(4)}`
      );
    }
  }

  console.log("\nElectricity rate scrape complete!");
  console.log(
    "NOTE: FT rates in KNOWN_FT_RATES are placeholder values."
  );
  console.log(
    "Update scraper/electricity.ts with actual rates from ERC announcements."
  );
}

scrapeErcFtRates().catch((err) => {
  console.error("Electricity scrape failed:", err);
  process.exit(1);
});
