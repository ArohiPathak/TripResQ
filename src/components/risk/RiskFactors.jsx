import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Info } from 'lucide-react';

/**
 * RiskFactors component - Expandable details section showing the technical factor breakdown.
 *
 * Conditional rendering:
 * - When historical data exists: renders 3 columns (Historical Delay Evidence, Connection Buffer, Seasonal Conditions)
 * - When historical data is unavailable: renders 2 columns (Connection Buffer, Seasonal Conditions) + subtle footnote
 */
export default function RiskFactors({ conn }) {
  const hist = conn?.factors?.historical;
  const seas = conn?.factors?.seasonal;
  const hasHistory = Boolean(hist?.available);
  const confidence = conn?.data_confidence || { level: 'INSUFFICIENT_DATA', score: 0 };
  const safeBuffer = conn?.safe_buffer_minutes || 30;
  const currentBuffer = conn?.connection_buffer_minutes ?? 0;
  const extraNeeded = conn?.recommended_extra_buffer_minutes ?? 0;
  const isTight = currentBuffer < safeBuffer;

  return (
    <div className="pt-3 border-t border-slate-200/70 flex flex-col gap-3 text-xs animate-in fade-in duration-200">
      {hasHistory ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Historical Delay Evidence */}
          <div className="p-3 bg-white/90 rounded-lg border border-slate-200/70 flex flex-col gap-1.5 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Historical Delay Evidence
            </div>
            <div className="flex flex-col gap-0.5 text-[11px] text-slate-700">
              <div>30+ min delay rate: <b className="text-slate-900 font-bold">{Math.round((hist.delayed_30_rate || 0) * 100)}%</b></div>
              <div>Average delay: <b className="text-slate-900 font-bold">{hist.avg_delay_minutes ?? 0} min</b></div>
              <div>Observations: <b className="text-slate-900 font-bold">{hist.sample_size ?? 0}</b></div>
              <div className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200/50">
                Historical Data Quality: <b className="text-slate-900 font-semibold">{confidence.level}</b>
              </div>
            </div>
          </div>

          {/* 2. Connection Buffer */}
          <div className="p-3 bg-white/90 rounded-lg border border-slate-200/70 flex flex-col gap-1.5 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Connection Buffer
            </div>
            <div className="flex flex-col gap-0.5 text-[11px] text-slate-700">
              <div>Available: <b className="text-slate-900 font-bold">{currentBuffer} min</b></div>
              <div>Recommended: <b className="text-slate-900 font-bold">{safeBuffer} min</b></div>
              <div className="mt-1 pt-1 border-t border-slate-200/50">
                Status: {isTight ? (
                  <b className="text-amber-600 font-bold">Tight (+{extraNeeded}m needed)</b>
                ) : (
                  <b className="text-emerald-700 font-bold">Comfortably buffered</b>
                )}
              </div>
            </div>
          </div>

          {/* 3. Seasonal Conditions */}
          <div className="p-3 bg-white/90 rounded-lg border border-slate-200/70 flex flex-col gap-1.5 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Seasonal Conditions
            </div>
            <div className="flex flex-col gap-0.5 text-[11px] text-slate-700">
              <div>Conditions: <b className="text-slate-900 font-bold">
                {seas?.raw_score >= 0.5 ? 'Severe' : seas?.raw_score >= 0.3 ? 'Moderate' : 'Favorable'}
              </b></div>
              <div>Risk factor: <b className="text-slate-900 font-bold">
                {seas?.raw_score >= 0.5 ? 'High' : seas?.raw_score >= 0.3 ? 'Moderate' : 'Low'} ({Math.round((seas?.raw_score || 0.15) * 100)}/100)
              </b></div>
              <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-200/50">
                Region: {seas?.location_keyword || 'standard'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Connection Buffer */}
            <div className="p-3 bg-white/90 rounded-lg border border-slate-200/70 flex flex-col gap-1.5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Connection Buffer
              </div>
              <div className="flex flex-col gap-0.5 text-[11px] text-slate-700">
                <div>Available: <b className="text-slate-900 font-bold">{currentBuffer} min</b></div>
                <div>Recommended: <b className="text-slate-900 font-bold">{safeBuffer} min</b></div>
                <div className="mt-1 pt-1 border-t border-slate-200/50">
                  Status: {isTight ? (
                    <b className="text-amber-600 font-bold">Tight (+{extraNeeded}m needed)</b>
                  ) : (
                    <b className="text-emerald-700 font-bold">Comfortably buffered</b>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Seasonal Conditions */}
            <div className="p-3 bg-white/90 rounded-lg border border-slate-200/70 flex flex-col gap-1.5 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Seasonal Conditions
              </div>
              <div className="flex flex-col gap-0.5 text-[11px] text-slate-700">
                <div>Conditions: <b className="text-slate-900 font-bold">
                  {seas?.raw_score >= 0.5 ? 'Severe' : seas?.raw_score >= 0.3 ? 'Moderate' : 'Favorable'}
                </b></div>
                <div>Risk factor: <b className="text-slate-900 font-bold">
                  {seas?.raw_score >= 0.5 ? 'High' : seas?.raw_score >= 0.3 ? 'Moderate' : 'Low'} ({Math.round((seas?.raw_score || 0.15) * 100)}/100)
                </b></div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-200/50">
                  Region: {seas?.location_keyword || 'standard'}
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Historical route evidence unavailable. Score currently uses available connection and seasonal factors.</span>
          </p>
        </div>
      )}

      {/* Evaluated timestamp */}
      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>Last evaluated: {conn.last_evaluated_at ? new Date(conn.last_evaluated_at).toLocaleTimeString() : 'Just now'}</span>
      </div>
    </div>
  );
}
