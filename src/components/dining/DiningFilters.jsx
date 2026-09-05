import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function DiningFilters({
  activeFilter,
  setActiveFilter,
  radiusKm,
  setRadiusKm,
  hasVegOption,
  hasOpenNowOption
}) {
  const filterOptions = [
    { id: 'all', label: 'All Places' },
    { id: 'pure_veg', label: 'Pure Veg', disabled: !hasVegOption },
    { id: 'open_now', label: 'Open Now', disabled: !hasOpenNowOption },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-200 text-left">
      {/* Safe Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0 font-mono">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {filterOptions.map((opt) => {
          if (opt.disabled) return null; // Hide filter if no metadata supports it

          const isActive = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              id={`filter-${opt.id}`}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-[#287DFA] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Radius selector and Sort */}
      <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
        {/* Radius Selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 shadow-xs">
          <span className="text-slate-400 font-medium">Radius:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="bg-transparent text-[#287DFA] font-extrabold focus:outline-none cursor-pointer"
          >
            <option value={1}>1 km</option>
            <option value={3}>3 km</option>
            <option value={5}>5 km</option>
          </select>
        </div>

        {/* Sort indicator (Nearest First is default & honest) */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/80 rounded-lg px-2.5 py-1 text-slate-600 font-semibold text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Nearest First</span>
        </div>
      </div>
    </div>
  );
}
