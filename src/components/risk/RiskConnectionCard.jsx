import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import RiskFactors from './RiskFactors';

const RISK_STYLES = {
  CRITICAL: {
    chip: 'bg-red-100 text-red-700 border-red-200',
    badge: 'bg-red-600 text-white',
    bar: 'bg-red-500',
    ring: 'border-red-200 bg-red-50/30 hover:border-red-300',
    btn: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
  },
  HIGH: {
    chip: 'bg-orange-100 text-[#E06600] border-orange-200',
    badge: 'bg-[#FF7700] text-white',
    bar: 'bg-[#FF7700]',
    ring: 'border-orange-200 bg-orange-50/30 hover:border-orange-300',
    btn: 'bg-[#FF7700] hover:bg-[#E06600] text-white shadow-xs',
  },
  MEDIUM: {
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
    badge: 'bg-amber-500 text-white',
    bar: 'bg-amber-400',
    ring: 'border-amber-200 bg-amber-50/20 hover:border-amber-300',
    btn: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs',
  },
  LOW: {
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    bar: 'bg-emerald-500',
    ring: 'border-emerald-200 bg-emerald-50/15 hover:border-emerald-300',
    btn: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80',
  },
};

export default function RiskConnectionCard({
  conn,
  plan,
  planLoading,
  applying,
  onPrecompute,
  onApply
}) {
  const [expanded, setExpanded] = useState(false);
  const styles = RISK_STYLES[conn.risk_level] || RISK_STYLES.LOW;
  const isHighRisk = conn.risk_level === 'HIGH' || conn.risk_level === 'CRITICAL' || conn.risk_level === 'MEDIUM';

  const hist = conn?.factors?.historical;
  const seas = conn?.factors?.seasonal;
  const bufferMins = conn?.connection_buffer_minutes ?? 0;
  const safeBuffer = conn?.safe_buffer_minutes ?? 30;
  const isTight = bufferMins < safeBuffer;

  const seasonLabel = seas?.raw_score >= 0.5 ? 'Severe' : seas?.raw_score >= 0.3 ? 'Moderate' : 'Low';
  const applyResult = plan?.applyResult;

  return (
    <div className={`rounded-xl border p-3.5 sm:p-4 flex flex-col gap-2.5 transition-all duration-200 shadow-xs ${styles.ring}`}>
      {/* 1. Header: Risk Title & Level Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm">🔮</span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            RISK RADAR
          </span>
          {conn.proactively_flagged && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-slate-900 text-amber-300 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> Flagged Pre-Disruption
            </span>
          )}
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide border ${styles.chip}`}>
          {conn.risk_level} • {conn.risk_score}/100
        </span>
      </div>

      {/* 2. Compact Route Flow */}
      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold flex-wrap">
        <span className="text-slate-900">{conn.source_title}</span>
        {conn.source_origin && conn.source_destination && (
          <span className="text-[11px] font-mono px-1 py-0.2 rounded bg-slate-200/70 text-slate-700 font-normal">
            {conn.source_origin} → {conn.source_destination}
          </span>
        )}
        <span className="text-slate-400 font-mono text-[11px]">→</span>
        <span className="text-slate-900">{conn.target_title}</span>
        {conn.target_location && (
          <span className="text-[11px] text-slate-400 font-normal">
            ({conn.target_location.split('•')[0].trim()})
          </span>
        )}
      </div>

      {/* 3. Summary Metric Badges (Very compact row) */}
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        {/* Buffer metric */}
        <span className={`px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 ${
          isTight ? 'bg-amber-50 text-amber-800 border-amber-200/80 font-bold' : 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          {isTight ? '⚠' : '✓'} {bufferMins}m buffer
        </span>

        {/* Historical delay metric */}
        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium">
          {hist?.available ? `Hist. delay ${Math.round((hist.delayed_30_rate || 0) * 100)}%` : 'History: N/A'}
        </span>

        {/* Seasonal metric */}
        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 font-medium">
          Season: {seasonLabel}
        </span>
      </div>

      {/* 4. Action Row: [Why?] toggle + CTA Button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 flex-wrap">
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-md border border-slate-200 transition cursor-pointer flex items-center gap-1"
        >
          <span>{expanded ? 'Hide Details' : 'Why?'}</span>
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </button>

        {!plan && (
          <button
            type="button"
            onClick={onPrecompute}
            disabled={planLoading}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${styles.btn}`}
          >
            {planLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {planLoading ? 'Pre-computing…' : isHighRisk ? 'Protect Connection' : 'Pre-compute Buffer Plan'}
          </button>
        )}
      </div>

      {/* 5. Expandable Detailed Factor Breakdown */}
      {expanded && <RiskFactors conn={conn} />}

      {/* 6. Buffer Plan Projection Drawer */}
      {plan && !applyResult && (
        <div className="border-t border-slate-200/70 pt-2.5 flex flex-col gap-2 bg-slate-50/80 -mx-3.5 -mb-3.5 p-3.5 sm:-mx-4 sm:-mb-4 sm:p-4 rounded-b-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="text-slate-600">Buffer: <b>{plan.current.buffer_minutes}m</b> → <b className="text-emerald-600">{plan.projected.buffer_minutes}m</b></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Risk Radar: <b>{plan.current.risk_score}/100</b> → <b className="text-emerald-600">{plan.projected.risk_score}/100</b></span>
          </div>

          <ul className="flex flex-col gap-1 mt-0.5">
            {plan.steps.map((s, i) => (
              <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                <span>{s.detail}</span>
              </li>
            ))}
          </ul>

          {plan.can_auto_apply && (
            <button
              type="button"
              onClick={onApply}
              disabled={applying}
              className="self-start px-3.5 py-1.5 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-[11px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 mt-1 shadow-xs"
            >
              {applying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
              {applying ? 'Applying…' : 'Apply buffer plan now'}
            </button>
          )}
        </div>
      )}

      {/* 7. Apply Result Feedback */}
      {applyResult && (
        <div className="border-t border-slate-200/70 pt-2.5 flex items-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50/70 -mx-3.5 -mb-3.5 p-3 sm:-mx-4 sm:-mb-4 sm:p-3 rounded-b-xl">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applyResult.applied ? applyResult.message : applyResult.reason}</span>
        </div>
      )}
    </div>
  );
}
