import React from 'react';
import { Zap, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PRIORITIES = [
  {
    id: 'FASTEST',
    title: '⚡ Fastest',
    subtitle: 'Save the most time',
    tagline: 'Earliest arrival',
    icon: Zap,
    activeBorder: 'border-[#287DFA]',
    activeBg: 'bg-[#EAF3FF]',
    activeText: 'text-[#287DFA]',
    badgeBg: 'bg-blue-100 text-[#287DFA]'
  },
  {
    id: 'CHEAPEST',
    title: '💰 Lowest Cost',
    subtitle: 'Spend the least',
    tagline: '₹0 copay + voucher',
    icon: RefreshCw,
    activeBorder: 'border-[#FF7700]',
    activeBg: 'bg-orange-50',
    activeText: 'text-[#FF7700]',
    badgeBg: 'bg-orange-100 text-[#FF7700]'
  },
  {
    id: 'MAX_REFUND',
    title: '💸 Max Refund',
    subtitle: 'Recover the most money',
    tagline: '100% money back',
    icon: Trash2,
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'LEAST_DISRUPTION',
    title: '😌 Least Disruption',
    subtitle: 'Change fewest plans',
    tagline: 'Hotel intact',
    icon: ShieldCheck,
    activeBorder: 'border-indigo-500',
    activeBg: 'bg-indigo-50/70',
    activeText: 'text-indigo-700',
    badgeBg: 'bg-indigo-100 text-indigo-700'
  }
];

export default function RecoveryPrioritySelector({
  selectedPriority = 'FASTEST',
  onSelectPriority,
  disabled = false
}) {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          What matters most to you?
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">
          TripResQ dynamically re-scores & ranks options
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRIORITIES.map((prio) => {
          const Icon = prio.icon;
          const isSelected = selectedPriority === prio.id;

          return (
            <motion.button
              key={prio.id}
              type="button"
              whileHover={disabled ? {} : { scale: 1.02 }}
              whileTap={disabled ? {} : { scale: 0.98 }}
              onClick={() => !disabled && onSelectPriority && onSelectPriority(prio.id)}
              disabled={disabled}
              className={`p-3.5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
                isSelected
                  ? `${prio.activeBorder} ${prio.activeBg} shadow-sm ring-2 ring-offset-1 ${prio.activeBorder}/40`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white shadow-xs ' + prio.activeText : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected ? (
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${prio.badgeBg}`}>
                    Active Priority
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    {prio.tagline}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 font-serif leading-tight">
                  {prio.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {prio.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
