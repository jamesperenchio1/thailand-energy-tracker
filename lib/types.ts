export interface Company {
  id: number;
  name_en: string;
  name_th: string;
  slug: string;
}

export interface FuelType {
  id: number;
  name_en: string;
  name_th: string;
  category: "gasohol" | "benzene" | "diesel";
}

export interface OilPrice {
  id: number;
  date: string;
  company_id: number;
  fuel_type_id: number;
  price: number | null;
  effective_at: string | null;
  created_at: string;
}

export interface OilPriceWithDetails extends OilPrice {
  company: Company;
  fuel_type: FuelType;
}

export interface ElectricityRate {
  id: number;
  effective_date: string;
  end_date: string | null;
  provider: "PEA" | "MEA" | "both";
  ft_rate: number;
  base_rate: number | null;
  total_rate: number | null;
  source_url: string | null;
  created_at: string;
}

export interface PriceChange {
  company: Company;
  fuel_type: FuelType;
  date: string;
  old_price: number;
  new_price: number;
  change: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface PriceTableRow {
  fuel_type: FuelType;
  prices: Record<number, { price: number | null; change: number | null }>;
}
