"use client";

import { useState, useEffect, useCallback } from "react";
import PriceTable from "./components/PriceTable";
import PriceChart from "./components/PriceChart";
import PriceChanges from "./components/PriceChanges";
import ElectricityChart from "./components/ElectricityChart";
import EnergyComparison from "./components/EnergyComparison";
import FuelTypeFilter from "./components/FuelTypeFilter";
import CompanyFilter from "./components/CompanyFilter";
import DateRangeSelector, {
  getStartDate,
} from "./components/DateRangeSelector";
import { Company, FuelType, ElectricityRate } from "@/lib/types";

type DateRange = "1M" | "3M" | "6M" | "1Y" | "2Y" | "ALL";

interface ChartDataPoint {
  time: string;
  value: number;
}

interface LatestData {
  date: string;
  prices: Array<{
    company_id: number;
    fuel_type_id: number;
    price: number | null;
    company: Company;
    fuel_type: FuelType;
  }>;
  previousPrices: Record<string, number>;
  companies: Company[];
  fuel_types: FuelType[];
}

interface PriceChangeData {
  company: { name_en: string; slug: string };
  fuel_type: { name_en: string; category: string };
  date: string;
  old_price: number;
  new_price: number;
  change: number;
}

export default function Home() {
  const [latestData, setLatestData] = useState<LatestData | null>(null);
  const [changes, setChanges] = useState<PriceChangeData[]>([]);
  const [electricityRates, setElectricityRates] = useState<ElectricityRate[]>(
    []
  );
  const [chartData, setChartData] = useState<
    Record<string, ChartDataPoint[]>
  >({});
  const [selectedFuelType, setSelectedFuelType] = useState("Diesel B7");
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(
    new Set()
  );
  const [dateRange, setDateRange] = useState<DateRange>("1Y");
  const [loading, setLoading] = useState(true);
  const [comparisonOilData, setComparisonOilData] = useState<
    ChartDataPoint[]
  >([]);

  // Fetch latest prices
  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/prices/latest");
        const data = await res.json();
        setLatestData(data);
        if (data.companies) {
          setSelectedCompanies(
            new Set(data.companies.map((c: Company) => c.slug))
          );
        }
      } catch (err) {
        console.error("Failed to fetch latest prices:", err);
      }
    }
    fetchLatest();
  }, []);

  // Fetch price changes
  useEffect(() => {
    async function fetchChanges() {
      try {
        const res = await fetch("/api/prices/changes?limit=12");
        const data = await res.json();
        setChanges(data);
      } catch (err) {
        console.error("Failed to fetch changes:", err);
      }
    }
    fetchChanges();
  }, []);

  // Fetch electricity rates
  useEffect(() => {
    async function fetchElectricity() {
      try {
        const res = await fetch("/api/electricity");
        const data = await res.json();
        setElectricityRates(data);
      } catch (err) {
        console.error("Failed to fetch electricity rates:", err);
      }
    }
    fetchElectricity();
  }, []);

  // Fetch chart data when fuel type or date range changes
  const fetchChartData = useCallback(async () => {
    if (!latestData?.fuel_types) return;

    setLoading(true);
    try {
      const startDate = getStartDate(dateRange);
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);

      const res = await fetch(`/api/prices?${params}`);
      const allPrices = await res.json();

      if (!Array.isArray(allPrices)) {
        setLoading(false);
        return;
      }

      // Filter for selected fuel type
      const fuelTypeObj = latestData.fuel_types.find(
        (ft) => ft.name_en === selectedFuelType
      );
      if (!fuelTypeObj) {
        setLoading(false);
        return;
      }

      const filtered = allPrices.filter(
        (p: { fuel_type_id: number; price: number | null }) =>
          p.fuel_type_id === fuelTypeObj.id && p.price != null
      );

      // Group by company slug
      const grouped: Record<string, ChartDataPoint[]> = {};
      for (const p of filtered) {
        const slug = p.company?.slug;
        if (!slug) continue;
        if (!grouped[slug]) grouped[slug] = [];
        grouped[slug].push({ time: p.date, value: p.price });
      }

      // Sort each series by time
      for (const slug of Object.keys(grouped)) {
        grouped[slug].sort((a, b) => a.time.localeCompare(b.time));
      }

      setChartData(grouped);

      // Build comparison data: average price of selected fuel type across all companies per day
      const byDate: Record<string, number[]> = {};
      for (const p of filtered) {
        if (!byDate[p.date]) byDate[p.date] = [];
        byDate[p.date].push(p.price);
      }
      const avgData = Object.entries(byDate)
        .map(([date, prices]) => ({
          time: date,
          value: prices.reduce((a, b) => a + b, 0) / prices.length,
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
      setComparisonOilData(avgData);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    }
    setLoading(false);
  }, [selectedFuelType, dateRange, latestData]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Filter chart data by selected companies
  const filteredChartData: Record<string, ChartDataPoint[]> = {};
  for (const [slug, data] of Object.entries(chartData)) {
    if (selectedCompanies.has(slug)) {
      filteredChartData[slug] = data;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Thailand Energy Prices
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mx-auto">
          Daily retail oil prices from EPPO across 10 major companies and
          electricity FT rates from ERC. Updated daily.
        </p>
      </div>

      {/* Today's Prices Table */}
      {latestData?.date && (
        <PriceTable
          date={latestData.date}
          prices={latestData.prices}
          previousPrices={latestData.previousPrices}
          companies={latestData.companies}
          fuelTypes={latestData.fuel_types}
        />
      )}

      {/* Price Changes */}
      {changes.length > 0 && <PriceChanges changes={changes} />}

      {/* Charts Section */}
      <div id="charts" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Historical Price Chart
          </h2>

          {/* Controls */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-[var(--muted)]">Fuel Type</div>
              <DateRangeSelector
                selected={dateRange}
                onChange={setDateRange}
              />
            </div>

            {latestData?.fuel_types && (
              <FuelTypeFilter
                fuelTypes={latestData.fuel_types}
                selected={selectedFuelType}
                onChange={setSelectedFuelType}
              />
            )}

            <div className="text-sm text-[var(--muted)] mt-2">Companies</div>
            {latestData?.companies && (
              <CompanyFilter
                companies={latestData.companies}
                selected={selectedCompanies}
                onChange={setSelectedCompanies}
              />
            )}
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="chart-container h-[450px] flex items-center justify-center">
            <div className="text-[var(--muted)] text-sm">Loading chart data...</div>
          </div>
        ) : (
          latestData?.companies && (
            <PriceChart
              data={filteredChartData}
              companies={latestData.companies.filter((c) =>
                selectedCompanies.has(c.slug)
              )}
              title={`${selectedFuelType} — Price per Company (Baht/L)`}
            />
          )
        )}
      </div>

      {/* Electricity Section */}
      <ElectricityChart rates={electricityRates} />

      {/* Energy Comparison */}
      {comparisonOilData.length > 0 && electricityRates.length > 0 && (
        <EnergyComparison
          oilData={comparisonOilData}
          oilLabel={selectedFuelType}
          electricityRates={electricityRates}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] pt-8 pb-12 text-center">
        <p className="text-xs text-[var(--muted)]">
          Data sourced from EPPO (Energy Policy and Planning Office) and ERC
          (Energy Regulatory Commission) of Thailand
        </p>
        <p className="text-xs text-[var(--muted)] mt-1">
          Prices in Thai Baht. Oil prices per litre, electricity per kWh.
        </p>
      </footer>
    </div>
  );
}
