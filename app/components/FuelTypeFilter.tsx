"use client";

import { FuelType } from "@/lib/types";

interface FuelTypeFilterProps {
  fuelTypes: FuelType[];
  selected: string;
  onChange: (fuelTypeName: string) => void;
}

export default function FuelTypeFilter({
  fuelTypes,
  selected,
  onChange,
}: FuelTypeFilterProps) {
  const grouped = {
    gasohol: fuelTypes.filter((f) => f.category === "gasohol"),
    benzene: fuelTypes.filter((f) => f.category === "benzene"),
    diesel: fuelTypes.filter((f) => f.category === "diesel"),
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(grouped).map(([category, types]) => (
        <div key={category} className="flex items-center gap-1">
          <span className="text-[10px] uppercase text-[var(--muted)] mr-1">
            {category}
          </span>
          {types.map((ft) => (
            <button
              key={ft.id}
              onClick={() => onChange(ft.name_en)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selected === ft.name_en
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--card)] text-[var(--muted)] hover:text-white border border-[var(--card-border)]"
              }`}
            >
              {ft.name_en}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
