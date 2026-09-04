import React from 'react';
import {
  AlertTriangle,
  Users,
  ShieldAlert,
  ShieldCheck,
  Plane,
  AlertOctagon,
  CheckCircle2,
  HeartHandshake,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function FamilyFractureRescue({
  cohort,
  simulationData,
  rejectedPlans = [],
  unifiedPlan,
  onApplyGroupRecovery,
  isApplying = false,
  isLoadedFromBackend = false,
  hasFractureDemo = true,
  onAddDemo,
  isLoadingDemo = false,
  onResetDemo
}) {
  // Dynamic flight title from unified plan if available
  const unifiedFlightTitle = unifiedPlan?.title || 'Flight AI-502 (Express Connection)';

  // Traveler flight assignments loaded directly from backend simulation if present
  const airlineSplit = simulationData?.scenarios?.airline_split?.traveler_details || [
    {
      traveler_id: 'T1',
      name: 'Rahul',
      role: 'ADULT • GUARDIAN',
      avatar: '👨',
      pnr: 'PNR-A123',
      flight: 'Flight AI-204 (Air India)',
      departure: '14:15 • Terminal 3',
      status: 'Separated on Flight A',
      is_minor_alone: false
    },
    {
      traveler_id: 'T2',
      name: 'Priya',
      role: 'ADULT • GUARDIAN',
      avatar: '👩',
      pnr: 'PNR-B456',
      flight: 'Flight 6E-501 (IndiGo)',
      departure: '16:30 • Terminal 1',
      status: 'Separated on Flight B',
      is_minor_alone: false
    },
    {
      traveler_id: 'T3',
      name: 'Aarav',
      role: 'CHILD (AGE 8) • MINOR',
      avatar: '👦',
      pnr: 'PNR-C789',
      flight: 'Flight UK-812 (Vistara)',
      departure: '18:00 • Terminal 2',
      status: 'UNACCOMPANIED MINOR HAZARD',
      is_minor_alone: true
    }
  ];

  // Find violations from backend simulation or rejectedPlans
  const backendViolations = (
    simulationData?.scenarios?.airline_split?.validation?.violations ||
    rejectedPlans.flatMap(p => p.violations || [])
  );

  const violationsList = backendViolations.length > 0 ? backendViolations : [
    {
      rule: 'CHILD_GUARDIAN',
      severity: 'HARD',
      title: 'Unaccompanied Minor Hazard',
      message: 'Aarav (Child) would be separated from all designated guardians (Rahul & Priya) on separate flight UK-812 without adult supervision.'
    },
    {
      rule: 'COHORT_COHESION',
      severity: 'HARD',
      title: 'Family Cohort Fracture',
      message: 'Family Cohort COHORT-001 fractured across 3 different airlines and airport terminals due to separate PNR booking systems.'
    },
    {
      rule: 'BOOKING_DEPENDENCY',
      severity: 'SOFT',
      title: 'Lodging & Logistics Desynchronized',
      message: 'Primary hotel lead guest (Rahul) arrives 3 hours 45 minutes before Aarav, leaving child transport unsynchronized.'
    }
  ];

  // If the demo has not been triggered yet, display the interactive launcher card
  if (!hasFractureDemo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col gap-6"
      >
        <div className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-dashed border-amber-300 shadow-sm flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200">
            👨‍👩‍👦
          </div>

          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider font-mono">
              <Users className="w-3.5 h-3.5 text-amber-800" />
              <span>Interactive Cohort Demo</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Split-Party & Family Fracture Protection
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              In real-world airline disruptions, families traveling under separate PNRs are fragmented onto different flights by automated rebooking systems. Click below to inject a live multi-PNR fracture scenario and observe TripResQ's Cohort Constraint Engine in action.
            </p>
          </div>

          {/* Preview of the 3 travelers in the cohort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left font-mono text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">👨</span>
              <div>
                <div className="font-bold text-slate-900">Rahul</div>
                <div className="text-[11px] text-slate-500">PNR-A123 • Adult</div>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">👩</span>
              <div>
                <div className="font-bold text-slate-900">Priya</div>
                <div className="text-[11px] text-slate-500">PNR-B456 • Adult</div>
              </div>
            </div>
            <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-xl flex items-center gap-3">
              <span className="text-2xl">👦</span>
              <div>
                <div className="font-bold text-amber-950">Aarav (Age 8)</div>
                <div className="text-[11px] text-amber-700 font-bold">PNR-C789 • Child</div>
              </div>
            </div>
          </div>

          {/* Interactive Trigger Button */}
          <button
            type="button"
            onClick={onAddDemo}
            disabled={isLoadingDemo}
            className="px-7 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:shadow-amber-500/30 transition cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
          >
            <Users className="w-5 h-5 text-slate-950" />
            <span>{isLoadingDemo ? 'Adding Family Fracture scenario...' : '👨‍👩‍👦 Add Family Fracture Demo'}</span>
          </button>

          <div className="text-slate-400 text-xs font-mono">
            Clicking will seed COHORT-001 in backend & load live fracture simulation data
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-6"
    >
      {/* 🚨 1. PRIMARY ALERT BANNER */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl relative overflow-hidden border border-red-400/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 border border-white/20 text-xs font-extrabold uppercase tracking-wider text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>🚨 FAMILY FRACTURE DETECTED • 3 SEPARATE PNRs</span>
              </div>
              {isLoadedFromBackend && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-[11px] font-mono font-black text-emerald-300 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  [data loaded from backend]
                </span>
              )}
              {cohort?.cohort_id && (
                <span className="text-[10px] font-mono bg-white/15 px-2.5 py-1 rounded-full text-white/90 font-bold border border-white/10">
                  {cohort.cohort_id}: {cohort.name || 'Family Trip'}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-serif">
              "Your airline rebooking separates your group."
            </h2>

            <p className="text-white/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Automated carrier algorithms rebooked your group independently because tickets exist under different PNRs (<code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-amber-200">PNR-A123</code>, <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-amber-200">PNR-B456</code>, <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-amber-200">PNR-C789</code>). TripResQ's Cohort Constraint Engine rejected this rebooking to protect your family.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-amber-200 font-bold">Group Protection</div>
              <div className="text-lg font-black font-mono">3 Travelers</div>
              <div className="text-[11px] text-white/80">1 Child • 2 Guardians</div>
            </div>

            {onResetDemo && (
              <button
                type="button"
                onClick={onResetDemo}
                className="px-3 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Reset simulation demo"
              >
                <span>🔄 Reset Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📍 2. SHOW EXACTLY WHO WENT WHERE (FLAWED AIRLINE REBOOKING) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-red-200/90 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flawed Airline Rebooking • Fracture Map</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
              Where the Airline Attempted to Send Your Party
            </h3>
          </div>
          <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full shrink-0">
            3 Disjoint Flights
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {airlineSplit.map((traveler) => {
            const isMinorAlone = Boolean(traveler.is_minor_alone || traveler.isMinorAlone);
            return (
              <div
                key={traveler.name}
                className={`p-4 rounded-xl border relative flex flex-col justify-between gap-3 transition ${
                  isMinorAlone
                    ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400/40'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {isMinorAlone && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-xs animate-bounce">
                    🚨 Unaccompanied Minor
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-2xl">{traveler.avatar}</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {traveler.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
                        {traveler.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>PNR:</span>
                      <span className="font-bold text-slate-800">{traveler.pnr}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Airline Flight:</span>
                      <span className="font-bold text-red-600">{traveler.flight}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Departure:</span>
                      <span>{traveler.departure}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-center ${
                    isMinorAlone
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {traveler.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🛑 3. SHOW WHY IT VIOLATES THE COHORT */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="text-[11px] font-mono font-bold text-[#FF7700] uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Policy & Safety Enforcement</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
            Why TripResQ Rejected This Airline Rebooking
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {violationsList.map((violation, index) => {
            const isHard = violation.severity === 'HARD';
            return (
              <div
                key={index}
                className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  isHard
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                      isHard ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    {violation.rule} • {violation.severity || 'HARD'}
                  </span>
                  <ShieldAlert className={`w-4 h-4 ${isHard ? 'text-rose-600' : 'text-amber-600'}`} />
                </div>

                <h4 className="font-bold text-xs sm:text-sm">
                  {violation.title || (violation.rule === 'CHILD_GUARDIAN' ? 'Child Guardian Separation' : 'Cohort Cohesion Violation')}
                </h4>

                <p className="text-[11px] sm:text-xs leading-relaxed opacity-90">
                  {violation.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🛡️ 4. TRIPRESQ'S UNIFIED RESCUE & [ APPLY GROUP RECOVERY ] */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>TripResQ Unified Family Rescue • APPROVED (VALID)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                Keep Rahul + Priya + Aarav Together on One Flight
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                TripResQ's recovery engine overrides airline PNR silos by re-synchronizing all 3 travelers onto the same express departure slot, guaranteeing adjacent seats and protected downstream connections.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end">
              <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">Unified Connection</span>
              <span className="text-base font-black text-white font-mono">{unifiedFlightTitle}</span>
              <span className="text-xs text-emerald-200">All 3 Travelers Together</span>
            </div>
          </div>

          {/* Unified Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <Plane className="w-3 h-3" /> Shared Flight
              </span>
              <span className="font-bold text-white text-sm">{unifiedFlightTitle}</span>
              <span className="text-white/70 text-[11px]">Next express departure • Dep: 17:34</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <Users className="w-3 h-3" /> Seating Preference
              </span>
              <span className="font-bold text-white text-sm">Row 14 (A, B, C)</span>
              <span className="text-white/70 text-[11px]">Adjacent seating requested</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Guardian Rule
              </span>
              <span className="font-bold text-white text-sm">100% Protected</span>
              <span className="text-white/70 text-[11px]">Aarav with Rahul & Priya</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Downstream Cab & Hotel
              </span>
              <span className="font-bold text-white text-sm">Synchronized</span>
              <span className="text-white/70 text-[11px]">Cab: 20:19 • Late Check-In OK</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero cancellation risk • Compliant with minor travel regulations</span>
            </div>

            <button
              type="button"
              onClick={onApplyGroupRecovery}
              disabled={isApplying}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <HeartHandshake className="w-4 h-4 text-slate-950" />
              <span>
                {isApplying ? 'Applying Unified Recovery...' : '🛡️ Apply Group Recovery (3 Travelers)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
