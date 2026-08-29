import React from 'react';

export const AdSenseBanner = ({ type = 'leaderboard', label = '스폰서 (Sponsored)' }) => {
  return (
    <div className="w-full celestial-panel p-5 flex flex-col items-center justify-center min-h-[90px] text-xs text-slate-400 relative transition-all">
      <span className="absolute top-2.5 right-4 font-mono text-[9px] uppercase tracking-widest text-slate-500">
        {label}
      </span>
      <div className="text-center py-1">
        <span className="block font-semibold text-slate-300 text-xs mb-0.5">
          {type === 'in-feed' ? '큐레이션 웰니스 파트너' : '반응형 스마트 디스플레이'}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Google AdSense Verified Placement Unit
        </span>
      </div>
    </div>
  );
};
