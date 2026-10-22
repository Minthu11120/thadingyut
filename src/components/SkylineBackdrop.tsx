import React from 'react';

export const SkylineBackdrop: React.FC = () => {
  return (
    <>
      {/* Top Glow Full Moon */}
      <div className="absolute top-10 right-8 md:top-14 md:right-24 pointer-events-none z-0">
        <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-amber-200 via-amber-100 to-yellow-50 moon-glow flex items-center justify-center">
          {/* Subtle Moon Craters */}
          <div className="absolute w-6 h-6 rounded-full bg-amber-200/40 top-4 left-6 blur-[1px]"></div>
          <div className="absolute w-8 h-8 rounded-full bg-amber-300/30 bottom-5 right-7 blur-[2px]"></div>
          <div className="absolute w-4 h-4 rounded-full bg-yellow-400/25 top-10 right-5 blur-[1px]"></div>
        </div>
      </div>

      {/* Floating Translucent Night Clouds */}
      <div className="absolute top-24 left-0 w-full pointer-events-none z-0 opacity-20 cloud-anim">
        <svg className="w-full h-32 text-indigo-300 fill-current" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,96L80,112C160,128,320,160,480,160C640,160,800,128,960,122.7C1120,117,1280,139,1360,149.3L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>

      {/* Myanmar Pagoda & Bagan Skyline Horizon */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg className="w-full h-40 md:h-56 text-slate-950 fill-current drop-shadow-2xl" viewBox="0 0 1200 240" preserveAspectRatio="none">
          {/* Distant Hills */}
          <path opacity="0.3" fill="#0f172a" d="M0,190 C250,140 450,210 700,165 C950,120 1100,170 1200,150 L1200,240 L0,240 Z"></path>
          {/* Mid Layer Silhouettes */}
          <path opacity="0.6" fill="#030712" d="M0,210 C180,190 320,205 450,195 C620,185 750,210 900,190 C1050,170 1150,200 1200,195 L1200,240 L0,240 Z"></path>

          {/* Stupa 1 (Far Left) */}
          <path d="M120,240 L120,215 L105,215 L120,175 L127,150 L129,120 L131,120 L133,150 L140,175 L155,215 L140,215 L140,240 Z"></path>
          <line x1="130" y1="120" x2="130" y2="95" stroke="#020617" strokeWidth="2"></line>
          <circle cx="130" cy="94" r="3" fill="#fbbf24"></circle>

          {/* Grand Shwedagon Style Central Stupa */}
          <path d="M260,240 L260,200 L240,200 L255,160 L275,130 L285,90 L287,55 L291,55 L293,90 L303,130 L323,160 L338,200 L318,200 L318,240 Z"></path>
          <line x1="289" y1="55" x2="289" y2="28" stroke="#030712" strokeWidth="3"></line>
          <ellipse cx="289" cy="38" rx="8" ry="3" fill="#030712"></ellipse>
          <ellipse cx="289" cy="46" rx="6" ry="2.5" fill="#030712"></ellipse>
          <circle cx="289" cy="25" r="4" fill="#fbbf24" className="opacity-90"></circle>

          {/* Exotic Bagan Temple (Center Right) */}
          <path d="M680,240 L680,180 L660,180 L675,150 L710,120 L713,80 L717,80 L720,120 L755,150 L770,180 L750,180 L750,240 Z"></path>
          <line x1="715" y1="80" x2="715" y2="50" stroke="#030712" strokeWidth="2.5"></line>
          <circle cx="715" cy="48" r="3" fill="#fbbf24" className="opacity-80"></circle>

          {/* Right Pagoda Stupa */}
          <path d="M980,240 L980,210 L965,210 L980,175 L995,145 L998,110 L1002,110 L1005,145 L1020,175 L1035,210 L1020,210 L1020,240 Z"></path>
          <line x1="1000" y1="110" x2="1000" y2="85" stroke="#030712" strokeWidth="2"></line>
          <circle cx="1000" cy="83" r="3" fill="#fef08a" className="opacity-75"></circle>

          {/* Myanmar Palm Tree Silhouettes */}
          <path d="M520,240 Q525,190 530,160 Q510,150 495,160 Q525,155 530,160 Q530,140 532,130 Q535,148 535,160 Q555,150 565,165 Q540,160 535,165 Q530,200 525,240 Z"></path>
          <path d="M850,240 Q845,195 840,165 Q820,160 805,170 Q835,162 840,165 Q838,145 838,135 Q842,150 843,165 Q860,155 875,170 Q850,165 845,168 Q848,200 852,240 Z"></path>
        </svg>

        {/* Golden Oil Lamp String ("ဆီမီးခွက်တန်း") */}
        <div className="h-4 bg-gradient-to-r from-amber-600/30 via-yellow-500/40 to-amber-600/30 border-t border-amber-500/30 flex items-center justify-around px-4">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#f59e0b] animate-pulse delay-75"></span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse delay-150"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#f59e0b] animate-pulse delay-300"></span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#f59e0b] animate-pulse delay-200"></span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"></span>
        </div>
      </div>
    </>
  );
};
