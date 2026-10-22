import React from 'react';

interface OilLampIconProps {
  className?: string;
  size?: number;
}

export const OilLampIcon: React.FC<OilLampIconProps> = ({
  className = 'w-7 h-7',
}) => {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="မြန်မာ့ရိုးရာ သီတင်းကျွတ် ဆီမီးခွက်"
    >
      <defs>
        {/* Outer ambient warm halo glow */}
        <radialGradient id="lampOuterGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="85%" stopColor="#ea580c" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
        </radialGradient>

        {/* Dynamic flame gradient */}
        <radialGradient id="lampFlameGrad" cx="50%" cy="65%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="90%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0.9" />
        </radialGradient>

        {/* Terracotta clay oil cup gradient (မြေစဉ့်ခွက်) */}
        <linearGradient id="clayBowlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="35%" stopColor="#c2410c" />
          <stop offset="75%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#631b07" />
        </linearGradient>

        {/* Golden oil surface reflection */}
        <radialGradient id="oilSurfaceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>

        {/* Clay rim highlight */}
        <linearGradient id="rimHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="20%" stopColor="#fb923c" />
          <stop offset="50%" stopColor="#fdba74" />
          <stop offset="80%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      {/* 1. Ambient Warm Flame Glow Halo */}
      <circle cx="18" cy="11.5" r="11" fill="url(#lampOuterGlow)" className="animate-pulse" />

      {/* 2. Traditional Cotton Wick (မီးစာ) */}
      <path
        d="M18 13.5 C17.8 15 17.6 17 18 19"
        stroke="#451a03"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* 3. Sacred Oil Lamp Flame (ဆီမီးတောက်) */}
      {/* Outer teardrop flame with organic sway */}
      <path
        d="M18 3 C19.8 7.2 22.8 10.8 22.8 14 C22.8 17 20.6 19 18 19 C15.4 19 13.2 17 13.2 14 C13.2 10.8 16.2 7.2 18 3 Z"
        fill="url(#lampFlameGrad)"
        className="flame-glow origin-bottom"
        style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.9))' }}
      />

      {/* Inner bright white-gold core */}
      <ellipse
        cx="18"
        cy="15"
        rx="2.2"
        ry="3.2"
        fill="#ffffff"
        opacity="0.95"
        className="flame-glow"
      />

      {/* 4. Clay Oil Lamp Body (မြေစဉ့် ဆီမီးခွက်) */}
      {/* Bowl Outer Hull */}
      <path
        d="M4.5 19.5 C5.8 27.2 11.5 30.5 18 30.5 C24.5 30.5 30.2 27.2 31.5 19.5 C31.5 18.2 29.8 17.5 28 17.5 C23.5 18.3 12.5 18.3 8 17.5 C6.2 17.5 4.5 18.2 4.5 19.5 Z"
        fill="url(#clayBowlGrad)"
        stroke="#7c2d12"
        strokeWidth="0.8"
      />

      {/* Bowl Rim Lip (ခွက်နှုတ်ခမ်း) */}
      <ellipse
        cx="18"
        cy="18.8"
        rx="12.2"
        ry="3.4"
        fill="url(#clayBowlGrad)"
        stroke="url(#rimHighlight)"
        strokeWidth="0.9"
      />

      {/* Fragrant Golden Oil Pool inside the saucer */}
      <ellipse
        cx="18"
        cy="19.2"
        rx="10.2"
        ry="2.4"
        fill="url(#oilSurfaceGrad)"
      />

      {/* Oil surface central golden gleam */}
      <ellipse
        cx="18"
        cy="19"
        rx="5.5"
        ry="1.2"
        fill="#fef08a"
        opacity="0.75"
      />

      {/* Traditional clay base stand foot */}
      <ellipse
        cx="18"
        cy="30.5"
        rx="7.5"
        ry="2"
        fill="#431407"
        stroke="#7c2d12"
        strokeWidth="0.6"
      />
    </svg>
  );
};
