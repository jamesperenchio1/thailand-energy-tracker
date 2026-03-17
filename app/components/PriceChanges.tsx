"use client";

interface PriceChange {
  company: { name_en: string; slug: string };
  fuel_type: { name_en: string; category: string };
  date: string;
  old_price: number;
  new_price: number;
  change: number;
}

interface PriceChangesProps {
  changes: PriceChange[];
}

export default function PriceChanges({ changes }: PriceChangesProps) {
  if (changes.length === 0) {
    return (
      <div className="chart-container p-6 text-center text-[var(--muted)] text-sm">
        No significant price changes in the last 30 days
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Price Changes</h2>
      <p className="text-sm text-[var(--muted)]">
        Significant changes (&ge;0.50 Baht) in the last 30 days
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {changes.slice(0, 12).map((change, i) => (
          <div
            key={i}
            className="chart-container p-4 flex items-start justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {change.company.name_en}
                </span>
                <span className="text-[10px] text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded">
                  {formatDate(change.date)}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">
                {change.fuel_type.name_en}
              </p>
              <p className="text-xs text-[var(--muted)] tabular-nums">
                {change.old_price.toFixed(2)} &rarr;{" "}
                {change.new_price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={
                  change.change > 0
                    ? "text-[var(--negative)]"
                    : "text-[var(--positive)]"
                }
              >
                {change.change > 0 ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 4l4 6H4l4-6z" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 12l-4-6h8l-4 6z" />
                  </svg>
                )}
              </span>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  change.change > 0
                    ? "text-[var(--negative)]"
                    : "text-[var(--positive)]"
                }`}
              >
                {change.change > 0 ? "+" : ""}
                {change.change.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
