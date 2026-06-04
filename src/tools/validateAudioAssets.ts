import { existsSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { loadConfigRegistry } from '../data/ConfigLoader.js';
import { readJsonConfig } from './readJsonConfig.js';

const rootDir = process.cwd();
const result = loadConfigRegistry(readJsonConfig(rootDir));

if (!result.ok) {
  console.error(result.error.message, result.error.context);
  process.exit(1);
}

const config = result.value;
const referencedCueIds = new Set(config.audioEvents.flatMap((event) => event.variants.map((variant) => variant.cueId)));
let mainPackageBytes = 0;
let generatedP0Bytes = 0;
let voiceBytes = 0;
let failed = false;

for (const cue of config.audioCues) {
  if (!referencedCueIds.has(cue.cueId)) {
    console.error(`Unreferenced audio cue: ${cue.cueId}`);
    failed = true;
  }

  if (cue.status === 'deferred') {
    continue;
  }

  const fullPath = resolve(rootDir, cue.assetPath);
  if (!existsSync(fullPath)) {
    console.error(`Missing audio file for ${cue.cueId}: ${cue.assetPath}`);
    failed = true;
    continue;
  }

  const extension = extname(cue.assetPath).toLowerCase();
  if (!config.audioBudget.allowedRuntimeExtensions.includes(extension)) {
    console.error(`Invalid audio extension for ${cue.cueId}: ${extension}`);
    failed = true;
  }

  if (!config.audioBudget.allowRuntimeWav && extension === '.wav') {
    console.error(`Runtime wav is forbidden for ${cue.cueId}`);
    failed = true;
  }

  const bytes = statSync(fullPath).size;
  const limit = cue.loop ? config.audioBudget.maxRuntimeLoopBytes : config.audioBudget.maxRuntimeSfxBytes;
  if (bytes > cue.targetMaxBytes || bytes > limit) {
    console.error(`Audio file over budget for ${cue.cueId}: ${bytes} bytes`);
    failed = true;
  }

  if (cue.packageTag === 'main') {
    mainPackageBytes += bytes;
  }

  if (cue.packageTag === 'main' || cue.packageTag === 'placeholder') {
    generatedP0Bytes += bytes;
  }

  if (cue.bus === 'voice') {
    voiceBytes += bytes;
  }
}

if (mainPackageBytes > config.audioBudget.hardMainPackageBytes) {
  console.error(`Main package audio hard budget exceeded: ${mainPackageBytes} bytes`);
  failed = true;
}

if (generatedP0Bytes > config.audioBudget.generatedP0TargetBytes) {
  console.error(`Generated P0 audio target exceeded: ${generatedP0Bytes} bytes`);
  failed = true;
}

if (voiceBytes > config.audioBudget.maxVoiceBytes) {
  console.error(`Voice audio budget exceeded: ${voiceBytes} bytes`);
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.info(
  `Validated audio assets: ${config.audioCues.length} cues, ${mainPackageBytes} main-package bytes, ${generatedP0Bytes} generated P0 bytes, ${voiceBytes} voice bytes`,
);
