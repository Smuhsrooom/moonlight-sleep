/**
 * Web Audio API 기반 절차적(Procedural) 수면 앰비언트 사운드 합성 엔진
 * 외부 오디오 파일 의존성 없이 브라우저 내에서 고음질 사운드를 실시간 합성합니다.
 */

class SleepAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.sounds = {};
    this.timerInterval = null;
    this.timerRemainingSeconds = 0;
    this.isTimerRunning = false;
    this.onTimerTick = null;
    this.onTimerEnd = null;

    this.soundDefs = {
      rain: { name: "밤비 소리", category: "nature", desc: "부드러운 창밖 빗소리" },
      waves: { name: "잔잔한 파도", category: "nature", desc: "밤바다의 규칙적인 파도" },
      campfire: { name: "모닥불 장작", category: "nature", desc: "타닥타닥 타는 장작불" },
      wind: { name: "숲속 바람", category: "nature", desc: "나뭇잎을 스치는 밤바람" },
      crickets: { name: "밤 귀뚜라미", category: "nature", desc: "시골 여름밤의 풀벌레" },
      brownNoise: { name: "브라운 노이즈", category: "noise", desc: "낮고 묵직한 딥슬립 저주파" },
      pinkNoise: { name: "핑크 노이즈", category: "noise", desc: "1/f 자연스러운 균형 소음" },
      deltaBinaural: { name: "432Hz 델타파", category: "brainwave", desc: "수면 뇌파 3Hz 동기화" }
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer(type = 'white') {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white * 0.15;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 0.45;
      }
    }
    return buffer;
  }

  startRain(volume = 0.6) {
    const buffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.7, this.ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    return { source, gain, filter };
  }

  startWaves(volume = 0.5) {
    const buffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12.5초 주기 파도
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.75, this.ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    lfo.start();

    return { source, gain, filter, lfo };
  }

  startCampfire(volume = 0.5) {
    const buffer = this.createNoiseBuffer('brown');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.65, this.ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    const crackleInterval = setInterval(() => {
      if (!this.sounds.campfire || !this.sounds.campfire.playing) {
        clearInterval(crackleInterval);
        return;
      }
      if (Math.random() < 0.45 && this.ctx) {
        const osc = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(Math.random() * 1200 + 400, this.ctx.currentTime);
        cGain.gain.setValueAtTime(Math.random() * 0.15 * volume, this.ctx.currentTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(cGain);
        cGain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }, 180);

    return { source, gain, filter, crackleInterval };
  }

  startWind(volume = 0.4) {
    const buffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.65, this.ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start();
    lfo.start();

    return { source, gain, filter, lfo };
  }

  startCrickets(volume = 0.3) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.frequency.setValueAtTime(4500, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(4700, this.ctx.currentTime);

    const mod = this.ctx.createOscillator();
    mod.frequency.setValueAtTime(22, this.ctx.currentTime);
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    mod.connect(modGain.gain);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.25, this.ctx.currentTime + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    mod.start();

    return { osc1, osc2, mod, gain };
  }

  startBrownNoise(volume = 0.45) {
    const buffer = this.createNoiseBuffer('brown');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.8, this.ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    return { source, gain, filter };
  }

  startPinkNoise(volume = 0.4) {
    const buffer = this.createNoiseBuffer('pink');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.7, this.ctx.currentTime + 0.3);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    return { source, gain };
  }

  startDeltaBinaural(volume = 0.5) {
    const carrierLeft = 432;
    const deltaBeat = 3.0; // 3Hz 델타파

    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    oscL.frequency.setValueAtTime(carrierLeft, this.ctx.currentTime);
    oscR.frequency.setValueAtTime(carrierLeft + deltaBeat, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.4, this.ctx.currentTime + 0.3);

    merger.connect(gain);
    gain.connect(this.masterGain);

    oscL.start();
    oscR.start();

    return { oscL, oscR, gain };
  }

  toggleSound(soundId, volume = 0.5) {
    this.init();
    if (this.sounds[soundId] && this.sounds[soundId].playing) {
      this.stopSound(soundId);
      return false;
    } else {
      this.startSound(soundId, volume);
      return true;
    }
  }

  startSound(soundId, volume = 0.5) {
    this.init();
    if (this.sounds[soundId] && this.sounds[soundId].playing) {
      this.setSoundVolume(soundId, volume);
      return;
    }

    let nodes = null;
    switch (soundId) {
      case 'rain': nodes = this.startRain(volume); break;
      case 'waves': nodes = this.startWaves(volume); break;
      case 'campfire': nodes = this.startCampfire(volume); break;
      case 'wind': nodes = this.startWind(volume); break;
      case 'crickets': nodes = this.startCrickets(volume); break;
      case 'brownNoise': nodes = this.startBrownNoise(volume); break;
      case 'pinkNoise': nodes = this.startPinkNoise(volume); break;
      case 'deltaBinaural': nodes = this.startDeltaBinaural(volume); break;
      default: return;
    }

    this.sounds[soundId] = {
      playing: true,
      nodes,
      volume
    };
  }

  stopSound(soundId) {
    const sound = this.sounds[soundId];
    if (!sound || !sound.playing) return;

    const { nodes } = sound;
    if (nodes.gain && this.ctx) {
      nodes.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      setTimeout(() => {
        try {
          if (nodes.source) nodes.source.stop();
          if (nodes.lfo) nodes.lfo.stop();
          if (nodes.osc1) nodes.osc1.stop();
          if (nodes.osc2) nodes.osc2.stop();
          if (nodes.oscL) nodes.oscL.stop();
          if (nodes.oscR) nodes.oscR.stop();
          if (nodes.crackleInterval) clearInterval(nodes.crackleInterval);
        } catch {
          // ignore
        }
      }, 250);
    }
    sound.playing = false;
  }

  setSoundVolume(soundId, volume) {
    const sound = this.sounds[soundId];
    if (!sound || !sound.playing || !sound.nodes.gain) return;
    sound.volume = volume;
    sound.nodes.gain.gain.linearRampToValueAtTime(volume * 0.7, this.ctx.currentTime + 0.05);
  }

  stopAll() {
    Object.keys(this.sounds).forEach(id => {
      this.stopSound(id);
    });
    this.stopTimer();
  }

  getActiveSoundCount() {
    return Object.values(this.sounds).filter(s => s.playing).length;
  }

  playSingingBowl(freq = 432) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 4.8;

    // Master Singing Bowl Gain
    const bowlMaster = this.ctx.createGain();
    bowlMaster.gain.setValueAtTime(0.001, t);
    bowlMaster.gain.linearRampToValueAtTime(0.38, t + 0.12);
    bowlMaster.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    // Warm Resonant Lowpass Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + duration);

    // 3 Harmonic Partials for Authentic Tibetan/Crystal Resonance
    const partials = [
      { ratio: 1.0, gain: 0.65, detune: 0 },
      { ratio: 2.71, gain: 0.28, detune: 1.5 },
      { ratio: 5.42, gain: 0.12, detune: -2.0 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const pGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * p.ratio, t);
      osc.detune.setValueAtTime(p.detune, t);

      pGain.gain.setValueAtTime(p.gain, t);
      pGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * Math.max(0.4, 1 / (p.ratio * 0.7)));

      osc.connect(pGain);
      pGain.connect(filter);

      osc.start(t);
      osc.stop(t + duration);
    });

    filter.connect(bowlMaster);
    bowlMaster.connect(this.masterGain);
  }

  startTimer(minutes, onTick, onEnd) {
    this.stopTimer();
    this.timerRemainingSeconds = minutes * 60;
    this.isTimerRunning = true;
    this.onTimerTick = onTick;
    this.onTimerEnd = onEnd;

    if (this.onTimerTick) this.onTimerTick(this.timerRemainingSeconds);

    this.timerInterval = setInterval(() => {
      this.timerRemainingSeconds--;
      if (this.onTimerTick) this.onTimerTick(this.timerRemainingSeconds);

      if (this.timerRemainingSeconds <= 10 && this.masterGain && this.ctx) {
        // 마지막 10초 페이드아웃
        const factor = Math.max(0.001, this.timerRemainingSeconds / 10);
        this.masterGain.gain.setValueAtTime(0.8 * factor, this.ctx.currentTime);
      }

      if (this.timerRemainingSeconds <= 0) {
        this.stopTimer();
        this.stopAll();
        if (this.onTimerEnd) this.onTimerEnd();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    this.timerRemainingSeconds = 0;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    }
  }

  getByteFrequencyData() {
    if (!this.analyser) return new Uint8Array(128);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  getByteTimeDomainData() {
    if (!this.analyser) return new Uint8Array(128);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

export const audioEngine = new SleepAudioEngine();
