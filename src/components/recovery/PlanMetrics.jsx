import React from 'react';
import { Clock, DollarSign, RotateCcw, ShieldCheck } from 'lucide-react';

export default function PlanMetrics({
  timeSavedMinutes = 0,
  estimatedCost = 0,
  estimatedRefund = 0,
  affectedNodes = 1,
  compact = false
}) {
  const formatTimeSaved = (mins) => {
    if (!mins || mins === 0) return 'Standard travel window';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `Saves ~${m}m`;
    if (m === 0) return `Saves ~${h}h`;
    return `Saves ~${h}h ${m}m`;
  };

  return (
    <div
      className={`grid ${
        compact ? 'grid-cols-2 gap-2 text-[11px]' : 'grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs'
      } bg-slate-50/90 p-3 rounded-xl border border-slate-100 font-mono`}
    >
      {/* Metric 1: Time Impact / Saved */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#287DFA]" />
          <span>Time Saved (Est.)</span>
        </span>
        <span className={`font-extrabold ${timeSavedMinutes > 0 ? 'text-[#287DFA]' : 'text-slate-700'}`}>
          {formatTimeSaved(timeSavedMinutes)}
        </span>
      </div>

      {/* Metric 2: Estimated Additional Cost */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-amber-500" />
          <span>Est. Added Cost</span>
        </span>
        <span className={`font-extrabold ${estimatedCost === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
          {estimatedCost === 0 ? '₹0 (FREE)' : `₹${estimatedCost.toLocaleString()}`}
        </span>
      </div>

      {/* Metric 3: Estimated Refund / Claim */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <RotateCcw className="w-3 h-3 text-emerald-600" />
          <span>Est. Refund Claim</span>
        </span>
        <span className={`font-extrabold ${estimatedRefund > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
          {estimatedRefund > 0 ? `₹${estimatedRefund.toLocaleString()}` : '₹0'}
        </span>
      </div>

      {/* Metric 4: Itinerary Changes */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-500" />
          <span>Itinerary Changes</span>
        </span>
        <span className="font-extrabold text-slate-800">
          {affectedNodes} {affectedNodes === 1 ? 'change' : 'changes'}
        </span>
      </div>
    </div>
  );
}
