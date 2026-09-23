let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  void ctx.resume();
  return ctx;
}

/** Call directly during a user gesture, before timers or effects. */
export function resumeAudio() {
  const audio = getCtx();
  return audio?.resume() ?? Promise.resolve();
}

/** Plucked-string-ish tone using a decaying triangle wave. */
function pluck(audio: AudioContext, freq: number, at: number, dur = 0.9) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.22, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(audio.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** Play a list of frequencies in sequence (Hz), `gap` seconds apart. */
export function playSequence(freqs: number[], gap = 0.6) {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime + 0.05;
  freqs.forEach((f, i) => pluck(audio, f, now + i * gap));
}

/** Short percussive click, used by the rhythm trainer. */
export function playClick(accent = false) {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 1320 : 880;
  gain.gain.setValueAtTime(accent ? 0.16 : 0.09, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

/** Equal-temperament frequency for a note name like "A4" or "C#3". */
const SEMITONES: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

export function noteToFreq(note: string): number {
  const match = /^([A-G][#b]?)(-?\d)$/.exec(note);
  if (!match) return 440;
  const semi = SEMITONES[match[1] ?? "A"] ?? 9;
  const octave = Number(match[2] ?? 4);
  const midi = (octave + 1) * 12 + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
