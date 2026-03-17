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

interface OilDataPoint {
  time: string;
  value: number;
}

interface EnergyComparisonProps {
  oilData: OilDataPoint[];
  oilLabel: string;
  electricityRates: ElectricityRate[];
  height?: number;
}

export default function EnergyComparison({
  oilData,
  oilLabel,
  electricityRates,
  height = 400,
}: EnergyComparisonProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;
    if (oilData.length === 0 && electricityRates.length === 0) return;

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
      rightPriceScale: { borderColor: "#262626", visible: true },
      leftPriceScale: { borderColor: "#262626", visible: true },
      timeScale: { borderColor: "#262626", timeVisible: false },
    });

    chartRef.current = chart;

    if (oilData.length > 0) {
      const oilSeries = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        lineType: LineType.WithSteps,
        title: `Oil (${oilLabel})`,
        priceScaleId: "right",
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      oilSeries.setData(oilData);
    }

    if (electricityRates.length > 0) {
      const elecData: { time: string; value: number }[] = [];
      for (const rate of electricityRates) {
        if (rate.total_rate != null) {
          elecData.push({ time: rate.effective_date, value: rate.total_rate });
          if (rate.end_date) {
            elecData.push({ time: rate.end_date, value: rate.total_rate });
          }
        }
      }

      if (elecData.length > 0) {
        const elecSeries = chart.addSeries(LineSeries, {
          color: "#f59e0b",
          lineWidth: 2,
          lineType: LineType.WithSteps,
          title: "Electricity (Total)",
          priceScaleId: "left",
          priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
        });
        elecSeries.setData(elecData);
      }
    }

    chart.timeScale().fitContent();
  }, [oilData, oilLabel, electricityRates, height]);

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Oil vs Electricity</h2>
        <p className="text-sm text-[var(--muted)]">
          Compare oil prices (Baht/L, right axis) with electricity rates
          (Baht/kWh, left axis)
        </p>
      </div>

      <div className="chart-container">
        <div className="px-4 pt-4 pb-2 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[var(--muted)]">
              Oil — {oilLabel} (Baht/L)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[var(--muted)]">
              Electricity Total Rate (Baht/kWh)
            </span>
          </div>
        </div>
        <div ref={chartContainerRef} />
      </div>
    </div>
  );
}
