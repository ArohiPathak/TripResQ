import React from 'react';
import { Train, Plane, Hotel, MapPin, Clock, Moon, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

/**
 * Smart headline resolver based on node type
 */
export function getSmartHeadline(nodeType) {
  switch (nodeType) {
    case 'TRAIN':
      return 'Dining near your arrival station';
    case 'FLIGHT':
      return 'Dining near your arrival airport';
    case 'HOTEL':
      return 'Dining near your hotel';
    case 'ACTIVITY':
      return 'Dining near your next destination';
    default:
      return 'Dining near your next stop';
  }
}

/**
 * Format ISO or time string into human-readable 12-hr format (e.g. 7:35 PM)
 */
export function formatArrivalTime(timeStr) {
  if (!timeStr) return null;
  try {
    if (timeStr.includes('T')) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      }
    }
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const mins = parts[1].padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${mins} ${ampm}`;
    }
  } catch {
    return timeStr;
  }
  return timeStr;
}

export default function NextStopDining({
  nextStop,
  isLoading,
  onRefresh,
  radiusKm = 3,
  resolvedLocationName,
  onExploreFood
}) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse text-left">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-3"></div>
        <div className="h-7 bg-slate-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
      </div>
    );
  }

  // Handle No Active Trip or No Upcoming Stop empty states
  if (!nextStop || !nextStop.available) {
    const reason = nextStop?.reason;
    let message = "Your itinerary has no upcoming stops. Try current location or search manually.";
    if (reason === 'NO_ACTIVE_TRIP' || reason === 'TRIP_NOT_FOUND') {
      message = "No active trip found. Use your current location or search an area instead.";
    }

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">No Upcoming Stop Detected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recheck Itinerary</span>
          </button>
        </div>
      </div>
    );
  }

  const headline = getSmartHeadline(nextStop.node_type);
  const formattedTime = formatArrivalTime(nextStop.arrival_time);
  const stopDisplayName = nextStop.name || nextStop.location || nextStop.destination || resolvedLocationName || 'Upcoming Destination';

  const getNodeIcon = (type) => {
    switch (type) {
      case 'FLIGHT': return <Plane className="w-5 h-5 text-[#287DFA]" />;
      case 'TRAIN': return <Train className="w-5 h-5 text-amber-600" />;
      case 'HOTEL': return <Hotel className="w-5 h-5 text-indigo-600" />;
      default: return <MapPin className="w-5 h-5 text-[#287DFA]" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50/50 via-white to-white border border-[#287DFA]/20 rounded-2xl p-5 sm:p-6 shadow-sm text-left relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#287DFA] text-[11px] font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Itinerary Auto-Detected
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif tracking-tight mb-2">
            {headline}
          </h2>

          {/* Location & Time details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                {getNodeIcon(nextStop.node_type)}
              </div>
              <span className="text-base font-extrabold">{stopDisplayName}</span>
            </div>

            {formattedTime && (
              <div className="flex items-center gap-1.5 text-slate-600 border-l border-slate-200 pl-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Arriving at <strong className="text-slate-900 font-bold">{formattedTime}</strong></span>
              </div>
            )}

            <div className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Showing places within {radiusKm} km
            </div>
          </div>
        </div>

        {/* Action Button */}
        {onExploreFood && (
          <div className="flex-shrink-0">
            <button
              type="button"
              id="btn-find-food-next-stop"
              onClick={onExploreFood}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#287DFA] hover:bg-[#1C6BDB] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#287DFA]/15 transition cursor-pointer"
            >
              <span>Find food near {stopDisplayName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
