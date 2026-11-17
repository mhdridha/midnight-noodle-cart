// Midnight Noodle Cart — every sound is synthesized with WebAudio, so
// the game ships zero audio files and never touches the network. All
// calls are guarded: with no user gesture yet (or in a headless
// screenshot run) there is no AudioContext and every function just returns.
let ctx = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  } catch (e) {
    return null;
  }
}

export function unlockAudio() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  try {
    const t0 = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch (e) {
    /* audio is garnish, never fatal */
  }
}

function noiseBurst(dur, vol, cutoff) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  try {
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  } catch (e) {
    /* audio is garnish, never fatal */
  }
}

export function sfxClick() {
  tone(700, 0.06, 'square', 0.1);
}

export function sfxStartCook() {
  noiseBurst(0.3, 0.12, 3200); // the wok hisses
}

export function sfxDing() {
  tone(1318, 0.16, 'sine', 0.18);
  tone(1760, 0.22, 'sine', 0.14, 0.08);
}

export function sfxCoin() {
  tone(988, 0.08, 'triangle', 0.2);
  tone(1318, 0.14, 'triangle', 0.2, 0.07);
}

export function sfxWalkout() {
  tone(220, 0.3, 'sawtooth', 0.14, 0, 110);
}

export function sfxBurn() {
  noiseBurst(0.4, 0.14, 900);
}

export function sfxRush() {
  tone(523, 0.1, 'triangle', 0.2);
  tone(659, 0.1, 'triangle', 0.2, 0.09);
  tone(784, 0.1, 'triangle', 0.2, 0.18);
  tone(1046, 0.22, 'triangle', 0.22, 0.27);
}

export function sfxDayClear() {
  tone(523, 0.12, 'triangle', 0.2);
  tone(659, 0.12, 'triangle', 0.2, 0.11);
  tone(784, 0.12, 'triangle', 0.2, 0.22);
  tone(1046, 0.3, 'triangle', 0.22, 0.33);
}

export function sfxGameOver() {
  tone(392, 0.2, 'triangle', 0.2);
  tone(330, 0.2, 'triangle', 0.2, 0.18);
  tone(262, 0.45, 'triangle', 0.2, 0.36);
}
