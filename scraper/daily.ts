import { scrapeOilPrices } from "./index";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`Daily scrape for ${today}`);

  await scrapeOilPrices({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_KEY,
    dates: [today],
    headless: true,
    delayMs: 0,
  });
}

main().catch((err) => {
  console.error("Daily scrape failed:", err);
  process.exit(1);
});
