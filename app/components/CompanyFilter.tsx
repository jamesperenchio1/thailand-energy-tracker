"use client";

import { Company } from "@/lib/types";
import { COMPANY_COLORS } from "@/lib/constants";

interface CompanyFilterProps {
  companies: Company[];
  selected: Set<string>;
  onChange: (slugs: Set<string>) => void;
}

export default function CompanyFilter({
  companies,
  selected,
  onChange,
}: CompanyFilterProps) {
  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    onChange(next);
  };

  const selectAll = () => {
    onChange(new Set(companies.map((c) => c.slug)));
  };

  const selectNone = () => {
    onChange(new Set());
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1 mr-2">
        <button
          onClick={selectAll}
          className="text-[10px] text-[var(--muted)] hover:text-white px-2 py-1 rounded border border-[var(--card-border)]"
        >
          All
        </button>
        <button
          onClick={selectNone}
          className="text-[10px] text-[var(--muted)] hover:text-white px-2 py-1 rounded border border-[var(--card-border)]"
        >
          None
        </button>
      </div>
      {companies.map((c) => {
        const isSelected = selected.has(c.slug);
        const color = COMPANY_COLORS[c.slug] || "#666";
        return (
          <button
            key={c.slug}
            onClick={() => toggle(c.slug)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isSelected
                ? "border-transparent text-white"
                : "border-[var(--card-border)] text-[var(--muted)] hover:text-white opacity-40"
            }`}
            style={
              isSelected
                ? { backgroundColor: color + "30", borderColor: color }
                : {}
            }
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {c.name_en}
          </button>
        );
      })}
    </div>
  );
}
