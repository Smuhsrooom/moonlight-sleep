/**
 * 90분 수면 주기 계산기 및 오라링 하이프노그램 세그먼트 생성 서비스
 */

export class SleepCycleCalculator {
  constructor() {
    this.CYCLE_MINUTES = 90;
    this.FALL_ASLEEP_MINUTES = 14;
  }

  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr} ${ampm}`;
  }

  calculateWakeTimes(fromTime = new Date()) {
    const results = [];
    const baseTime = new Date(fromTime.getTime() + this.FALL_ASLEEP_MINUTES * 60 * 1000);

    for (let cycles = 1; cycles <= 6; cycles++) {
      const sleepDurationMinutes = cycles * this.CYCLE_MINUTES;
      const wakeTime = new Date(baseTime.getTime() + sleepDurationMinutes * 60 * 1000);
      const totalHours = (sleepDurationMinutes / 60).toFixed(1);

      let quality = 'normal';
      let tag = '';
      let desc = '';

      if (cycles === 5) {
        quality = 'best';
        tag = '가장 권장하는 수면';
        desc = '성인 신경계 및 두뇌 회복에 가장 이상적인 7시간 30분 수면입니다.';
      } else if (cycles === 6) {
        quality = 'great';
        tag = '충분한 회복 수면';
        desc = '신체 피로와 누적된 수면 부채를 씻어내는 9시간 수면입니다.';
      } else if (cycles === 4) {
        quality = 'good';
        tag = '집중 수면';
        desc = '바쁜 일정 중 최소한의 컨디션을 유지할 수 있는 6시간 수면입니다.';
      } else if (cycles === 3) {
        quality = 'short';
        tag = '단기 최소 수면';
        desc = '긴급한 상황에서 최소한의 뇌 휴식을 취하는 4시간 30분 수면입니다.';
      } else {
        quality = 'nap';
        tag = '파워 낮잠';
        desc = `${totalHours}시간 — 뇌 각성을 돕는 낮잠`;
      }

      results.push({
        cycles,
        targetTime: wakeTime,
        timeString: this.formatTime(wakeTime),
        durationHours: totalHours,
        quality,
        tag,
        desc
      });
    }

    return results;
  }

  calculateBedTimes(targetWakeHour, targetWakeMinute) {
    const results = [];
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(targetWakeHour, targetWakeMinute, 0, 0);

    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    for (let cycles = 6; cycles >= 3; cycles--) {
      const totalMinutesToSubtract = (cycles * this.CYCLE_MINUTES) + this.FALL_ASLEEP_MINUTES;
      const bedTime = new Date(targetDate.getTime() - totalMinutesToSubtract * 60 * 1000);
      const sleepHours = (cycles * 1.5).toFixed(1);

      let quality = 'normal';
      let tag = '';
      let desc = '';

      if (cycles === 5) {
        quality = 'best';
        tag = '가장 권장하는 수면';
        desc = `7시간 30분 수면 (입면 14분 포함)`;
      } else if (cycles === 6) {
        quality = 'great';
        tag = '충분한 회복 수면';
        desc = `9시간 수면 (입면 14분 포함)`;
      } else if (cycles === 4) {
        quality = 'good';
        tag = '집중 수면';
        desc = `6시간 수면 (입면 14분 포함)`;
      } else {
        quality = 'short';
        tag = '단기 최소 수면';
        desc = `4시간 30분 수면 (입면 14분 포함)`;
      }

      results.push({
        cycles,
        targetTime: bedTime,
        timeString: this.formatTime(bedTime),
        durationHours: sleepHours,
        quality,
        tag,
        desc
      });
    }

    return results;
  }

  getHypnogramSegments(cycles) {
    const segments = [];
    // 입면 잠복기 (14분)
    segments.push({ type: 'latency', name: '입면 잠복기 (14분)', widthPercent: 8 });

    // 각 주기별 N3 깊은 수면, N1/N2 얕은 수면, REM 분배
    const cycleWidth = 92 / cycles;
    for (let i = 1; i <= cycles; i++) {
      if (i <= 2) {
        segments.push({ type: 'deep', name: `C${i} 서파 수면(N3)`, widthPercent: cycleWidth * 0.45 });
        segments.push({ type: 'light', name: `C${i} 얕은 수면(N1/N2)`, widthPercent: cycleWidth * 0.35 });
        segments.push({ type: 'rem', name: `C${i} 렘수면(REM)`, widthPercent: cycleWidth * 0.20 });
      } else {
        segments.push({ type: 'rem', name: `C${i} 렘수면(REM)`, widthPercent: cycleWidth * 0.45 });
        segments.push({ type: 'light', name: `C${i} 얕은 수면(N1/N2)`, widthPercent: cycleWidth * 0.40 });
        segments.push({ type: 'deep', name: `C${i} 서파 수면(N3)`, widthPercent: cycleWidth * 0.15 });
      }
    }
    return segments;
  }

  downloadCalendarEvent(timeDate, title = "달빛수면 취침/기상 알람") {
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startTime = formatDate(timeDate);
    const endTime = formatDate(new Date(timeDate.getTime() + 15 * 60 * 1000));

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Moonlight Sleep//Sleep Cycle Scheduler//KO',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:달빛수면 90분 수면 주기 최적화 알람`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT10M',
      'ACTION:DISPLAY',
      'DESCRIPTION:수면 준비 시간입니다',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'moonlight_sleep_alarm.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const sleepCalculator = new SleepCycleCalculator();
