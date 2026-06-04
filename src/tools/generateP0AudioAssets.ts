import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import type { AudioCueConfig } from '../shared/audio/AudioCue.types.js';

const SAMPLE_RATE = 44100;
const ROOT = process.cwd();
const TEMP_DIR = resolve(ROOT, '.tmp/audio-p0');
const cues = JSON.parse(readFileSync(resolve(ROOT, 'configs/audio/AudioCues.json'), 'utf8')) as AudioCueConfig[];

for (const cue of cues.filter((item) => item.bus !== 'voice' && item.status !== 'deferred')) {
  const variant = Number(cue.cueId.slice(-3));
  const duration = cue.loop ? 2.4 : inferDuration(cue.cueId, variant);
  const buffer = new Float32Array(Math.ceil(duration * SAMPLE_RATE));
  renderCue(cue.cueId, variant, buffer, SAMPLE_RATE);
  normalize(buffer, 0.88);
  writeOgg(cue.assetPath, buffer, cue.loop);
  console.info(`Generated ${cue.assetPath}`);
}

rmSync(TEMP_DIR, { recursive: true, force: true });

function inferDuration(cueId: string, variant: number): number {
  if (cueId.includes('tap')) return 0.09 + variant * 0.01;
  if (cueId.includes('confirm')) return 0.28 + variant * 0.035;
  if (cueId.includes('lootbox_open')) return 0.74 + variant * 0.06;
  if (cueId.includes('reward_spark')) return 0.44 + variant * 0.04;
  if (cueId.includes('hit_iron')) return 0.15 + variant * 0.018;
  if (cueId.includes('enemy_break')) return 0.36 + variant * 0.055;
  if (cueId.includes('module_upgrade')) return 0.84 + variant * 0.07;
  if (cueId.includes('ad_reward')) return 0.74 + variant * 0.06;
  if (cueId.includes('stage_clear')) return 0.9 + variant * 0.08;
  return 0.5;
}

function renderCue(cueId: string, variant: number, buffer: Float32Array, sampleRate: number): void {
  forEachSample(buffer, sampleRate, (t) => {
    if (cueId.includes('tap')) return tap(t, variant);
    if (cueId.includes('confirm')) return confirmSteam(t, variant);
    if (cueId.includes('lootbox_open')) return lootboxOpen(t, variant);
    if (cueId.includes('reward_spark')) return rewardSpark(t, variant);
    if (cueId.includes('hit_iron')) return combatHit(t, variant);
    if (cueId.includes('enemy_break')) return enemyBreak(t, variant);
    if (cueId.includes('module_upgrade')) return moduleUpgrade(t, variant);
    if (cueId.includes('train_loop')) return trainLoop(t, variant, buffer.length / sampleRate);
    if (cueId.includes('ad_reward')) return adRewardDrop(t, variant);
    if (cueId.includes('stage_clear')) return stageWhistle(t, variant);
    return 0;
  });
}

function tap(t: number, v: number): number {
  const f = 720 + v * 170;
  return expEnv(t, 0.045 + v * 0.008) * (0.55 * sine(f, t) + 0.22 * triangle(f * 2, t)) + whiteNoise(t + v) * expEnv(t, 0.02) * 0.1;
}

function confirmSteam(t: number, v: number): number {
  const click = expEnv(t, 0.06 + v * 0.012) * (0.45 * sine(1000 + v * 110, t) + 0.2 * sine(2200 + v * 120, t));
  const steamT = Math.max(0, t - (0.04 + v * 0.012));
  return click + (steamT > 0 ? bandNoise(t + v, 600, 2400 + v * 260) * expEnv(steamT, 0.2 + v * 0.035) * 0.3 : 0);
}

