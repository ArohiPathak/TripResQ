import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecoveryPlanComparison({
  plans = [],
  recommendedPlanId,
  onApplyPlan,
  isApplying = false
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!plans || plans.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-left">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-50 transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#EAF3FF] text-[#287DFA]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-serif leading-tight">
              Compare All Recovery Plans Side-by-Side
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare tradeoffs across cost, delay, refunds, and changes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#287DFA]">
          <span>{isExpanded ? 'Hide Details' : 'View Comparison Matrix'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-x-auto"
          >
            <div className="p-4 sm:p-6 min-w-[640px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 font-mono text-slate-400">
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">Plan Strategy</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-center">Score</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">Added Cost</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">Time Impact</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">Refund Claim</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold">Itinerary Changes</th>
                    <th className="py-2.5 px-3 uppercase tracking-wider font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {plans.map((plan) => {
                    const isRec = plan.id === recommendedPlanId;
                    return (
                      <tr
                        key={plan.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isRec ? 'bg-blue-50/40 font-semibold' : ''
                        }`}
                      >
                        {/* Title & Badge */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 font-serif">
                              {plan.title}
                            </span>
                            {isRec && (
                              <span className="px-2 py-0.5 rounded-full bg-[#287DFA] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {plan.badge}
                          </span>
                        </td>

                        {/* Fit Score */}
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded-lg font-mono font-extrabold text-xs ${
                            isRec ? 'bg-[#287DFA] text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {plan.score}/100
                          </span>
                        </td>

                        {/* Added Cost */}
                        <td className="py-3 px-3 font-mono">
                          <span className={plan.additional_cost === 0 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                            {plan.additional_cost === 0 ? 'FREE (₹0)' : `₹${plan.additional_cost.toLocaleString()}`}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {plan.duration_minutes === 0 ? '0m (Cancelled)' : `${Math.floor(plan.duration_minutes / 60)}h ${plan.duration_minutes % 60}m`}
                        </td>

                        {/* Refund */}
                        <td className="py-3 px-3 font-mono">
                          <span className={plan.refund > 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {plan.refund > 0 ? `₹${plan.refund.toLocaleString()}` : '₹0'}
                          </span>
                        </td>

                        {/* Affected Nodes */}
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {plan.affected_nodes} {plan.affected_nodes === 1 ? 'node' : 'nodes'}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onApplyPlan && onApplyPlan(plan)}
                            disabled={isApplying}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                              isRec
                                ? 'bg-[#287DFA] text-white hover:bg-[#1C6BDB]'
                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            }`}
                          >
                            <span>Apply</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
