"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  LineType,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
} from "lightweight-charts";
import { Company } from "@/lib/types";
import { COMPANY_COLORS } from "@/lib/constants";

interface ChartDataPoint {
  time: string;
  value: number;
}

interface PriceChartProps {
  data: Record<string, ChartDataPoint[]>; // company slug -> data points
  companies: Company[];
  title: string;
  height?: number;
}

export default function PriceChart({
  data,
  companies,
  title,
  height = 450,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<Map<string, ISeriesApi<SeriesType>>>(new Map());

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current.clear();
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
      crosshair: {
        vertLine: {
          color: "#3b82f6",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#3b82f6",
        },
        horzLine: {
          color: "#3b82f6",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#3b82f6",
        },
      },
      rightPriceScale: {
        borderColor: "#262626",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "#262626",
        timeVisible: false,
      },
    });

    chartRef.current = chart;

    for (const company of companies) {
      const companyData = data[company.slug];
      if (!companyData || companyData.length === 0) continue;

      const color = COMPANY_COLORS[company.slug] || "#666666";

      const series = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        lineType: LineType.WithSteps,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        title: company.name_en,
        priceFormat: {
          type: "price",
          precision: 2,
          minMove: 0.01,
        },
      });

      series.setData(companyData);
      seriesRef.current.set(company.slug, series);
    }

    chart.timeScale().fitContent();
  }, [data, companies, height]);

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
    <div className="chart-container">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex flex-wrap gap-3">
          {companies.map((c) => {
            const hasData = data[c.slug]?.length > 0;
            if (!hasData) return null;
            return (
              <div key={c.slug} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: COMPANY_COLORS[c.slug] || "#666",
                  }}
                />
                <span className="text-[var(--muted)]">{c.name_en}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