function lootboxOpen(t: number, v: number): number {
  const thump = sine(80 + v * 12 - 35 * Math.min(t / 0.22, 1), t) * expEnv(t, 0.14 + v * 0.015) * 0.8;
  const starts = Array.from({ length: 4 + v }, (_, i) => 0.16 + i * (0.08 - v * 0.004));
  const ratchet = pulseSeries(t, starts, 0.018, 0.4, 850 + v * 60, 2400 + v * 130);
  const steamT = Math.max(0, t - 0.48 - v * 0.04);
  return thump + ratchet + (steamT > 0 ? bandNoise(t, 1200, 4800) * expEnv(steamT, 0.22 + v * 0.03) * 0.32 : 0);
}

function rewardSpark(t: number, v: number): number {
  const glide = sine(760 + v * 90 + (820 + v * 80) * Math.min(t / 0.42, 1), t) * expEnv(t, 0.3 + v * 0.03) * 0.45;
  const bells = pulseSeries(t, [0.09, 0.16, 0.25, 0.34, 0.44].slice(0, 2 + v), 0.04, 0.2, 2300 + v * 120, 3600 + v * 150);
  return glide + bells + highNoise(t, 2200 + v * 120) * expEnv(t, 0.32) * (0.08 + v * 0.02);
}

function combatHit(t: number, v: number): number {
  const impact = bandNoise(t + v, 140, 3900 + v * 180) * expEnv(t, 0.065 + v * 0.008) * 0.65;
  const ping = (sine(520 + v * 120, t) + 0.45 * sine(1100 + v * 95, t)) * expEnv(t, 0.09 + v * 0.012) * 0.42;
  return distort(impact + ping, 1.05 + v * 0.12);
}

function enemyBreak(t: number, v: number): number {
  const crunch = bandNoise(t + v, 120, 850 + v * 120) * expEnv(t, 0.14 + v * 0.018) * 0.7;
  const fragments = pulseSeries(t, [0.1, 0.16, 0.23, 0.31, 0.42, 0.5].slice(0, 3 + v), 0.025, 0.25, 1400, 4400 + v * 120);
  return distort(crunch + fragments, 1 + v * 0.12);
}

function moduleUpgrade(t: number, v: number): number {
  const clicks = pulseSeries(t, [0.05, 0.13, 0.22, 0.32, 0.43].slice(0, 2 + v), 0.02, 0.34, 900, 1800 + v * 120);
  const hyd = Math.max(0, t - (0.14 + v * 0.03));
  const toneT = Math.max(0, t - 0.34);
  return clicks + (hyd > 0 ? bandNoise(t, 300, 1300) * expEnv(hyd, 0.38 + v * 0.04) * 0.25 : 0) + (toneT > 0 ? sine(300 + v * 35 + 330 * Math.min(toneT / 0.55, 1), t) * expEnv(toneT, 0.55) * 0.42 : 0);
}

function trainLoop(t: number, v: number, duration: number): number {
  const loopPos = t / duration;
  const wheel = (0.5 + 0.5 * sine(2.1 + v * 0.35, t)) ** 8;
  return (sine(78 + v * 10, t) * wheel * 0.17 + lowNoise(t + v) * (0.13 + v * 0.03) + bandNoise(t, 800, 2200) * ((0.5 + 0.5 * sine(0.65 + v * 0.18, t)) ** 4) * 0.08) * (Math.sin(Math.PI * loopPos) ** 0.18);
}

function adRewardDrop(t: number, v: number): number {
  const whistle = sine(1600 + v * 220 - (1100 + v * 110) * Math.min(t / 0.45, 1), t) * smoothWindow(t, 0, 0.48) * 0.34;
  const impactT = Math.max(0, t - (0.43 + v * 0.05));
  const impact = impactT > 0 ? (sine(90 + v * 20, t) + bandNoise(t, 90, 900)) * expEnv(impactT, 0.13) * 0.58 : 0;
  return distort(whistle + impact + highNoise(Math.max(0, t - 0.56), 1600) * expEnv(Math.max(0, t - 0.56), 0.28) * 0.2, 1.1);
}

