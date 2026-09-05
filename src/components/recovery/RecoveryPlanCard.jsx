import React from 'react';
import {
  Zap,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Check,
  Clock,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import PlanMetrics from './PlanMetrics';

const PLAN_ICON_MAP = {
  FASTEST: Zap,
  CHEAPEST: RefreshCw,
  MAX_REFUND: Trash2,
  LEAST_DISRUPTION: ShieldCheck
};

export default function RecoveryPlanCard({
  plan,
  isRecommended = false,
  isSelected = false,
  onSelect,
  onApply,
  isApplying = false
}) {
  if (!plan) return null;

  const Icon = PLAN_ICON_MAP[plan.priority] || Zap;

  const getBorderClasses = () => {
    if (isRecommended) {
      return 'border-2 border-[#287DFA] shadow-xl ring-2 ring-[#287DFA]/30';
    }
    if (isSelected) {
      return 'border-2 border-slate-700 shadow-md';
    }
    return 'border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm';
  };

  const getDynamicReasons = () => {
    const reasons = [];
    if (plan.reason) {
      reasons.push({ icon: <Check className="w-3 h-3 stroke-[3]" />, text: plan.reason, color: 'text-emerald-700 bg-emerald-100' });
    }
    if (plan.time_saved_minutes > 0) {
      reasons.push({ icon: <Clock className="w-3 h-3 stroke-[3]" />, text: `Saves ${plan.time_saved_minutes} mins`, color: 'text-indigo-700 bg-indigo-100' });
    }
    if (plan.estimated_cost === 0 && plan.priority !== 'MAX_REFUND') {
      reasons.push({ icon: <ShieldCheck className="w-3 h-3 stroke-[3]" />, text: `Zero out-of-pocket cost`, color: 'text-emerald-700 bg-emerald-100' });
    }
    if (plan.estimated_refund > 0) {
      reasons.push({ icon: <Zap className="w-3 h-3 stroke-[3]" />, text: `Refunds ₹${plan.estimated_refund}`, color: 'text-emerald-700 bg-emerald-100' });
    }
    return reasons;
  };

  const keyReasons = getDynamicReasons();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (onSelect) onSelect(plan);
      }}
      className={`bg-white rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-200 text-left ${getBorderClasses()}`}
    >
      {/* Recommended Ribbon */}
      {isRecommended && (
        <div className="bg-[#287DFA] text-white text-[10px] font-extrabold text-center py-2 px-3 tracking-wider uppercase font-mono flex items-center justify-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span>🏆 RECOMMENDED FOR YOU • {plan.score}/100 Match</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center ${
                isRecommended
                  ? 'bg-[#EAF3FF] text-[#287DFA]'
                  : plan.priority === 'CHEAPEST'
                  ? 'bg-orange-50 text-[#FF7700]'
                  : plan.priority === 'MAX_REFUND'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                {plan.priority} RECOVERY
              </span>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-serif leading-tight">
                {plan.title || `Rebook ${plan.node_title}`}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
              Fit Score
            </span>
            <span className={`text-sm sm:text-base font-extrabold font-mono ${
              isRecommended ? 'text-[#287DFA]' : 'text-slate-700'
            }`}>
              {plan.score}<span className="text-xs text-slate-400">/100</span>
            </span>
          </div>
        </div>

        {plan.subtitle && (
          <p className="text-xs text-slate-500 leading-relaxed -mt-1">
            {plan.subtitle}
          </p>
        )}

        {/* 4-Metric Badges Grid */}
        <PlanMetrics
          timeSavedMinutes={plan.time_saved_minutes}
          estimatedCost={plan.estimated_cost}
          estimatedRefund={plan.estimated_refund}
          affectedNodes={plan.affected_nodes}
          compact={!isRecommended}
        />

        {/* Dynamic "Why this plan?" section */}
        {keyReasons.length > 0 && (
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100/80 text-left">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#287DFA] block mb-2">
              Key Advantages
            </span>
            <div className="flex flex-col gap-2">
              {keyReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug font-medium">
                  <div className={`p-0.5 rounded shrink-0 ${reason.color}`}>
                    {reason.icon}
                  </div>
                  <span>{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Details Breakdown (if present) */}
        {plan.details && isRecommended && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] flex flex-col gap-1.5 font-medium">
            {plan.details.transit && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transit Shift:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[240px]">
                  {plan.details.transit}
                </span>
              </div>
            )}
            {plan.details.cab && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cab Transfer:</span>
                <span className="text-emerald-600 font-semibold truncate max-w-[240px]">
                  {plan.details.cab}
                </span>
              </div>
            )}
            {plan.details.hotel && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Hotel Check-In:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[240px]">
                  {plan.details.hotel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto text-left">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            TripResQ Action
          </span>
          <span className="text-xs font-bold text-slate-700">
            {plan.action ? plan.action.replace(/_/g, ' ') : 'SIMULATED REBOOKING'}
          </span>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          {!isRecommended && onSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(plan);
              }}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Choose
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onApply) onApply(plan);
            }}
            disabled={isApplying}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
              isRecommended
                ? 'bg-[#287DFA] hover:bg-[#1C6BDB] text-white shadow-blue-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            } ${isApplying ? 'opacity-75 cursor-wait' : ''}`}
          >
            {isApplying ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Applying your recovery plan...</span>
              </>
            ) : (
              <>
                <span>APPLY RECOVERY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
