import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

const GUIDE_STEPS = [
  {
    id: 'welcome',
    title: '\ud83d\udc4b Welcome to TripResQ!',
    description: 'Your intelligent travel disruption protection platform. We\'ll show you the key features in under a minute.',
    icon: '\ud83d\udee1\ufe0f',
    selector: null,
    page: null
  },
  {
    id: 'my-trip',
    title: '\u2708\ufe0f My Trip',
    description: 'View your live itinerary timeline with real-time status for every flight, train, cab, and hotel.',
    icon: '\ud83d\uddfa\ufe0f',
    selector: '[data-tour="my-trip"]',
    page: 'home'
  },
  {
    id: 'chaos-lab',
    title: '\u26a1 Chaos Lab',
    description: 'Simulate disruptions like delays, cancellations, and lockouts. Watch cascading impact analysis across your itinerary in real time.',
    icon: '\ud83d\udd2c',
    selector: '[data-tour="chaos-lab"]',
    page: 'home'
  },
  {
    id: 'risk-radar',
    title: '\ud83d\udd2e Risk Radar',
    description: 'Proactive risk monitoring powered by weather and buffer analysis. Get alerts before disruptions happen.',
    icon: '\ud83d\udce1',
    selector: '[data-tour="risk-radar"]',
    page: 'my-trip'
  },
  {
    id: 'recovery-control',
    title: '\ud83c\udf9b\ufe0f Recovery Control',
    description: 'After a disruption, TripResQ generates personalized recovery options ranked by Fastest, Cheapest, Max Refund, or Least Disruption.',
    icon: '\ud83d\udee1\ufe0f',
    selector: '[data-tour="recovery-control"]',
    page: 'my-trip'
  },
  {
    id: 'edit-route',
    title: '\u270f\ufe0f Edit Route',
    description: 'Modify your planned route anytime. Change stops, reorder segments, or update destinations without recreating the trip.',
    icon: '\ud83d\udcdd',
    selector: '[data-tour="edit-route"]',
    page: 'my-trip'
  }
];

const STORAGE_KEY = 'tripresq_guide_complete';
const PADDING = 10;
const TOOLTIP_GAP = 12;

