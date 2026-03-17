"use client";

import { Company, FuelType } from "@/lib/types";
import { COMPANY_COLORS } from "@/lib/constants";

interface PriceEntry {
  company_id: number;
  fuel_type_id: number;
  price: number | null;
  company: Company;
  fuel_type: FuelType;
}

interface PriceTableProps {
  date: string;
  prices: PriceEntry[];
  previousPrices: Record<string, number>;
  companies: Company[];
  fuelTypes: FuelType[];
}

export default function PriceTable({
  date,
  prices,
  previousPrices,
  companies,
  fuelTypes,
}: PriceTableProps) {
  const priceMap = new Map<string, number | null>();
  for (const p of prices) {
    priceMap.set(`${p.fuel_type_id}-${p.company_id}`, p.price);
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div id="prices" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Today&apos;s Oil Prices</h2>
          <p className="text-sm text-[var(--muted)]">{formatDate(date)}</p>
        </div>
        <span className="text-xs text-[var(--muted)] bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--card-border)]">
          Baht / Litre
        </span>
      </div>

      <div className="price-table chart-container">
        <table>
          <thead>
            <tr>
              <th className="min-w-[160px]">Fuel Type</th>
              {companies.map((c) => (
                <th key={c.id} className="min-w-[90px]">
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        backgroundColor: COMPANY_COLORS[c.slug] || "#666",
                      }}
                    />
                    {c.name_en}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fuelTypes.map((ft) => (
              <tr key={ft.id} className="hover:bg-white/[0.02]">
                <td className="font-medium text-sm">
                  <span className="text-[var(--foreground)]">{ft.name_en}</span>
                  <span className="block text-[10px] text-[var(--muted)]">
                    {ft.category}
                  </span>
                </td>
                {companies.map((c) => {
                  const price = priceMap.get(`${ft.id}-${c.id}`);
                  const prevPrice =
                    previousPrices[`${c.id}-${ft.id}`];
                  const change =
                    price != null && prevPrice != null
                      ? price - prevPrice
                      : null;

                  return (
                    <td key={c.id} className="text-sm tabular-nums">
                      {price != null ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            {price.toFixed(2)}
                          </span>
                          {change !== null && change !== 0 && (
                            <span
                              className={
                                change > 0
                                  ? "badge-negative text-[10px]"
                                  : "badge-positive text-[10px]"
                              }
                            >
                              {change > 0 ? "+" : ""}
                              {change.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
