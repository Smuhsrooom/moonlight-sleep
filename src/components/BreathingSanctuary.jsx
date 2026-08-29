import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { audioEngine } from '../services/audioEngine';

export const BreathingSanctuary = () => {
  const [mode, setMode] = useState('4-7-8');
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);

  const targetCycles = 4;
  const timerRef = useRef(null);

  const MODES = {
    '4-7-8': {
      name: '4-7-8 수면 호흡',
      desc: '4초 들이마시고, 7초 머물며, 8초 동안 길게 내쉬어 빠르게 긴장을 풉니다.',
      phases: [
        { name: '코로 깊게 들이마시기', duration: 4, action: 'expand', color: '#818CF8', freq: 528 },
        { name: '숨을 편안하게 멈추기', duration: 7, action: 'hold', color: '#F5C542', freq: 432 },
        { name: '입으로 길게 비워내기', duration: 8, action: 'contract', color: '#2DD4BF', freq: 396 }
      ]
    },
    'box': {
      name: '4-4-4-4 박스 호흡',
      desc: '숨을 고르고 마음의 중심을 잡는 4박자 균등 호흡입니다.',
      phases: [
        { name: '숨 들이마시기', duration: 4, action: 'expand', color: '#818CF8', freq: 528 },
        { name: '숨 채워 멈추기', duration: 4, action: 'hold', color: '#F5C542', freq: 432 },
        { name: '숨 천천히 내쉬기', duration: 4, action: 'contract', color: '#2DD4BF', freq: 396 },
        { name: '숨 비워 머물기', duration: 4, action: 'hold', color: '#94A3B8', freq: 432 }
      ]
    },
    'calm': {
      name: '4-6 이완 호흡',
      desc: '내쉬는 숨을 길게 하여 온몸의 긴장을 사르르 녹여냅니다.',
      phases: [
        { name: '부드럽게 들이마시기', duration: 4, action: 'expand', color: '#818CF8', freq: 528 },
        { name: '천천히 길게 내쉬기', duration: 6, action: 'contract', color: '#2DD4BF', freq: 396 }
      ]
    }
  };

  const currentModeObj = MODES[mode];
  const currentPhase = currentModeObj.phases[phaseIndex];

  const stopBreathing = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setPhaseIndex(0);
    setRemaining(currentModeObj.phases[0].duration);
    setCycleCount(1);
  }, [currentModeObj.phases]);

  const handleModeChange = (newMode) => {
    stopBreathing();
    setMode(newMode);
    setRemaining(MODES[newMode].phases[0].duration);
  };

  useEffect(() => {
    if (isRunning) {
      audioEngine.playSingingBowl(currentPhase.freq);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(30); } catch { /* ignore */ }
      }

      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            setPhaseIndex(pIdx => {
              const nextIdx = (pIdx + 1) % currentModeObj.phases.length;
              if (nextIdx === 0) {
                setCycleCount(c => {
                  if (c >= targetCycles) {
                    stopBreathing();
                    return 1;
                  }
                  return c + 1;
                });
              }
              const nextPhase = currentModeObj.phases[nextIdx];
              audioEngine.playSingingBowl(nextPhase.freq);
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(30); } catch { /* ignore */ }
              }
              return nextIdx;
            });
            return currentModeObj.phases[(phaseIndex + 1) % currentModeObj.phases.length].duration;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phaseIndex, mode, currentPhase.freq, currentModeObj.phases, stopBreathing]);

  const getScale = () => {
    if (!isRunning) return 1;
    if (currentPhase.action === 'expand') return 1.36;
    if (currentPhase.action === 'hold') return 1.30;
    if (currentPhase.action === 'contract') return 0.88;
    return 1;
  };

  return (
    <div className="w-full celestial-panel py-12 px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-1 mb-8 relative z-10">
        <span className="text-xs font-semibold text-indigo-300 block">
          몸과 마음을 비워내는 시간
        </span>
        <h2 className="text-2xl md:text-3xl text-white font-bold tracking-tight">
          편안하게 숨을 들이마시고, 비워내세요
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto pt-1">
          {currentModeObj.desc}
        </p>
      </div>

      {/* Breathing Technique Mode Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 relative z-10">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleModeChange(key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              mode === key
                ? 'bg-white/[0.14] text-white font-bold border border-white/25 shadow-sm'
                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:text-white'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Crystal Liquid Glass Meditation Orb */}
      <div className="relative w-[320px] h-[320px] flex items-center justify-center my-6">
        {/* Soft Cosmic Aurora Halo */}
        <motion.div
          animate={{ scale: getScale(), opacity: isRunning ? 0.75 : 0.25 }}
          transition={{ duration: isRunning ? currentPhase.duration : 0.8, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, ${currentPhase.color}35 0%, ${currentPhase.color}08 55%, transparent 75%)`
          }}
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        />

        {/* Liquid Aura Ripple Ring */}
        <motion.div
          animate={{ 
            scale: isRunning && currentPhase.action === 'hold' ? [1.15, 1.25, 1.15] : getScale() * 1.18,
            opacity: isRunning && currentPhase.action === 'hold' ? [0.3, 0.6, 0.3] : 0.35
          }}
          transition={{
            duration: isRunning && currentPhase.action === 'hold' ? 2.5 : (isRunning ? currentPhase.duration : 0.8),
            repeat: isRunning && currentPhase.action === 'hold' ? Infinity : 0,
            ease: "easeInOut"
          }}
          style={{
            borderColor: `${currentPhase.color}60`,
            boxShadow: `0 0 30px ${currentPhase.color}25`
          }}
          className="absolute w-[240px] h-[240px] rounded-full border border-white/[0.15] bg-white/[0.015] backdrop-blur-sm pointer-events-none"
        />

        {/* Center Crystal Liquid Glass Orb */}
        <motion.div
          animate={{ scale: getScale() }}
          transition={{ duration: isRunning ? currentPhase.duration : 0.8, ease: "easeInOut" }}
          style={{
            borderColor: `${currentPhase.color}80`,
            boxShadow: `0 25px 60px -10px rgba(0,0,0,0.5), inset 0 2px 4px 0 rgba(255,255,255,0.65), inset 0 -2px 4px 0 rgba(0,0,0,0.35), 0 0 35px ${currentPhase.color}35`
          }}
          className="relative w-[170px] h-[170px] rounded-full bg-gradient-to-br from-white/[0.18] via-white/[0.04] to-white/[0.01] border border-white/[0.30] border-t-white/[0.60] backdrop-blur-xl flex flex-col items-center justify-center z-10"
        >
          <span className="font-timer-display text-5xl md:text-6xl text-white font-extrabold tracking-tight select-none drop-shadow-sm">
            {remaining}
          </span>

          {/* Starlight Cycle Progress Indicator */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i <= cycleCount ? 'bg-amber-400 shadow-[0_0_8px_#F5C542]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Phase State Name Text */}
        <div className="absolute -bottom-10 text-center w-full">
          <span
            style={{ color: currentPhase.color }}
            className="font-bold text-base tracking-wide transition-colors"
          >
            {isRunning ? currentPhase.name : '시작 버튼을 누르면 싱잉볼과 함께 호흡이 시작됩니다'}
          </span>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center gap-3 mt-16 relative z-10">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className="bg-white/[0.12] hover:bg-white/[0.18] text-white font-bold border border-white/25 px-8 py-3 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {isRunning ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-current" />}
          <span>{isRunning ? '잠시 멈춤' : '호흡 시작하기'}</span>
        </button>

        <button
          type="button"
          onClick={stopBreathing}
          className="p-3 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="처음부터 다시하기"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

