import React from 'react';
import RestaurantCard from './RestaurantCard';
import { detectCuisineCategory } from '../../services/restaurantImageService';
import { UtensilsCrossed, AlertCircle, RotateCcw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 9;

export default function DiningResults({
  restaurants = [],
  locationName = 'Selected Location',
  radiusKm = 3,
  currentPage = 0,
  onPageChange,
  isLoading = false,
  error = null,
  activeFilter = 'all',
  onResetFilters,
  onSelectRestaurant
}) {
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-[#287DFA] animate-spin mb-3" />
        <h4 className="text-base font-bold text-slate-800">
          Finding restaurants near {locationName}...
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Querying real OpenStreetMap amenities within {radiusKm} km
        </p>

        {/* 9 Skeleton cards in 3x3 desktop grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full mt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-pulse text-left">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-slate-100 rounded w-2/3"></div>
                <div className="h-4 bg-slate-100 rounded w-16"></div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-3 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/3 mt-3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
        <h4 className="text-base font-bold text-rose-900">Unable to load restaurants</h4>
        <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  const totalResults = restaurants.length;

  if (totalResults === 0) {
    return (
      <div className="py-14 text-center bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800 mb-1">
          No nearby restaurants found within {radiusKm} km.
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          {activeFilter !== 'all'
            ? `No venues match the "${activeFilter.replace('_', ' ')}" filter. Try resetting filters or expanding search radius.`
            : 'Try a larger radius or search another location.'}
        </p>
        {activeFilter !== 'all' && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to All Places</span>
          </button>
        )}
      </div>
    );
  }

  // Pagination calculation
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);
  const safeCurrentPage = Math.min(Math.max(0, currentPage), Math.max(0, totalPages - 1));
  const startIndex = safeCurrentPage * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults);
  const visibleRestaurants = restaurants.slice(startIndex, endIndex);

  return (
    <div className="space-y-5 text-left">
      {/* Results Header: Real count & Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 font-serif">
            Restaurants near <span className="text-[#287DFA]">{locationName}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalResults} {totalResults === 1 ? 'place' : 'places'} found • Showing {startIndex + 1}–{endIndex}
          </p>
        </div>

        {totalPages > 1 && (
          <div className="text-xs font-semibold text-slate-500 font-mono self-start sm:self-auto">
            Page {safeCurrentPage + 1} of {totalPages}
          </div>
        )}
      </div>

      {/* Responsive Grid: 3 cols desktop (3x3 = 9 cards), 2 cols tablet, 1 col mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(() => {
          const categoryCounts = {};
          return visibleRestaurants.map((r, idx) => {
            const cat = detectCuisineCategory(r);
            const catIndex = categoryCounts[cat] || 0;
            categoryCounts[cat] = catIndex + 1;
            return (
              <RestaurantCard
                key={r.id || `${startIndex + idx}`}
                restaurant={r}
                index={startIndex + idx + 1}
                categoryIndex={catIndex}
                onSelect={onSelectRestaurant}
              />
            );
          });
        })()}
      </div>

      {/* Compact Pagination Navigation Controls */}
      {totalPages > 1 && (
        <div className="pt-5 flex items-center justify-between gap-3 border-t border-slate-100">
          <button
            type="button"
            id="btn-pagination-prev"
            onClick={() => {
              if (safeCurrentPage > 0 && onPageChange) {
                onPageChange(safeCurrentPage - 1);
                const el = document.getElementById('dining-results-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            disabled={safeCurrentPage === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <span>Previous</span>
          </button>

          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-lg font-mono">
            Page {safeCurrentPage + 1} of {totalPages}
          </div>

          <button
            type="button"
            id="btn-pagination-next"
            onClick={() => {
              if (safeCurrentPage < totalPages - 1 && onPageChange) {
                onPageChange(safeCurrentPage + 1);
                const el = document.getElementById('dining-results-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            disabled={safeCurrentPage >= totalPages - 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#287DFA] hover:bg-[#1C6BDB] text-white disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* OSM Attribution footer */}
      <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100">
        Map data & places © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">OpenStreetMap contributors</a> via Overpass API & Nominatim
      </div>
    </div>
  );
}
