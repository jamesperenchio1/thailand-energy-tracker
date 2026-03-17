import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get the most recent date that has data
  const { data: latestDate } = await supabase
    .from("oil_prices")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (!latestDate) {
    return NextResponse.json({ date: null, prices: [], companies: [], fuel_types: [] });
  }

  // Get all prices for that date
  const { data: prices, error } = await supabase
    .from("oil_prices")
    .select(
      `
      *,
      company:companies(*),
      fuel_type:fuel_types(*)
    `
    )
    .eq("date", latestDate.date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get previous day's prices for comparison
  const { data: prevDate } = await supabase
    .from("oil_prices")
    .select("date")
    .lt("date", latestDate.date)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  let previousPrices: Record<string, number> = {};
  if (prevDate) {
    const { data: prevPriceData } = await supabase
      .from("oil_prices")
      .select("company_id, fuel_type_id, price")
      .eq("date", prevDate.date);

    if (prevPriceData) {
      for (const p of prevPriceData) {
        previousPrices[`${p.company_id}-${p.fuel_type_id}`] = p.price;
      }
    }
  }

  // Get all companies and fuel types
  const [{ data: companies }, { data: fuelTypes }] = await Promise.all([
    supabase.from("companies").select("*").order("id"),
    supabase.from("fuel_types").select("*").order("id"),
  ]);

  return NextResponse.json({
    date: latestDate.date,
    prices,
    previousPrices,
    companies: companies ?? [],
    fuel_types: fuelTypes ?? [],
  });
}
