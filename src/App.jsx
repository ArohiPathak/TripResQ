import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Train,
  Car,
  Hotel,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Plus,
  Play,
  RefreshCw,
  Clock,
  Trash2,
  Check,
  ArrowRight,
  User,
  Menu,
  Heart,
  ChevronRight,
  ShieldAlert,
  MapPin,
  Users
} from 'lucide-react';
import './App.css';

// --- Page Definition ---
// currentPage: 'home' | 'my-trip' | 'rescue'

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDisrupted, setIsDisrupted] = useState(false);
  const [searchTab, setSearchTab] = useState('flights');
  
  // Search Form State
  const [searchFrom, setSearchFrom] = useState('Mumbai (BOM)');
  const [searchTo, setSearchTo] = useState('Pune (PNQ)');
  const [searchDate, setSearchDate] = useState('2026-08-31');
  const [searchGuests, setSearchGuests] = useState('1 Passenger, Economy');

  // Success states
  const [successPlanAccepted, setSuccessPlanAccepted] = useState(null); // 'fastest' | 'cheapest' | 'refund'

  // --- Dynamic Itinerary Times ---
  // When disrupted: train is delayed by 3 hours (+180m).
  // Train Scheduled: 08:00 - 11:00
  // Cab Scheduled: 11:30 - 12:30
  // Hotel Check-in Scheduled: 13:00
  const baseTrainArrival = "11:00";
  const actualTrainArrival = isDisrupted ? "14:00" : "11:00";
  const actualCabStart = isDisrupted ? "14:15 (Delayed)" : "11:30";
  const actualCabEnd = isDisrupted ? "15:15" : "12:30";
  const actualHotelCheckin = isDisrupted ? "15:30 (Late Check-in Alerted)" : "13:00";

  const handleSimulateDelay = () => {
    setIsDisrupted(true);
    setSuccessPlanAccepted(null);
  };

  const handleResetTimeline = () => {
    setIsDisrupted(false);
    setSuccessPlanAccepted(null);
  };

  const handleAcceptPlan = (planKey) => {
    setSuccessPlanAccepted(planKey);
    setTimeout(() => {
      setIsDisrupted(false); // Restore timeline to Healthy
      setSuccessPlanAccepted(null);
      setCurrentPage('my-trip'); // Redirect back to timeline
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-[#287DFA] selection:text-white font-sans">
      
      {/* --- Main Navigation Header --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[#287DFA] focus:outline-none cursor-pointer"
          >
            <div className="p-1 bg-[#287DFA] text-white rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span>TripResQ</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`hover:text-[#287DFA] transition py-1 ${currentPage === 'home' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                setCurrentPage('my-trip');
                // Ensure default view has a clean state or simulated state
              }}
              className={`hover:text-[#287DFA] transition py-1 flex items-center gap-1.5 ${currentPage === 'my-trip' ? 'text-[#287DFA] border-b-2 border-[#287DFA]' : ''}`}
            >
              My Trips
              {isDisrupted && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7700] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7700]"></span>
                </span>
              )}
            </button>
            <a href="#support" className="hover:text-[#287DFA] transition">Support</a>
          </nav>
        </div>

        {/* User profile action */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-full hover:bg-slate-50 transition">
            <Heart className="w-3.5 h-3.5 text-rose-500" /> Saved Protection
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-xs font-bold rounded-full transition shadow-sm cursor-pointer">
            <User className="w-4 h-4" /> Sign In
          </button>
        </div>
      </header>

      {/* --- Main Content Stage --- */}
      <div className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          
          {/* ================= PAGE 1: BOOKING HOMEPAGE ================= */}
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Hero Banner Grid */}
              <section className="w-full bg-gradient-to-b from-[#EAF3FF] to-white py-16 px-6 flex flex-col items-center text-center relative overflow-hidden">
                {/* Background circles */}
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-blue-100/40 blur-xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-44 h-44 rounded-full bg-orange-100/40 blur-2xl pointer-events-none" />

                <div className="max-w-2xl z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#287DFA] mb-4 shadow-sm uppercase tracking-wider font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" /> Auto-Rebooking Guard Included
                  </span>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
                    Book Your Journey.<br />
                    <span className="text-[#287DFA]">We Protect the Rest.</span>
                  </h1>
                  <p className="text-slate-600 text-base md:text-lg mb-8 leading-relaxed">
                    TripResQ is the world's first consumer travel platform with a built-in <span className="font-semibold text-slate-800">Disruption Recovery Engine</span>. If connections fail, we automatically rebook alternatives in seconds—at no cost to you.
                  </p>
                </div>

                {/* Floating Search Widget */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-left mt-4 z-20">
                  {/* Category Tabs */}
                  <div className="flex gap-2 border-b border-slate-100 pb-4 mb-6">
                    <button
                      onClick={() => setSearchTab('flights')}
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${searchTab === 'flights' ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      ✈️ Flights
                    </button>
                    <button
                      onClick={() => setSearchTab('trains')}
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${searchTab === 'trains' ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      🚆 Trains
                    </button>
                    <button
                      onClick={() => setSearchTab('hotels')}
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${searchTab === 'hotels' ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      🏨 Hotels
                    </button>
                    <button
                      onClick={() => setSearchTab('cabs')}
                      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${searchTab === 'cabs' ? 'bg-[#EAF3FF] text-[#287DFA]' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      🚕 Cabs
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">From</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchFrom}
                          onChange={(e) => setSearchFrom(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-[#287DFA] transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">To</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchTo}
                          onChange={(e) => setSearchTo(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-[#287DFA] transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Departure Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          value={searchDate}
                          onChange={(e) => setSearchDate(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-[#287DFA] transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guests / Cabin</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchGuests}
                          onChange={(e) => setSearchGuests(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm font-semibold bg-slate-50 focus:outline-none focus:border-[#287DFA] transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-slate-100 gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Free cancellation up to 24h & automatic missed connection protection.</span>
                    </div>
                    <button
                      onClick={() => setCurrentPage('my-trip')}
                      className="px-6 h-11 bg-[#287DFA] hover:bg-[#1C6BDB] text-white font-bold rounded-xl transition shadow-md shadow-[#287DFA]/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      Search Travel Deals <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Marketing Bottom Section */}
              <section className="max-w-6xl w-full px-6 py-16">
                <h2 className="text-2xl font-bold tracking-tight text-center text-slate-900 mb-10">
                  Smart Trip Protection, Reimagined
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#EAF3FF] text-[#287DFA]">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-950">Automatic Rebooking</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      If your train or flight is delayed, our system instantly triggers alternate travel vectors so you never miss a connection or check-in.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-50 text-[#FF7700]">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-950">Real-Time Risk Alerts</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      We track weather, rail lines, and airports. Get proactive notifications before disruptions cascade, putting you in control.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-950">We've Got Your Back</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Rest easy knowing you have free, automatic replacement bookings or 100% refund claims processed within minutes of disruption.
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* ================= PAGE 2: "MY TRIP" & INTERACTIVE TIMELINE ================= */}
          {currentPage === 'my-trip' && (
            <motion.div
              key="my-trip-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              {/* Trip Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Mumbai to Pune Getaway</h1>
                  <p className="text-slate-500 text-sm">Mon, Aug 31 // Trip Reference: #TR-998827</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-full transition"
                  >
                    Back to Bookings
                  </button>
                  <button className="px-4 py-2 bg-slate-950 text-white text-xs font-semibold rounded-full hover:bg-slate-900 transition">
                    Email Itinerary
                  </button>
                </div>
              </div>

              {/* Dynamic Alerts Block */}
              <AnimatePresence mode="wait">
                {isDisrupted ? (
                  <motion.div
                    key="disrupted-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="p-2 bg-[#FF7700] text-white rounded-lg">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Connection Disrupted</h4>
                        <p className="text-xs text-slate-600 mt-0.5">Your Deccan Express Train is delayed by 3 hours. Your Cab transfer and Hotel arrival have been compromised.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage('rescue')}
                      className="px-4 py-2 bg-[#FF7700] hover:bg-[#E06600] text-white text-xs font-bold rounded-lg transition shrink-0 shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      View Rescue Plans <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="healthy-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm"
                  >
                    <div className="p-2 bg-emerald-500 text-white rounded-lg">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Your Journey is Protected</h4>
                      <p className="text-xs text-slate-600 mt-0.5">TripResQ is active. All departures are operating on schedule and your buffers are fully safe.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Connected Timeline Canvas */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 overflow-hidden mt-2">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">Chronological Route Timeline</h3>

                <div className="overflow-x-auto custom-scrollbar pb-4 pt-2 flex items-center justify-start min-h-[220px]">
                  <div className="flex items-center min-w-full lg:min-w-0">
                    
                    {/* Node 1: Deccan Express Train */}
                    <div className="flex items-center">
                      <motion.div
                        layout
                        className={`w-64 p-4 rounded-xl border transition duration-350 shadow-sm ${
                          isDisrupted 
                            ? 'border-[#FF7700] bg-orange-50/20' 
                            : 'border-emerald-500 bg-emerald-50/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDisrupted ? 'bg-orange-100 text-[#FF7700]' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            🚆 Train Voyage
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#DEC-809</span>
                        </div>
                        <h4 className="font-bold text-slate-900 leading-tight">Deccan Express Train</h4>
                        <p className="text-slate-400 text-xs mt-1">Mumbai CST to Pune Junction</p>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">SCHEDULED</span>
                            <span className="text-xs font-semibold text-slate-500">08:00 - 11:00</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">ACTUAL</span>
                            <span className={`text-xs font-bold ${isDisrupted ? 'text-[#FF7700]' : 'text-emerald-600'}`}>
                              {isDisrupted ? '11:00 - 14:00' : '08:00 - 11:00'}
                            </span>
                          </div>
                        </div>

                        {isDisrupted && (
                          <div className="mt-3 p-1.5 rounded bg-orange-100/30 text-[10px] font-bold text-[#FF7700] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Delayed +3 Hours</span>
                          </div>
                        )}
                      </motion.div>

                      {/* Connection Line & Buffer Pill 1 */}
                      <div className="relative flex items-center justify-center w-24">
                        <svg className="absolute w-full h-4 pointer-events-none" overflow="visible">
                          <line
                            x1="0" y1="8" x2="96" y2="8"
                            stroke={isDisrupted ? '#EF4444' : '#10B981'}
                            strokeWidth="2.5"
                            strokeDasharray={isDisrupted ? "4,4" : "0"}
                          />
                        </svg>
                        
                        <div className="absolute z-20">
                          {isDisrupted ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-[10px] font-bold text-red-600 whitespace-nowrap shadow-sm">
                              Missed (-150m)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-semibold text-emerald-600 whitespace-nowrap shadow-sm">
                              Buffer: 30m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Node 2: Cab pick-up */}
                    <div className="flex items-center">
                      <motion.div
                        layout
                        className={`w-64 p-4 rounded-xl border transition duration-350 shadow-sm ${
                          isDisrupted 
                            ? 'border-red-500 bg-red-50/20 shadow-red-100' 
                            : 'border-emerald-500 bg-emerald-50/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDisrupted ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            🚕 Cab Pickup
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Uber Select</span>
                        </div>
                        <h4 className="font-bold text-slate-900 leading-tight">Station to Grand Hyatt</h4>
                        <p className="text-slate-400 text-xs mt-1">Pune Station pickup zone</p>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">SCHEDULED</span>
                            <span className="text-xs font-semibold text-slate-500">11:30 - 12:30</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">ACTUAL DEPART</span>
                            <span className={`text-xs font-bold ${isDisrupted ? 'text-red-500' : 'text-emerald-600'}`}>
                              {actualCabStart}
                            </span>
                          </div>
                        </div>

                        {isDisrupted && (
                          <div className="mt-3 p-1.5 rounded bg-red-100/30 text-[10px] font-bold text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Connection Violated</span>
                          </div>
                        )}
                      </motion.div>

                      {/* Connection Line & Buffer Pill 2 */}
                      <div className="relative flex items-center justify-center w-24">
                        <svg className="absolute w-full h-4 pointer-events-none" overflow="visible">
                          <line
                            x1="0" y1="8" x2="96" y2="8"
                            stroke={isDisrupted ? '#EF4444' : '#10B981'}
                            strokeWidth="2.5"
                            strokeDasharray={isDisrupted ? "4,4" : "0"}
                          />
                        </svg>
                        
                        <div className="absolute z-20">
                          {isDisrupted ? (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-[10px] font-bold text-red-600 whitespace-nowrap shadow-sm">
                              Delay (-120m)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-semibold text-emerald-600 whitespace-nowrap shadow-sm">
                              Buffer: 30m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Node 3: Grand Hyatt Hotel check-in */}
                    <div>
                      <motion.div
                        layout
                        className={`w-64 p-4 rounded-xl border transition duration-350 shadow-sm ${
                          isDisrupted 
                            ? 'border-red-500 bg-red-50/20 shadow-red-100' 
                            : 'border-emerald-500 bg-emerald-50/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDisrupted ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            🏨 Hotel Stay
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Premium Double Room</span>
                        </div>
                        <h4 className="font-bold text-slate-900 leading-tight">Grand Hyatt Check-In</h4>
                        <p className="text-slate-400 text-xs mt-1">Grand Hyatt Lobby, Pune</p>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">SCHEDULED FROM</span>
                            <span className="text-xs font-semibold text-slate-500">13:00 onwards</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase">EST. ARRIVAL</span>
                            <span className={`text-xs font-bold ${isDisrupted ? 'text-red-500' : 'text-emerald-600'}`}>
                              {actualHotelCheckin}
                            </span>
                          </div>
                        </div>

                        {isDisrupted && (
                          <div className="mt-3 p-1.5 rounded bg-red-100/30 text-[10px] font-bold text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Late Arrival Risk</span>
                          </div>
                        )}
                      </motion.div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Developer Demo Controller Card */}
              <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-4 h-4 text-[#287DFA]" />
                  <h4 className="text-sm font-bold tracking-wider text-slate-700 uppercase font-mono">TripResQ Chaos Simulation Controls</h4>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  This panel serves as a demo simulation trigger to showcase the Disruption Recovery Engine. Activating the delay cascade mocks real-time API feedback, recalculating buffers and showing alternate options.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSimulateDelay}
                    disabled={isDisrupted}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition uppercase flex items-center gap-2 cursor-pointer shadow-md ${
                      isDisrupted 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                        : 'bg-[#FF7700] hover:bg-[#E06600] text-white shadow-orange-200'
                    }`}
                  >
                    💥 Simulate 3-Hour Train Delay
                  </button>
                  <button
                    onClick={handleResetTimeline}
                    disabled={!isDisrupted}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition uppercase cursor-pointer border ${
                      !isDisrupted 
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
                    }`}
                  >
                    Reset Journey to On-Time
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= PAGE 3: THE RESCUE CENTER ================= */}
          {currentPage === 'rescue' && (
            <motion.div
              key="rescue-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-6"
            >
              {/* Alert Header Block */}
              <div className="p-6 rounded-2xl bg-orange-500 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
                {/* Background design elements */}
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="absolute left-1/3 top-0 w-24 h-24 rounded-full bg-white/5 blur-lg pointer-events-none" />

                <div className="z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white mb-3 tracking-wider uppercase">
                    🛡️ Live Trip protection Active
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">We've got you covered.</h1>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Due to the 3-hour delay on your Deccan Express Train, we calculated that you would miss your Pune Cab pickup and delay your hotel check-in. Select a recovery plan below.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPage('my-trip')}
                  className="px-4 py-2 bg-white text-orange-600 font-bold hover:bg-slate-100 text-xs rounded-xl transition shrink-0 z-10 shadow cursor-pointer"
                >
                  View Disrupted Timeline
                </button>
              </div>

              {/* Side-by-side Recovery Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                
                {/* Option 1: The Fastest Route */}
                <div className="bg-white rounded-2xl border-2 border-[#287DFA] shadow-lg flex flex-col justify-between relative overflow-hidden">
                  {/* Top recommendation strip */}
                  <div className="bg-[#287DFA] text-white text-[10px] font-extrabold text-center py-1 tracking-wider uppercase">
                    ⭐ Recommended // Fastest Option
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-[#EAF3FF] text-[#287DFA]">
                        <Zap className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#287DFA] bg-[#EAF3FF] px-2.5 py-1 rounded-full">Fastest Route</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">AC SleepCoach Sleeper</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Rescheduled Road Transport</p>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed">
                      Swap the train booking for a premium AC Sleeper Bus departing Mumbai at <span className="font-semibold text-slate-700">08:15</span>. We automatically reschedule your Cab pick-up time to match.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Arrival Delay</span>
                        <span className="font-bold text-slate-700">+15 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cab Pickup</span>
                        <span className="font-bold text-emerald-600">Updated Automatically</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotel Check-in</span>
                        <span className="font-bold text-emerald-600">On Schedule</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs">TripResQ Cost</span>
                      <span className="text-lg font-extrabold text-[#287DFA]">FREE <span className="text-[10px] text-slate-400 line-through">₹1,200</span></span>
                    </div>
                    <button
                      onClick={() => handleAcceptPlan('fastest')}
                      disabled={successPlanAccepted !== null}
                      className="w-full h-10 bg-[#287DFA] hover:bg-[#1C6BDB] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {successPlanAccepted === 'fastest' ? (
                        <>
                          <Check className="w-4 h-4 animate-bounce" /> Processing...
                        </>
                      ) : (
                        'Accept Option 1'
                      )}
                    </button>
                  </div>
                </div>

                {/* Option 2: The Cheapest Route */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-orange-50 text-[#FF7700]">
                        <RefreshCw className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#FF7700] bg-orange-50 px-2.5 py-1 rounded-full">Budget Option</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">Shatabdi Express</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Rescheduled Rail Transport</p>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed">
                      Reschedule to the afternoon Shatabdi Express at <span className="font-semibold text-slate-700">13:30</span>. We will shift your cab arrival and send a late-check-in warning to the hotel.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Arrival Delay</span>
                        <span className="font-bold text-slate-700">+210 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Compensation</span>
                        <span className="font-bold text-emerald-600">₹500 travel voucher</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotel Check-in</span>
                        <span className="font-bold text-orange-500">Postponed (Notified)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs">Cost Adjustment</span>
                      <span className="text-lg font-extrabold text-slate-800">₹500 Credit Back</span>
                    </div>
                    <button
                      onClick={() => handleAcceptPlan('cheapest')}
                      disabled={successPlanAccepted !== null}
                      className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                    >
                      {successPlanAccepted === 'cheapest' ? 'Processing...' : 'Accept Option 2'}
                    </button>
                  </div>
                </div>

                {/* Option 3: Maximum Refund */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-red-50 text-red-500">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Cancellation</span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">Total Cancellation</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Return & Fully Refund</p>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed">
                      Cancel your entire journey to Pune. TripResQ will instantly initiate full refunds for the train ticket, cab booking, and hotel check-in under protection guidelines.
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Refund Amount</span>
                        <span className="font-bold text-emerald-600">100% Refundable</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Processing Time</span>
                        <span className="font-bold text-slate-700">Immediate</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotel Claims</span>
                        <span className="font-bold text-slate-700">Claim Handled</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs">Total Refund</span>
                      <span className="text-lg font-extrabold text-emerald-600">₹3,800 Refund</span>
                    </div>
                    <button
                      onClick={() => handleAcceptPlan('refund')}
                      disabled={successPlanAccepted !== null}
                      className="w-full h-10 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {successPlanAccepted === 'refund' ? 'Processing...' : 'Accept Option 3'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Success Feedback Modal Simulation */}
              <AnimatePresence>
                {successPlanAccepted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-6"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-100 flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                        <Check className="w-8 h-8 stroke-[3]" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Trip Recovered!</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        We've updated your itinerary vouchers and notified the cab operator and hotel staff. Your new boarding pass is on its way.
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider animate-pulse">Redirecting back to timeline...</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* --- Footer Area --- */}
      <footer className="bg-white border-t border-slate-100 py-8 px-6 mt-12 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-mono">
          <p>© 2026 TripResQ Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-600">Terms of Protection</a>
            <a href="#support" className="hover:text-slate-600">Contact Help Desk</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
