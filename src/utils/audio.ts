// Web Audio API synthesis for traditional Burmese bronze bell / temple gong sounds

let audioCtx: AudioContext | null = null;
let isMuted = false;

export function getAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return isMuted;
}

export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('thadingyut_audio_muted', muted ? 'true' : 'false');
  }
}

export function initAudio(): void {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function playChimeSound(freq = 660, duration = 2.8): void {
  if (isMuted) return;
  initAudio();
  if (!audioCtx) return;

  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + duration);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);

    // Harmonic metallic overtone
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.65);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now);
    osc2.stop(now + duration * 0.65);
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

export function playLaunchSound(): void {
  if (isMuted) return;
  playChimeSound(523.25, 3.2); // C5 temple tone
  setTimeout(() => playChimeSound(659.25, 3.0), 180); // E5
  setTimeout(() => playChimeSound(783.99, 3.5), 380); // G5
}

export function playSadhuSound(): void {
  if (isMuted) return;
  playChimeSound(880, 2.0); // A5 high bell
  setTimeout(() => playChimeSound(1046.5, 2.2), 150); // C6 bell
}

export function playTapSound(): void {
  if (isMuted) return;
  playChimeSound(784, 1.2);
}
