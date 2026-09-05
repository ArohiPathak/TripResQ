import React, { useState } from 'react';
import { Compass, Navigation, Search, Train, Plane, Hotel, MapPin, AlertCircle, Loader2 } from 'lucide-react';

/**
 * DiningLocationSelector component
 *
 * Provides a 3-way toggle between:
 * 1. 'next_stop' -> Near My Next Stop (TripResQ default)
 * 2. 'current_loc' -> Use My Location (Real browser geolocation)
 * 3. 'search' -> Search Location (Real Nominatim geocoding)
 */
export default function DiningLocationSelector({
  activeMode,
  onModeChange,
  onSearchSubmit,
  searchQuery,
  setSearchQuery,
  isLoadingLocation,
  locationError,
  nextStopAvailable,
  nextStopData
}) {
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery || '');

  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    if (localSearchInput.trim()) {
      onSearchSubmit(localSearchInput.trim());
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'FLIGHT': return <Plane className="w-3.5 h-3.5 text-[#287DFA]" />;
      case 'TRAIN': return <Train className="w-3.5 h-3.5 text-amber-600" />;
      case 'HOTEL': return <Hotel className="w-3.5 h-3.5 text-indigo-600" />;
      default: return <MapPin className="w-3.5 h-3.5 text-[#287DFA]" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[#287DFA] uppercase font-mono">
            Location Discovery Mode
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Where should we look?
          </h2>
        </div>
        {nextStopAvailable && nextStopData && activeMode === 'next_stop' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] border border-[#287DFA]/20 text-[#287DFA] text-xs font-semibold self-start sm:self-auto">
            {getNodeIcon(nextStopData.node_type)}
            <span>Synced to Itinerary Stop</span>
          </div>
        )}
      </div>

      {/* 3-Way Mode Switcher using TripResQ Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-xl">
        <button
          type="button"
          id="btn-dining-next-stop"
          onClick={() => onModeChange('next_stop')}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeMode === 'next_stop'
              ? 'bg-[#287DFA] text-white shadow-sm shadow-[#287DFA]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Compass className={`w-4 h-4 ${activeMode === 'next_stop' ? 'text-white' : 'text-[#287DFA]'}`} />
          <span>Near My Next Stop</span>
        </button>

        <button
          type="button"
          id="btn-dining-my-location"
          onClick={() => onModeChange('current_loc')}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeMode === 'current_loc'
              ? 'bg-[#287DFA] text-white shadow-sm shadow-[#287DFA]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          {isLoadingLocation && activeMode === 'current_loc' ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Navigation className={`w-4 h-4 ${activeMode === 'current_loc' ? 'text-white' : 'text-[#287DFA]'}`} />
          )}
          <span>Use My Location</span>
        </button>

        <button
          type="button"
          id="btn-dining-search-location"
          onClick={() => onModeChange('search')}
          className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer ${
            activeMode === 'search'
              ? 'bg-[#287DFA] text-white shadow-sm shadow-[#287DFA]/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Search className={`w-4 h-4 ${activeMode === 'search' ? 'text-white' : 'text-[#287DFA]'}`} />
          <span>Search Location</span>
        </button>
      </div>

      {/* Search Input field (displayed when in search mode) */}
      {activeMode === 'search' && (
        <form onSubmit={handleSearchFormSubmit} className="mt-3.5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="input-dining-search"
              placeholder="Enter station, airport, hotel, landmark, or city (e.g., Pune Railway Station, Bandra Mumbai)..."
              value={localSearchInput}
              onChange={(e) => {
                setLocalSearchInput(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#287DFA] focus:ring-2 focus:ring-[#287DFA]/20 transition"
            />
          </div>
          <button
            type="submit"
            id="btn-dining-search-submit"
            disabled={isLoadingLocation}
            className="px-5 py-2.5 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-sm font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isLoadingLocation && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Find Food</span>
          </button>
        </form>
      )}

      {locationError && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>{locationError}</span>
        </div>
      )}
    </div>
  );
}
