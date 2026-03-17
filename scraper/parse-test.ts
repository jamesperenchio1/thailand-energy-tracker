import { parseOilPriceXLS } from "./parse-xls";
import path from "path";

// Test parser against sample file
const sampleFile = path.resolve(
  process.argv[2] ||
    "/Users/jamesperenchio/Downloads/EPPO_RetailOilPrice_on_20260316.xls"
);

console.log(`Parsing: ${sampleFile}\n`);

const result = parseOilPriceXLS(sampleFile);

console.log(`Date: ${result.date}`);
console.log(`Total price entries: ${result.prices.length}`);
console.log(
  `Non-null prices: ${result.prices.filter((p) => p.price !== null).length}`
);
console.log();

// Print a nice table
const companies = [...new Set(result.prices.map((p) => p.company_en))];
const fuelTypes = [...new Set(result.prices.map((p) => p.fuel_type_en))];

console.log("Company".padEnd(18) + fuelTypes.map((f) => f.padEnd(12)).join(""));
console.log("-".repeat(18 + fuelTypes.length * 12));

for (const company of companies) {
  const row = [company.padEnd(18)];
  for (const fuel of fuelTypes) {
    const entry = result.prices.find(
      (p) => p.company_en === company && p.fuel_type_en === fuel
    );
    const val = entry?.price !== null ? entry?.price?.toFixed(2) ?? "-" : "-";
    row.push(val.padEnd(12));
  }
  console.log(row.join(""));
}

console.log();
console.log("Effective dates:");
const seen = new Set<string>();
for (const p of result.prices) {
  const key = `${p.company_en}: ${p.effective_at}`;
  if (!seen.has(key) && p.effective_at) {
    seen.add(key);
    console.log(`  ${p.company_en}: ${p.effective_at}`);
  }
}