function stageWhistle(t: number, v: number): number {
  const bend = 1 + (0.015 + v * 0.012) * Math.sin(Math.PI * Math.min(t / 0.75, 1));
  const env = smoothWindow(t, 0.02, 0.95 + v * 0.08);
  return (sine((494 + v * 29) * bend, t) + 0.3 * sine((740 + v * 44) * bend, t)) * env * 0.52 + bandNoise(t, 300, 1800) * env * (0.08 + v * 0.03);
}

function writeOgg(relativePath: string, buffer: Float32Array, loop: boolean): void {
  const outputPath = resolve(ROOT, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  mkdirSync(TEMP_DIR, { recursive: true });
  const tempWavPath = resolve(TEMP_DIR, `${relativePath.replace(/[\\/]/g, '_')}.wav`);
  writeFileSync(tempWavPath, encodeWav(buffer, SAMPLE_RATE));
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', tempWavPath, '-ac', '1', '-ar', String(SAMPLE_RATE), '-c:a', 'libvorbis', '-q:a', loop ? '3' : '4', outputPath]);
}

function forEachSample(buffer: Float32Array, sampleRate: number, render: (timeSeconds: number) => number): void {
  for (let i = 0; i < buffer.length; i += 1) buffer[i] = render(i / sampleRate);
}

function sine(freq: number, t: number): number { return Math.sin(2 * Math.PI * freq * t); }
function triangle(freq: number, t: number): number { return (2 / Math.PI) * Math.asin(sine(freq, t)); }
function expEnv(t: number, decay: number): number { return Math.exp(-t / decay); }
function distort(value: number, amount: number): number { return Math.tanh(value * amount); }
function whiteNoise(t: number): number { const x = Math.sin((t + 1.2345) * 43758.5453) * 10000; return 2 * (x - Math.floor(x)) - 1; }
function bandNoise(t: number, lowHz: number, highHz: number): number { return (sine(lowHz, t + whiteNoise(t) * 0.0003) + sine(highHz, t + whiteNoise(t + 0.17) * 0.0002)) * whiteNoise(t) * 0.5; }
function highNoise(t: number, floorHz: number): number { return whiteNoise(t) * sine(floorHz + 600 * whiteNoise(t + 0.21), t); }
function lowNoise(t: number): number { return 0.5 * whiteNoise(Math.floor(t * 90) / 90) + 0.5 * whiteNoise(Math.floor(t * 47) / 47); }

function pulseSeries(t: number, starts: number[], width: number, gain: number, minFreq: number, maxFreq: number): number {
  return starts.reduce((sum, start, index) => {
    const local = t - start;
    if (local < 0 || local > width * 4) return sum;
    const freq = minFreq + ((maxFreq - minFreq) * ((index * 37) % 100)) / 100;
    return sum + sine(freq, t) * expEnv(local, width) * gain;
  }, 0);
}

function smoothWindow(t: number, start: number, end: number): number {
  if (t < start || t > end) return 0;
  return Math.max(0, Math.min(Math.min((t - start) / 0.08, 1), Math.min((end - t) / 0.25, 1)));
}

function normalize(buffer: Float32Array, targetPeak: number): void {
  let peak = 0;
  for (const sample of buffer) peak = Math.max(peak, Math.abs(sample));
  if (peak <= 0) return;
  const gain = targetPeak / peak;
  for (let i = 0; i < buffer.length; i += 1) buffer[i] *= gain;
}

function encodeWav(buffer: Float32Array, sampleRate: number): Buffer {
  const output = Buffer.alloc(44 + buffer.length * 2);
  output.write('RIFF', 0); output.writeUInt32LE(36 + buffer.length * 2, 4); output.write('WAVE', 8); output.write('fmt ', 12);
  output.writeUInt32LE(16, 16); output.writeUInt16LE(1, 20); output.writeUInt16LE(1, 22); output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * 2, 28); output.writeUInt16LE(2, 32); output.writeUInt16LE(16, 34); output.write('data', 36);
  output.writeUInt32LE(buffer.length * 2, 40);
  for (let i = 0; i < buffer.length; i += 1) output.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buffer[i])) * 32767), 44 + i * 2);
  return output;
}
