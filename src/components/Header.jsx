import React, { useState, useEffect } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';

export const Header = ({ onSelectTab, activeSoundCount, timerText, onStopAll }) => {
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const hStr = h < 10 ? '0' + h : h;
      const mStr = m < 10 ? '0' + m : m;
      const sStr = s < 10 ? '0' + s : s;
      setLiveTime(`${ampm} ${hStr}:${mStr}:${sStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-[1180px] mx-auto">
        {/* Brand Logo with Custom High-End SVG Emblem */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('calculator')}
          className="flex items-center gap-3.5 group text-left cursor-pointer"
        >
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            {/* Ambient Background Aura Glow */}
            <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-md group-hover:bg-amber-400/30 group-hover:scale-125 transition-all duration-500" />
            
            {/* Precision Vector Emblem */}
            <svg
              viewBox="0 0 40 40"
              className="w-9 h-9 relative z-10 transition-transform duration-500 group-hover:scale-105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 1. Champagne Lunar Gold Gradient */}
                <linearGradient id="logoGoldGrad" x1="15%" y1="5%" x2="85%" y2="95%">
                  <stop offset="0%" stopColor="#FFFDF5" />
                  <stop offset="35%" stopColor="#FDE047" />
                  <stop offset="70%" stopColor="#F5C542" />
                  <stop offset="100%" stopColor="#C7D2FE" />
                </linearGradient>

                {/* 2. Twinkling Star Gradient */}
                <linearGradient id="logoStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#FFFBEB" />
                  <stop offset="100%" stopColor="#F5C542" />
                </linearGradient>

                {/* 3. Cosmic Orbit Arc Gradient */}
                <linearGradient id="logoOrbitGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.1" />
                  <stop offset="45%" stopColor="#2DD4BF" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#F5C542" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                </linearGradient>

                {/* Drop Glow Filter */}
                <filter id="logoMoonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#F5C542" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Cosmic Orbit Arc (Sleep Wave) */}
              <path
                d="M 5 27 C 13 35 27 34 35 21"
                stroke="url(#logoOrbitGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Elegant Crescent Moon */}
              <path
                d="M 21 5 C 29 5 35 12 35 20 C 35 28.5 28 35.5 19.5 35.5 C 13.5 35.5 8.5 31.8 6.5 26.5 C 13 30 22 27 26 19 C 28.5 14 26 8 21 5 Z"
                fill="url(#logoGoldGrad)"
                filter="url(#logoMoonGlow)"
              />

              {/* 4-Point Twinkling North Star */}
              <g className="origin-[15px_15px] group-hover:rotate-45 group-hover:scale-115 transition-transform duration-500">
                <path
                  d="M 15 8 C 15 12 13 15 9 15 C 13 15 15 18 15 22 C 15 18 17 15 21 15 C 17 15 15 12 15 8 Z"
                  fill="url(#logoStarGrad)"
                  filter="drop-shadow(0 0 3px rgba(255,255,255,0.8))"
                />
              </g>

              {/* Subtle Companion Sparkle */}
              <circle cx="28" cy="11" r="1" fill="#FFFFFF" className="animate-pulse" />
            </svg>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-bold text-white text-base tracking-tight group-hover:text-amber-200 transition-colors">
              달빛수면
            </span>
            <span className="font-editorial-serif italic text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
              Moonlight Sleep
            </span>
          </div>
        </button>

        {/* Integrated Status Dock */}
        <div className="flex items-center gap-2.5">
          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
            <span className="font-timer-display text-xs text-slate-200 font-semibold">
              {liveTime || '00:00:00'}
            </span>
          </div>

          {/* Active Audio State */}
          {activeSoundCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-400/10 border border-teal-400/20 text-xs text-teal-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              <span>{activeSoundCount}채널</span>
              {timerText && (
                <span className="text-amber-300 font-timer-display ml-1 pl-1.5 border-l border-white/10">
                  {timerText}
                </span>
              )}
            </div>
          )}

          {/* Mute Control */}
          <button
            onClick={onStopAll}
            disabled={activeSoundCount === 0}
            title={activeSoundCount > 0 ? "모든 사운드 끄기" : "재생 중인 사운드 없음"}
            className={`p-2 rounded-xl border transition-all ${
              activeSoundCount > 0
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20 shadow-sm shadow-amber-400/10 cursor-pointer'
                : 'bg-white/[0.02] border-white/[0.05] text-slate-600 cursor-default'
            }`}
          >
            {activeSoundCount > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
