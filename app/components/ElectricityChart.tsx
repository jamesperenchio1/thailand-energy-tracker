"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  ColorType,
  LineType,
  LineSeries,
  type IChartApi,
} from "lightweight-charts";
import { ElectricityRate } from "@/lib/types";

interface ElectricityChartProps {
  rates: ElectricityRate[];
  height?: number;
}

export default function ElectricityChart({
  rates,
  height = 350,
}: ElectricityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const initChart = useCallback(() => {
    if (!chartContainerRef.current || rates.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#141414" },
        textColor: "#737373",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "#1e1e1e" },
        horzLines: { color: "#1e1e1e" },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      rightPriceScale: { borderColor: "#262626" },
      timeScale: { borderColor: "#262626", timeVisible: false },
    });

    chartRef.current = chart;

    const ftData: { time: string; value: number }[] = [];
    const totalData: { time: string; value: number }[] = [];

    for (const rate of rates) {
      ftData.push({ time: rate.effective_date, value: rate.ft_rate });
      if (rate.end_date) {
        ftData.push({ time: rate.end_date, value: rate.ft_rate });
      }
      if (rate.total_rate != null) {
        totalData.push({ time: rate.effective_date, value: rate.total_rate });
        if (rate.end_date) {
          totalData.push({ time: rate.end_date, value: rate.total_rate });
        }
      }
    }

    const ftSeries = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 2,
      lineType: LineType.WithSteps,
      title: "FT Rate",
      priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
    });
    ftSeries.setData(ftData);

    if (totalData.length > 0) {
      const totalSeries = chart.addSeries(LineSeries, {
        color: "#8b5cf6",
        lineWidth: 2,
        lineType: LineType.WithSteps,
        title: "Total Rate",
        priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
      });
      totalSeries.setData(totalData);
    }

    chart.timeScale().fitContent();
  }, [rates, height]);

  useEffect(() => {
    initChart();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  const currentRate = rates.length > 0 ? rates[rates.length - 1] : null;

  return (
    <div id="electricity" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Electricity FT Rate</h2>
          <p className="text-sm text-[var(--muted)]">
            Fuel adjustment charge set by ERC (changes every ~4 months)
          </p>
        </div>
        {currentRate && (
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">
              {currentRate.ft_rate.toFixed(4)}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Baht/kWh (current FT)
            </p>
            {currentRate.total_rate != null && (
              <p className="text-xs text-[var(--muted)]">
                Total: {currentRate.total_rate.toFixed(4)} Baht/kWh
              </p>
            )}
          </div>
        )}
      </div>

      <div className="chart-container">
        <div className="px-4 pt-4 pb-2 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[var(--muted)]">FT Rate</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-[var(--muted)]">Total Rate (Base + FT)</span>
          </div>
        </div>
        <div ref={chartContainerRef} />
      </div>

      {rates.length > 0 && (
        <div className="chart-container p-4">
          <h3 className="text-sm font-semibold mb-3">Rate History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Period</th>
                  <th className="text-right py-2 px-4 text-[var(--muted)] font-medium">FT Rate</th>
                  <th className="text-right py-2 px-4 text-[var(--muted)] font-medium">Base Rate</th>
                  <th className="text-right py-2 pl-4 text-[var(--muted)] font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...rates].reverse().map((rate) => (
                  <tr key={rate.id} className="border-b border-[var(--card-border)]/50">
                    <td className="py-2 pr-4 tabular-nums">
                      {rate.effective_date}
                      {rate.end_date ? ` to ${rate.end_date}` : " (current)"}
                    </td>
                    <td className="text-right py-2 px-4 tabular-nums font-medium">
                      {rate.ft_rate.toFixed(4)}
                    </td>
                    <td className="text-right py-2 px-4 tabular-nums">
                      {rate.base_rate?.toFixed(4) ?? "\u2014"}
                    </td>
                    <td className="text-right py-2 pl-4 tabular-nums font-medium">
                      {rate.total_rate?.toFixed(4) ?? "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
