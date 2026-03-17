import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fuelType = searchParams.get("fuel_type");
  const company = searchParams.get("company");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  let query = supabase
    .from("oil_prices")
    .select(
      `
      *,
      company:companies(*),
      fuel_type:fuel_types(*)
    `
    )
    .order("date", { ascending: true });

  if (fuelType) {
    query = query.eq("fuel_type.name_en", fuelType);
  }
  if (company) {
    query = query.eq("company.slug", company);
  }
  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
