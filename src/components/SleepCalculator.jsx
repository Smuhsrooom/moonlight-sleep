import React, { useState, useMemo } from 'react';
import { Moon, CalendarPlus, Check, Sparkles, Sun, ChevronUp, ChevronDown, Bell } from 'lucide-react';
import { sleepCalculator } from '../services/sleepCycle';

export const SleepCalculator = () => {
  const [mode, setMode] = useState('wake'); // 'wake' or 'now'
  const [ampm, setAmpm] = useState('AM');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [nowRefreshKey, setNowRefreshKey] = useState(0);
  const [downloadedIdx, setDownloadedIdx] = useState(null);

  const results = useMemo(() => {
    if (mode === 'wake') {
      let h = hour;
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      return sleepCalculator.calculateBedTimes(h, minute);
    } else {
      void nowRefreshKey;
      const res = sleepCalculator.calculateWakeTimes(new Date());
      return res.filter(r => r.cycles >= 3 && r.cycles <= 6).reverse();
    }
  }, [mode, ampm, hour, minute, nowRefreshKey]);

  const handleDownloadCalendar = (item, idx) => {
    sleepCalculator.downloadCalendarEvent(
      item.targetTime,
      `달빛수면: ${mode === 'wake' ? '취침 알람' : '기상 알람'} (${item.durationHours}시간)`
    );
    setDownloadedIdx(idx);
    setTimeout(() => setDownloadedIdx(null), 3000);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(30); } catch { /* ignore */ }
    }
  };

  const goldenItem = results.find(r => r.quality === 'best') || results[0];
  const secondaryItems = results.filter(r => r !== goldenItem);

  const handleHourChange = (delta) => {
    setHour(prev => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  const handleMinuteChange = (delta) => {
    setMinute(prev => {
      let next = prev + delta;
      if (next >= 60) next = 0;
      if (next < 0) next = 45;
      return next;
    });
  };

  const setMinuteDirect = (mins) => {
    setMinute(mins % 60);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Integrated Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-semibold text-amber-300/90 block mb-1">
            90분 울트라디안 수면 주기
          </span>
          <h2 className="text-2xl md:text-3xl text-white font-bold tracking-tight">
            {mode === 'wake' ? '몇 시에 일어날까요?' : '지금 잠들면 언제 깰까요?'}
          </h2>
        </div>

        {/* Sleek Segmented Mode Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('wake')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              mode === 'wake'
                ? 'bg-white/[0.12] text-white border border-white/20 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            기상 시각 기준
          </button>
          <button
            type="button"
            onClick={() => setMode('now')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              mode === 'now'
                ? 'bg-white/[0.12] text-white border border-white/20 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            지금 바로 취침
          </button>
        </div>
      </div>

      {/* Main Console Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Open Minimal Time Dial (5 cols) */}
        <div className="lg:col-span-5 celestial-panel p-6 md:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                {mode === 'wake' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-300" />}
                <span>{mode === 'wake' ? '목표 기상 시각' : '현재 시각 동기화'}</span>
              </span>

              {mode === 'now' && (
                <button
                  type="button"
                  onClick={() => setNowRefreshKey(k => k + 1)}
                  className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>현재 시각 갱신</span>
                </button>
              )}
            </div>

            {mode === 'wake' ? (
              <div className="space-y-4 py-2">
                {/* Modern Clean AM/PM Text Switch */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setAmpm('AM')}
                    className={`text-xs font-bold tracking-wider transition-all cursor-pointer ${
                      ampm === 'AM' 
                        ? 'text-amber-300 scale-105' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    오전 AM
                  </button>
                  <span className="text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() => setAmpm('PM')}
                    className={`text-xs font-bold tracking-wider transition-all cursor-pointer ${
                      ampm === 'PM' 
                        ? 'text-amber-300 scale-105' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    오후 PM
                  </button>
                </div>

                {/* Open Typographic Dial (No Box in Box) */}
                <div className="flex items-center justify-center gap-6 py-3">
                  {/* Hour */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleHourChange(1)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer"
                      title="1시간 증가"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className="font-timer-display text-5xl md:text-6xl font-extrabold text-white py-1 w-20 text-center tracking-tight select-none">
                      {hour < 10 ? `0${hour}` : hour}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHourChange(-1)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer"
                      title="1시간 감소"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  <span className="text-4xl text-slate-600 font-light -mt-2">:</span>

                  {/* Minute */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleMinuteChange(15)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer"
                      title="15분 증가"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className="font-timer-display text-5xl md:text-6xl font-extrabold text-white py-1 w-20 text-center tracking-tight select-none">
                      {minute === 0 ? '00' : (minute < 10 ? `0${minute}` : minute)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMinuteChange(-15)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer"
                      title="15분 감소"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Minute Stepper Pills */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[0, 15, 30, 45].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMinuteDirect(m)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                        minute === m
                          ? 'bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {m === 0 ? '정각' : `${m}분`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <span className="font-timer-display text-4xl md:text-5xl text-amber-300 font-extrabold tracking-tight">
                  {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-slate-400">
                  지금 잠들면 입면 준비 14분 후 첫 수면 사이클이 시작됩니다.
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/[0.06] pt-4">
            평균 입면 잠복기 14분과 90분 수면 사이클(NREM-REM)이 정밀하게 계산됩니다.
          </p>
        </div>

        {/* Right Column: Golden Rest Recommendation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {goldenItem && (
            <div className="celestial-panel celestial-panel-gold p-6 md:p-8 relative overflow-hidden flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-400/20 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold text-amber-300 tracking-tight">
                      가장 추천하는 {mode === 'wake' ? '취침' : '기상'} 시각
                    </span>
                  </div>
                  <span className="text-xs text-amber-300/80 font-medium">
                    {goldenItem.cycles}사이클 권장 (실수면 {goldenItem.durationHours}시간)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">
                      {mode === 'wake' ? '이 시간에 누우세요' : '이 시간에 알람을 맞추세요'}
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-timer-display text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        {goldenItem.timeString}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadCalendar(goldenItem, 99)}
                    className="self-start sm:self-auto px-4 py-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 hover:border-amber-400/50 rounded-xl transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {downloadedIdx === 99 ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-300" />
                        <span>캘린더에 담김</span>
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>캘린더 알람 등록</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {goldenItem.desc}
                </p>
              </div>

              {/* Hypnogram Timeline Bar */}
              <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
                <div className="hypnogram-timeline w-full">
                  {sleepCalculator.getHypnogramSegments(goldenItem.cycles).map((seg, sIdx) => (
                    <div
                      key={sIdx}
                      className={`hypno-seg hypno-${seg.type}`}
                      style={{ width: `${seg.widthPercent}%` }}
                      title={seg.name}
                    />
                  ))}
                </div>
                
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
                    입면 준비 (14분)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                    깊은 숙면 (서파)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#818CF8]" />
                    기억 정리 (REM)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                    자연 기상
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Cycles Horizontal Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {secondaryItems.map((item, idx) => {
              const isDownloaded = downloadedIdx === idx;
              return (
                <div
                  key={idx}
                  className="celestial-panel p-4 flex flex-col justify-between gap-1.5 group hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {item.cycles}사이클 ({item.durationHours}h)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadCalendar(item, idx)}
                      title="캘린더에 알람 등록"
                      className="text-slate-400 hover:text-amber-300 transition-colors p-1 cursor-pointer"
                    >
                      {isDownloaded ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Bell className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="font-timer-display text-2xl font-bold text-white tracking-tight">
                    {item.timeString}
                  </span>

                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {item.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clean 1-Line Footnote (No Emojis) */}
      <div className="text-center pt-2">
        <span className="text-xs text-slate-500">
          수면은 90분 주기로 반복되며, 얕은 잠 단계에서 일어날 때 뇌 피로가 남지 않고 상쾌합니다.
        </span>
      </div>
    </div>
  );
};


