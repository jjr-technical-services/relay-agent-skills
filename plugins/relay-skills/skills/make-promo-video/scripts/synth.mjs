// Procedural music bed: an original, deterministic ambient progression (pad, soft arpeggio, bass)
// generated sample by sample. It exists so a promo always has a cleared bed; for a published campaign
// prefer a licensed track (promo.json music.file) or a licensed generator whose terms cover ads.
import fs from 'node:fs';
import { run } from './lib.mjs';

const RATE = 48000;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
// D major colour: Dmaj9, Bm9, Gmaj9, Asus(add6). MIDI note numbers.
const PROGRESSION = [
  { root: 38, pad: [50, 54, 57, 61, 64], arp: [74, 76, 78, 81] },
  { root: 35, pad: [47, 50, 54, 57, 61], arp: [71, 74, 76, 78] },
  { root: 31, pad: [43, 47, 50, 54, 57], arp: [71, 74, 78, 79] },
  { root: 33, pad: [45, 50, 52, 54, 59], arp: [69, 73, 76, 78] },
];

export function synthMusic(outFile, seconds, { bpm = 96 } = {}) {
  const beat = 60 / bpm;
  const chordLen = beat * 8;
  const total = Math.ceil(seconds * RATE);
  const left = new Float32Array(total);
  const right = new Float32Array(total);
  const xfade = 0.9;
  for (let i = 0; i < total; i += 1) {
    const t = i / RATE;
    const ci = Math.floor(t / chordLen);
    const chord = PROGRESSION[ci % PROGRESSION.length];
    const prev = PROGRESSION[(ci + PROGRESSION.length - 1) % PROGRESSION.length];
    const into = t - ci * chordLen;
    const mixIn = ci === 0 ? 1 : Math.min(1, into / xfade);
    let pad = 0;
    const padVoice = (notes, gain) => {
      let v = 0;
      for (let k = 0; k < notes.length; k += 1) {
        const f = midi(notes[k]);
        const detune = 1 + 0.0015 * Math.sin(2 * Math.PI * (0.13 + k * 0.07) * t);
        v += Math.sin(2 * Math.PI * f * detune * t) + 0.18 * Math.sin(4 * Math.PI * f * t);
      }
      return (v / notes.length) * gain;
    };
    pad += padVoice(chord.pad, mixIn);
    if (mixIn < 1) pad += padVoice(prev.pad, 1 - mixIn);
    const swell = 0.8 + 0.2 * Math.sin(2 * Math.PI * t / chordLen - Math.PI / 2);
    pad *= 0.34 * swell;
    // Arpeggio: eighth notes, exponential decay, alternating pan.
    const eighth = beat / 2;
    const step = Math.floor(t / eighth);
    const since = t - step * eighth;
    const note = chord.arp[step % chord.arp.length];
    const fa = midi(note);
    const env = Math.exp(-since / 0.22) * Math.min(1, since / 0.004);
    const arp = (Math.sin(2 * Math.PI * fa * t) + 0.25 * Math.sin(6 * Math.PI * fa * t)) * env * 0.11;
    const pan = step % 2 === 0 ? 0.35 : -0.35;
    // Bass on beats 1 and 3 of each bar.
    const halfBar = beat * 2;
    const bassSince = t - Math.floor(t / halfBar) * halfBar;
    const bassEnv = Math.exp(-bassSince / 0.55) * Math.min(1, bassSince / 0.01);
    const bass = Math.sin(2 * Math.PI * midi(chord.root) * t) * bassEnv * 0.28;
    left[i] = pad + bass + arp * (1 - pan);
    right[i] = pad + bass + arp * (1 + pan);
  }
  let peak = 0;
  for (let i = 0; i < total; i += 1) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const gain = 0.5 / (peak || 1);
  const data = Buffer.alloc(total * 4);
  for (let i = 0; i < total; i += 1) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i] * gain)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i] * gain)) * 32767), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
  header.writeUInt32LE(RATE, 24); header.writeUInt32LE(RATE * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length, 40);
  const raw = `${outFile}.raw.wav`;
  fs.writeFileSync(raw, Buffer.concat([header, data]));
  run('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af',
    `lowpass=f=4200,aecho=0.8:0.6:90|170:0.22|0.14,afade=t=in:d=1.5,afade=t=out:st=${Math.max(0, seconds - 2.5)}:d=2.5`, outFile]);
  fs.rmSync(raw);
  return outFile;
}
