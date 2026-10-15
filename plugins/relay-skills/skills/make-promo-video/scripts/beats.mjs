// Beat grid detection for a music bed, dependency-free. Decodes to mono PCM with ffmpeg, builds an
// onset envelope (positive energy change per 11.6 ms hop), then searches tempo and phase near the
// expected BPM for the grid that lands on the most onset energy. Downbeats are the phase of the grid's
// strongest every-fourth beat. Good enough to cut to; not a general-purpose beat tracker.
import { spawnSync } from 'node:child_process';

const RATE = 22050;
const HOP = 256;

export function decodeMono(file) {
  const result = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-'], { maxBuffer: 512 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`ffmpeg could not decode ${file}`);
  const buf = result.stdout;
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
}

export function onsetEnvelope(samples) {
  const frames = Math.floor(samples.length / HOP);
  const energy = new Float32Array(frames);
  for (let f = 0; f < frames; f += 1) {
    let sum = 0;
    for (let i = f * HOP; i < (f + 1) * HOP; i += 1) sum += samples[i] * samples[i];
    energy[f] = Math.log1p(sum * 1000);
  }
  const onset = new Float32Array(frames);
  for (let f = 1; f < frames; f += 1) onset[f] = Math.max(0, energy[f] - energy[f - 1]);
  return { onset, frameSeconds: HOP / RATE };
}

// Returns { bpm, beats: [seconds...], downbeatIndex, confidence }.
export function detectBeats(file, { expectedBpm = 112, range = 10 } = {}) {
  const { onset, frameSeconds } = onsetEnvelope(decodeMono(file));
  const duration = onset.length * frameSeconds;
  const at = (seconds) => {
    const f = Math.round(seconds / frameSeconds);
    let best = 0;
    for (let k = f - 2; k <= f + 2; k += 1) if (k >= 0 && k < onset.length) best = Math.max(best, onset[k]);
    return best;
  };
  let best = { score: -1 };
  for (let bpm = expectedBpm - range; bpm <= expectedBpm + range; bpm += 0.25) {
    const period = 60 / bpm;
    for (let phase = 0; phase < period; phase += frameSeconds) {
      let score = 0;
      let n = 0;
      for (let t = phase; t < duration; t += period) { score += at(t); n += 1; }
      score /= n || 1;
      if (score > best.score) best = { score, bpm, phase };
    }
  }
  const period = 60 / best.bpm;
  const beats = [];
  for (let t = best.phase; t < duration; t += period) beats.push(Number(t.toFixed(4)));
  const bar = [0, 1, 2, 3].map((offset) => beats.filter((_, i) => i % 4 === offset).reduce((s, t) => s + at(t), 0));
  const downbeatIndex = bar.indexOf(Math.max(...bar));
  let mean = 0;
  for (const value of onset) mean += value;
  mean /= onset.length || 1;
  return { bpm: Number(best.bpm.toFixed(2)), beats, downbeatIndex, confidence: Number((best.score / (mean || 1)).toFixed(2)) };
}
