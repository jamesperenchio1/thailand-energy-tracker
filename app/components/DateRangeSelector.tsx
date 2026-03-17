"use client";

type DateRange = "1M" | "3M" | "6M" | "1Y" | "2Y" | "ALL";

interface DateRangeSelectorProps {
  selected: DateRange;
  onChange: (range: DateRange) => void;
}

const RANGES: { label: string; value: DateRange }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "2Y", value: "2Y" },
  { label: "All", value: "ALL" },
];

export function getStartDate(range: DateRange): string | null {
  if (range === "ALL") return null;
  const now = new Date();
  const months: Record<string, number> = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
    "2Y": 24,
  };
  now.setMonth(now.getMonth() - (months[range] ?? 0));
  return now.toISOString().split("T")[0];
}

export default function DateRangeSelector({
  selected,
  onChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-[var(--card)] rounded-lg p-1 border border-[var(--card-border)]">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            selected === r.value
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-white"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
