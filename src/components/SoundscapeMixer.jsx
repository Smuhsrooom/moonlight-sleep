import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudRain, 
  Waves, 
  Flame, 
  Wind, 
  Moon, 
  Activity, 
  Sparkles, 
  Radio, 
  Timer, 
  StopCircle, 
  Power
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export const SoundscapeMixer = ({ onSoundStateChange, onTimerChange }) => {
  const [activeSounds, setActiveSounds] = useState({});
  const [volumes, setVolumes] = useState({
    rain: 60,
    waves: 50,
    wind: 40,
    campfire: 50,
    crickets: 30,
    brownNoise: 45,
    pinkNoise: 40,
    deltaBinaural: 50
  });
  const [selectedTimer, setSelectedTimer] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const visualizerCanvasRef = useRef(null);

  const allSounds = [
    { id: 'rain', name: '밤비 소리', category: '자연음', icon: CloudRain, color: '#2DD4BF' },
    { id: 'waves', name: '잔잔한 파도', category: '자연음', icon: Waves, color: '#2DD4BF' },
    { id: 'wind', name: '숲속 밤바람', category: '자연음', icon: Wind, color: '#2DD4BF' },
    { id: 'campfire', name: '모닥불 장작', category: '자연음', icon: Flame, color: '#2DD4BF' },
    { id: 'crickets', name: '여름밤 풀벌레', category: '자연음', icon: Moon, color: '#2DD4BF' },
    { id: 'brownNoise', name: '브라운 노이즈', category: '딥슬립', icon: Radio, color: '#818CF8' },
    { id: 'pinkNoise', name: '핑크 노이즈', category: '이완', icon: Activity, color: '#818CF8' },
    { id: 'deltaBinaural', name: '432Hz 델타파', category: '수면파', icon: Sparkles, color: '#818CF8' }
  ];

  // Real-Time Web Audio FFT Spectrum Canvas Visualizer
  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      const parentWidth = canvas.parentElement.clientWidth;
      const height = 48;
      canvas.width = parentWidth * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animId;

    const render = () => {
      const logicalWidth = canvas.parentElement.clientWidth;
      const logicalHeight = 48;
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const isPlaying = audioEngine.getActiveSoundCount() > 0;
      const freqData = audioEngine.getByteFrequencyData();
      const binCount = freqData.length;

      const barCount = 48;
      const barWidth = logicalWidth / barCount - 2;
      const midY = logicalHeight / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIdx = Math.floor((i / barCount) * (binCount / 2));
        const rawVal = freqData[dataIdx] || 0;
        const normalized = isPlaying ? Math.max(0.08, rawVal / 255) : 0.04 + Math.sin(Date.now() * 0.002 + i * 0.2) * 0.02;
        const barHeight = Math.min(logicalHeight * 0.85, normalized * logicalHeight * 0.8);

        const x = i * (barWidth + 2);
        const y = midY - barHeight / 2;

        const isNatureDominated = i < barCount * 0.6;
        ctx.fillStyle = isPlaying
          ? (isNatureDominated ? 'rgba(45, 212, 191, 0.75)' : 'rgba(129, 140, 248, 0.75)')
          : 'rgba(255, 255, 255, 0.06)';

        ctx.beginPath();
        ctx.roundRect(x, y, Math.max(1.5, barWidth), Math.max(2, barHeight), 1.5);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggleSound = (id) => {
    const currentVol = (volumes[id] || 50) / 100;
    const isPlaying = audioEngine.toggleSound(id, currentVol);

    setActiveSounds(prev => {
      const updated = { ...prev, [id]: isPlaying };
      if (onSoundStateChange) onSoundStateChange(Object.values(updated).filter(Boolean).length);
      return updated;
    });
  };

  const handleVolumeChange = (id, newVol) => {
    setVolumes(prev => ({ ...prev, [id]: newVol }));
    const vol = newVol / 100;
    audioEngine.setSoundVolume(id, vol);

    if (vol > 0 && !activeSounds[id]) {
      audioEngine.startSound(id, vol);
      setActiveSounds(prev => {
        const updated = { ...prev, [id]: true };
        if (onSoundStateChange) onSoundStateChange(Object.values(updated).filter(Boolean).length);
        return updated;
      });
    } else if (vol === 0 && activeSounds[id]) {
      audioEngine.stopSound(id);
      setActiveSounds(prev => {
        const updated = { ...prev, [id]: false };
        if (onSoundStateChange) onSoundStateChange(Object.values(updated).filter(Boolean).length);
        return updated;
      });
    }
  };

  const handleStopAll = () => {
    audioEngine.stopAll();
    setActiveSounds({});
    setSelectedPreset(null);
    setSelectedTimer(null);
    if (onSoundStateChange) onSoundStateChange(0);
    if (onTimerChange) onTimerChange(null);
  };

  const PRESETS = {
    rain: { name: '비 오는 밤', items: [{ id: 'rain', vol: 70 }, { id: 'wind', vol: 25 }] },
    forest: { name: '자정의 숲', items: [{ id: 'wind', vol: 50 }, { id: 'crickets', vol: 35 }] },
    campfire: { name: '모닥불 파도', items: [{ id: 'campfire', vol: 60 }, { id: 'waves', vol: 35 }] },
    delta: { name: '3Hz 델타 딥슬립', items: [{ id: 'deltaBinaural', vol: 65 }, { id: 'brownNoise', vol: 35 }] }
  };

  const applyPreset = (presetKey) => {
    handleStopAll();
    setSelectedPreset(presetKey);

    const config = PRESETS[presetKey];
    if (config) {
      const newActive = {};
      const newVols = { ...volumes };

      config.items.forEach(item => {
        newVols[item.id] = item.vol;
        audioEngine.startSound(item.id, item.vol / 100);
        newActive[item.id] = true;
      });

      setVolumes(newVols);
      setActiveSounds(newActive);
      if (onSoundStateChange) onSoundStateChange(Object.keys(newActive).length);
    }
  };

  const handleTimerSelect = (mins) => {
    if (selectedTimer === mins) {
      audioEngine.stopTimer();
      setSelectedTimer(null);
      if (onTimerChange) onTimerChange(null);
      return;
    }

    setSelectedTimer(mins);
    audioEngine.startTimer(
      mins,
      (remSec) => {
        const m = Math.floor(remSec / 60);
        const s = remSec % 60;
        const str = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        if (onTimerChange) onTimerChange(str);
      },
      () => {
        handleStopAll();
      }
    );
  };

  const activeCount = Object.values(activeSounds).filter(Boolean).length;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Console Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-300 block mb-1">
            자연의 소리와 델타파로 채우는 공간
          </span>
          <h2 className="text-2xl md:text-3xl text-white font-bold tracking-tight">
            밤의 소리를 섞어보세요
          </h2>
        </div>

        {/* Quick Slumber Timer */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-amber-300" />
            <span>타이머:</span>
          </span>
          {[15, 30, 45, 60].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleTimerSelect(mins)}
              className={`px-3 py-1.5 rounded-lg text-xs font-timer-display font-semibold transition-all cursor-pointer ${
                selectedTimer === mins
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {mins}분
            </button>
          ))}
        </div>
      </div>

      {/* Teenage Engineering Inspired Audio Console Container */}
      <div className="celestial-panel p-6 md:p-8 space-y-6">
        {/* Preset Toolbar & Live Spectrum */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">원터치 무드:</span>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  selectedPreset === key
                    ? 'bg-white/[0.14] text-white font-bold border border-white/25 shadow-sm'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleStopAll}
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>모두 끄기</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimal Audio Spectrum Display */}
        <div className="w-full bg-black/40 rounded-xl p-3 border border-white/[0.04] relative">
          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1.5 px-1">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-teal-400 animate-pulse' : 'bg-white/20'}`} />
              실시간 음향 스펙트럼
            </span>
            <span className="font-timer-display">{activeCount > 0 ? `${activeCount}채널 합성 중` : '대기 중'}</span>
          </div>
          <canvas ref={visualizerCanvasRef} className="w-full h-12 rounded-lg" />
        </div>

        {/* 8-Channel Hi-Fi Fader Grid (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSounds.map(sound => {
            const isPlaying = !!activeSounds[sound.id];
            const vol = volumes[sound.id] || 50;
            const IconComponent = sound.icon;

            return (
              <div
                key={sound.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isPlaying
                    ? 'bg-white/[0.06] border-white/20 shadow-lg shadow-black/40'
                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/10'
                }`}
              >
                {/* Channel Label & Status LED */}
                <div className="flex items-center gap-3 min-w-[130px]">
                  <button
                    type="button"
                    onClick={() => handleToggleSound(sound.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-400/15 text-amber-300 border-amber-400/35 shadow-sm'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-teal-400 animate-ping' : 'bg-slate-600'}`} />
                      <span className="font-bold text-xs text-white">{sound.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{sound.category}</span>
                  </div>
                </div>

                {/* Tactile Volume Slider & Numeric Display */}
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vol}
                    onChange={(e) => handleVolumeChange(sound.id, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-timer-display text-xs font-semibold text-slate-300 w-8 text-right">
                    {vol}%
                  </span>
                </div>

                {/* Power Toggle Icon */}
                <button
                  onClick={() => handleToggleSound(sound.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPlaying ? 'text-teal-300' : 'text-slate-600 hover:text-slate-400'
                  }`}
                  title={isPlaying ? "사운드 끄기" : "사운드 켜기"}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

