import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SIGNIFICANT_CHANGE_THRESHOLD } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Get the last 30 days of price data to find changes
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: prices, error } = await supabase
    .from("oil_prices")
    .select(
      `
      date, price, company_id, fuel_type_id,
      company:companies(id, name_en, name_th, slug),
      fuel_type:fuel_types(id, name_en, name_th, category)
    `
    )
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
    .not("price", "is", null)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by company+fuel_type and find significant changes
  const grouped: Record<string, typeof prices> = {};
  for (const p of prices ?? []) {
    const key = `${p.company_id}-${p.fuel_type_id}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  interface PriceChangeEntry {
    company: unknown;
    fuel_type: unknown;
    date: string;
    old_price: number;
    new_price: number;
    change: number;
  }

  const changes: PriceChangeEntry[] = [];

  for (const entries of Object.values(grouped)) {
    // Entries are sorted by date desc
    for (let i = 0; i < entries.length - 1; i++) {
      const current = entries[i];
      const previous = entries[i + 1];

      if (current.price !== null && previous.price !== null) {
        const change = current.price - previous.price;
        if (Math.abs(change) >= SIGNIFICANT_CHANGE_THRESHOLD) {
          changes.push({
            company: current.company,
            fuel_type: current.fuel_type,
            date: current.date,
            old_price: previous.price,
            new_price: current.price,
            change,
          });
        }
      }
    }
  }

  // Sort by date desc, then by absolute change
  changes.sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    return Math.abs(b.change) - Math.abs(a.change);
  });

  return NextResponse.json(changes.slice(0, limit));
}
