import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';

const RISK_BADGE_STYLES = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-[#E06600] border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function RiskBanner({
  riskRadar,
  loading = false,
  onRefresh
}) {
  const level = riskRadar?.overall_risk_level || 'LOW';
  const score = riskRadar?.overall_risk_score ?? 0;
  const count = riskRadar?.connections?.length ?? 0;
  const badgeStyle = RISK_BADGE_STYLES[level] || RISK_BADGE_STYLES.LOW;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 p-3 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200/70">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-[#EAF3FF] text-[#287DFA] shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Risk Radar — Proactive Connection Monitoring
          </h3>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            Pre-disruption schedule and connection protection
          </div>
        </div>
      </div>

      {riskRadar && (
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${badgeStyle} shadow-2xs`}>
            Trip Risk: {level} • {score}/100
            {count > 0 && (
              <span className="font-normal opacity-80 ml-1.5">
                · {count} {count === 1 ? 'connection' : 'connections'} monitored
              </span>
            )}
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh Risk Radar"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
