// Web Audio API Synthesized Sound Effects for Smilance
// Fast, lightweight, zero-dependency audio generation that works 100% offline

export const getChimeSetting = (): boolean => {
  return localStorage.getItem('smilance_chimes_enabled') !== 'false';
};

export const setChimeSetting = (enabled: boolean) => {
  localStorage.setItem('smilance_chimes_enabled', enabled ? 'true' : 'false');
};

const getAudioContext = (): AudioContext | null => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  } catch {
    return null;
  }
};

// Play a sweet, soft toggleable click feedback chime
export const playTapChime = () => {
  if (!getChimeSetting()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Nice high feedback pitch
    osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
    osc.frequency.exponentialRampToValueAtTime(1479.98, ctx.currentTime + 0.08); // Fs6 note

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio Context failed to play:', e);
  }
};

// Play a short random tap bubble popping sound
export const playScreenTapChime = () => {
  if (!getChimeSetting()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = 400 + Math.random() * 400; // 400 - 800Hz
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio Context screen tap failed:', e);
  }
};

// Play a distinct chord bell for specific digit keys on the security PIN pad
export const playPinChime = (digit: string) => {
  if (!getChimeSetting()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const parseDigit = parseInt(digit, 10) || 5;
    // Map digit 0-9 to clean harmonic musical frequencies
    const baseFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
    const freq = baseFreqs[parseDigit % baseFreqs.length];

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    // Overtone for a sweet, metal-bell-chime ring
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.0, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn('Audio Context pin chime failed:', e);
  }
};

// Play a warm successful chime sequence (e.g. on unlocked or verified)
export const playSuccessChime = () => {
  if (!getChimeSetting()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    gainNode.connect(ctx.destination);

    // Three rapid notes in an ascending arpeggio
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.connect(gainNode);
      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.08, 0.15); // E5
    playNote(783.99, now + 0.16, 0.25); // G5
  } catch (e) {
    console.warn('Audio Context success chime failed:', e);
  }
};

// Play a warning/error click hum
export const playErrorChime = () => {
  if (!getChimeSetting()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {
    console.warn('Audio Context error chime failed:', e);
  }
};
