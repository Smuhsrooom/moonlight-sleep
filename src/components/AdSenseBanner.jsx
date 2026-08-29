import React, { useEffect } from 'react';

export const AdSenseBanner = ({ type = 'leaderboard', label = '스폰서 (Sponsored)', slot = '' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Ignore adsbygoogle push errors before ads are approved
    }
  }, []);

  return (
    <div className="w-full celestial-panel p-4 flex flex-col items-center justify-center min-h-[90px] text-xs text-slate-400 relative transition-all overflow-hidden">
      <span className="absolute top-2.5 right-4 font-mono text-[9px] uppercase tracking-widest text-slate-500 z-10">
        {label}
      </span>

      {/* Google AdSense ins element */}
      <ins
        className="adsbygoogle w-full block text-center"
        style={{ display: 'block', minHeight: '60px' }}
        data-ad-client="ca-pub-4050601810604224"
        data-ad-slot={slot || '1234567890'}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />

      {/* Fallback Display during review */}
      <div className="text-center py-1 pointer-events-none">
        <span className="block font-semibold text-slate-300 text-xs mb-0.5">
          {type === 'in-feed' ? '큐레이션 웰니스 파트너' : '반응형 스마트 디스플레이'}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Google AdSense Verified · ca-pub-4050601810604224
        </span>
      </div>
    </div>
  );
};
