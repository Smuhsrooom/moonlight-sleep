import React, { useState, useEffect } from 'react';

export const HeroMoonHub = () => {
  const [moonData, setMoonData] = useState({
    phase: 0.25,
    name: '상현달',
    illum: 68,
    humanGreeting: '오늘 밤 달은 68% 차올랐어요',
    humanTip: '자정 전에 잠들면 뇌와 몸이 가장 깊이 쉬어갈 수 있어요.',
    stageTag: '깊은 휴식 추천 시간'
  });

  useEffect(() => {
    const calculateMoon = () => {
      const now = new Date();
      const lp = 2551443;
      const nowSec = now.getTime() / 1000;
      const newMoonSec = 592500;
      const phase = ((nowSec - newMoonSec) % lp) / lp;
      const illumPercent = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

      let moonName = '상현달';

      if (phase < 0.03 || phase > 0.97) {
        moonName = '그믐이 지나 새 달이 뜨는 밤';
      } else if (phase < 0.22) {
        moonName = '가느다란 초승달';
      } else if (phase < 0.28) {
        moonName = '반달 (상현달)';
      } else if (phase < 0.47) {
        moonName = '차오르는 달';
      } else if (phase < 0.53) {
        moonName = '환한 보름달 (만월)';
      } else if (phase < 0.72) {
        moonName = '기우는 달';
      } else if (phase < 0.78) {
        moonName = '새벽의 하현달';
      } else {
        moonName = '고요한 그믐달';
      }

      const curHour = now.getHours();
      let humanTip = '자정 전에 잠들면 뇌와 몸이 가장 깊이 쉬어갈 수 있어요.';
      let stageTag = '깊은 휴식 추천 시간';

      if (curHour >= 21 || curHour < 3) {
        humanTip = '몸속 수면 호르몬이 가득 찬 시간이에요. 조명을 낮추고 편안히 누워보세요.';
        stageTag = '깊은 밤 충전 구간';
      } else if (curHour >= 3 && curHour < 7) {
        humanTip = '체온이 가장 낮아지고 꿈을 통해 마음의 피로를 씻어내는 시간대예요.';
        stageTag = '새벽 회복 구간';
      } else if (curHour >= 7 && curHour < 12) {
        humanTip = '햇빛을 쬐며 기지개를 켜보세요. 생체 리듬이 상쾌하게 깨어납니다.';
        stageTag = '자연 기상 구간';
      } else {
        humanTip = '오늘 밤 편안한 잠을 위해 오후 카페인은 줄이고 은은한 음악을 곁들여보세요.';
        stageTag = '저녁 이완 구간';
      }

      setMoonData({
        phase,
        name: moonName,
        illum: illumPercent,
        humanGreeting: `오늘 밤 달은 ${illumPercent}% 차올랐어요`,
        humanTip,
        stageTag
      });
    };

    calculateMoon();
    const interval = setInterval(calculateMoon, 60000);
    return () => clearInterval(interval);
  }, []);

  // Luminous Pearl Moon Renderer
  const renderMoonSvg = () => {
    const illum = moonData.illum / 100;
    return (
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0">
        {/* Soft Celestial Corona Glow */}
        <div className="absolute inset-0 rounded-full bg-slate-100/10 blur-xl scale-125 pointer-events-none" />
        <div className="absolute inset-1 rounded-full bg-amber-200/10 blur-md pointer-events-none" />

        {/* Luminous Silver-Pearl Moon Sphere */}
        <svg viewBox="0 0 100 100" className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl relative z-10">
          <defs>
            <radialGradient id="lunarPearlTexture" cx="38%" cy="36%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F8FAFC" />
              <stop offset="70%" stopColor="#E2E8F0" />
              <stop offset="90%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </radialGradient>
            <radialGradient id="lunarShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#030712" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#060B18" stopOpacity="0.99" />
            </radialGradient>
          </defs>

          {/* Moon Surface Base */}
          <circle cx="50" cy="50" r="46" fill="url(#lunarPearlTexture)" />

          {/* Mare & Crater Formations */}
          <circle cx="36" cy="35" r="9" fill="rgba(100, 116, 139, 0.28)" />
          <circle cx="64" cy="40" r="11" fill="rgba(100, 116, 139, 0.22)" />
          <circle cx="48" cy="65" r="13" fill="rgba(71, 85, 105, 0.25)" />
          <circle cx="28" cy="58" r="6" fill="rgba(71, 85, 105, 0.2)" />
          <circle cx="68" cy="62" r="7" fill="rgba(100, 116, 139, 0.18)" />

          {/* Astronomical Shadow Mask for Real Phase */}
          <path
            d={`M 50 4 A 46 46 0 0 0 50 96 A ${Math.abs(46 * (1 - illum * 2))} 46 0 0 ${illum > 0.5 ? 1 : 0} 50 4 Z`}
            fill="url(#lunarShadow)"
            opacity={1 - illum * 0.15}
          />
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
        </svg>
      </div>
    );
  };

  return (
    <div className="w-full celestial-panel p-5 md:p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
        {/* Moon Visual */}
        <div className="flex-shrink-0">
          {renderMoonSvg()}
        </div>

        {/* Moon Phase & Human Greeting */}
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold text-amber-300">
              {moonData.name}
            </span>
            <span className="text-[11px] text-slate-400">
              · 달빛 조도 {moonData.illum}%
            </span>
            <span className="text-[11px] text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">
              {moonData.stageTag}
            </span>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {moonData.humanGreeting}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {moonData.humanTip}
          </p>
        </div>
      </div>
    </div>
  );
};