export default function OnboardingGuide({ onNavigate }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState('bottom');
  const [transitioning, setTransitioning] = useState(false);
  const tooltipRef = useRef(null);
  const rafRef = useRef(null);

  // Auto-start for first-time users
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Expose restart via window for the "Restart Guide" button
  useEffect(() => {
    window.__tripresq_restart_guide = () => {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentStep(0);
      setSpotlightRect(null);
      if (onNavigate) onNavigate('home');
      setTimeout(() => setIsActive(true), 300);
    };
    return () => { delete window.__tripresq_restart_guide; };
  });

  // Calculate spotlight and tooltip position for current step
  const positionSpotlight = useCallback(() => {
    const step = GUIDE_STEPS[currentStep];
    if (!step || !step.selector) {
      setSpotlightRect(null);
      // Center tooltip for welcome step
      setTooltipPos({
        top: window.innerHeight / 2 - 120,
        left: Math.max(16, (window.innerWidth - 380) / 2)
      });
      setTooltipPlacement('center');
      return;
    }

    const el = document.querySelector(step.selector);
    if (!el) {
      setSpotlightRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 120,
        left: Math.max(16, (window.innerWidth - 380) / 2)
      });
      setTooltipPlacement('center');
      return;
    }

    const rect = el.getBoundingClientRect();
    const sr = {
      top: rect.top - PADDING,
      left: rect.left - PADDING,
      width: rect.width + PADDING * 2,
      height: rect.height + PADDING * 2,
      borderRadius: 12
    };
    setSpotlightRect(sr);

    // Position tooltip
    const tooltipW = Math.min(360, window.innerWidth - 32);
    const tooltipH = 200;
    let placement = 'bottom';
    let tTop, tLeft;

    // Prefer below
    if (sr.top + sr.height + TOOLTIP_GAP + tooltipH < window.innerHeight) {
      placement = 'bottom';
      tTop = sr.top + sr.height + TOOLTIP_GAP;
      tLeft = sr.left + sr.width / 2 - tooltipW / 2;
    }
    // Try above
    else if (sr.top - TOOLTIP_GAP - tooltipH > 0) {
      placement = 'top';
      tTop = sr.top - TOOLTIP_GAP - tooltipH;
      tLeft = sr.left + sr.width / 2 - tooltipW / 2;
    }
    // Try right
    else if (sr.left + sr.width + TOOLTIP_GAP + tooltipW < window.innerWidth) {
      placement = 'right';
      tTop = sr.top + sr.height / 2 - tooltipH / 2;
      tLeft = sr.left + sr.width + TOOLTIP_GAP;
    }
    // Try left
    else {
      placement = 'left';
      tTop = sr.top + sr.height / 2 - tooltipH / 2;
      tLeft = sr.left - TOOLTIP_GAP - tooltipW;
    }

    // Clamp within viewport
    tLeft = Math.max(12, Math.min(tLeft, window.innerWidth - tooltipW - 12));
    tTop = Math.max(12, Math.min(tTop, window.innerHeight - tooltipH - 12));

    setTooltipPos({ top: tTop, left: tLeft });
    setTooltipPlacement(placement);
  }, [currentStep]);

  // Position after navigation/step change
  useEffect(() => {
    if (!isActive) return;
    const t1 = setTimeout(positionSpotlight, 50);
    const t2 = setTimeout(positionSpotlight, 300);
    const t3 = setTimeout(positionSpotlight, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActive, currentStep, positionSpotlight]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isActive) return;
    const handler = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(positionSpotlight);
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, positionSpotlight]);

  const navigateToStep = (stepIdx) => {
    const step = GUIDE_STEPS[stepIdx];
    if (step.page && onNavigate) {
      onNavigate(step.page);
    }
  };

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setTransitioning(true);
      const next = currentStep + 1;
      navigateToStep(next);
      setTimeout(() => {
        setCurrentStep(next);
        setTransitioning(false);
      }, 150);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setTransitioning(true);
      const prev = currentStep - 1;
      navigateToStep(prev);
      setTimeout(() => {
        setCurrentStep(prev);
        setTransitioning(false);
      }, 150);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsActive(false);
    setSpotlightRect(null);
    if (onNavigate) onNavigate('home');
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsActive(false);
    setSpotlightRect(null);
  };

  if (!isActive) return null;

  const step = GUIDE_STEPS[currentStep];
  const isLast = currentStep === GUIDE_STEPS.length - 1;
  const isFirst = currentStep === 0;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'none' }}>
      {/* SVG Overlay with spotlight cutout */}
      <svg
        width={vw}
        height={vh}
        className="fixed inset-0"
        style={{ pointerEvents: 'auto' }}
        onClick={handleSkip}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={spotlightRect.borderRadius}
                ry={spotlightRect.borderRadius}
                fill="black"
              />
            )}
          </mask>
          {spotlightRect && (
            <filter id="spotlight-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        {/* Dark overlay with cutout */}
        <rect
          x="0" y="0"
          width={vw} height={vh}
          fill="rgba(15, 23, 42, 0.55)"
          mask="url(#spotlight-mask)"
          style={{ transition: 'all 0.3s ease' }}
        />
        {/* Spotlight glow ring */}
        {spotlightRect && (
          <rect
            x={spotlightRect.left - 2}
            y={spotlightRect.top - 2}
            width={spotlightRect.width + 4}
            height={spotlightRect.height + 4}
            rx={spotlightRect.borderRadius + 2}
            ry={spotlightRect.borderRadius + 2}
            fill="none"
            stroke="rgba(40, 125, 250, 0.5)"
            strokeWidth="3"
            filter="url(#spotlight-glow)"
            style={{ transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <animate
              attributeName="stroke-opacity"
              values="0.5;0.9;0.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        )}
      </svg>

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        className={`fixed z-[10000] transition-all duration-300 ease-out ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: Math.min(360, vw - 24),
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
          style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-[#287DFA] to-[#FF7700] transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / GUIDE_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="px-5 pt-4 pb-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-serif leading-tight">
                    {step.title}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {currentStep + 1} of {GUIDE_STEPS.length}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100 shrink-0"
                aria-label="Skip tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
              <div>
                {isFirst ? (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    Skip Tour
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3 h-3" /> Back
                  </button>
                )}
              </div>

              {/* Step Dots */}
              <div className="flex items-center gap-1">
                {GUIDE_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-5 h-1.5 bg-[#287DFA]'
                        : idx < currentStep
                        ? 'w-1.5 h-1.5 bg-[#287DFA]/40'
                        : 'w-1.5 h-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div>
                {isLast ? (
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="px-4 py-1.5 bg-gradient-to-r from-[#287DFA] to-[#1C6BDB] hover:from-[#1C6BDB] hover:to-[#1558B8] text-white text-[11px] font-extrabold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" /> Got it!
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-[#287DFA] hover:bg-[#1C6BDB] text-white text-[11px] font-extrabold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
