import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { loadConfigRegistry } from '../data/ConfigLoader.js';
import { readJsonConfig } from './readJsonConfig.js';

const rootDir = process.cwd();
const apiKey = process.env.ELEVENLABS_API_KEY;
const tempDir = resolve(rootDir, '.tmp/elevenlabs-voice');
const configResult = loadConfigRegistry(readJsonConfig(rootDir));

if (!configResult.ok) {
  console.error(configResult.error.message, configResult.error.context);
  process.exit(1);
}

const config = configResult.value;
const profile = config.elevenLabsVoiceProfile;
const voiceId = process.env.ELEVENLABS_VOICE_ID ?? profile.selectedVoice.voiceId;
const modelId = process.env.ELEVENLABS_MODEL_ID ?? profile.modelId;

if (!apiKey) {
  console.info('Skipped ElevenLabs voice generation: ELEVENLABS_API_KEY is missing.');
  process.exit(0);
}

for (const line of config.audioVoiceLines) {
  const mp3Path = resolve(tempDir, `${line.voiceCueId}.mp3`);
  const outputPath = resolve(rootDir, `assets/audio/voice/${line.voiceCueId}.ogg`);
  mkdirSync(dirname(mp3Path), { recursive: true });
  mkdirSync(dirname(outputPath), { recursive: true });

  const body = JSON.stringify({
    text: line.text,
    model_id: modelId,
    language_code: profile.languageCode,
    voice_settings: {
      stability: profile.voiceSettings.stability,
      similarity_boost: profile.voiceSettings.similarityBoost,
      style: profile.voiceSettings.style,
      use_speaker_boost: profile.voiceSettings.useSpeakerBoost,
      speed: profile.voiceSettings.speed,
    },
    seed: profile.seed,
    apply_text_normalization: 'auto',
  });

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${profile.outputFormat}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs generation failed for ${line.voiceCueId}: ${response.status} ${response.statusText}`);
  }

  writeFileSync(mp3Path, Buffer.from(await response.arrayBuffer()));

  execFileSync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    mp3Path,
    '-ac',
    String(profile.postProcess.channels),
    '-ar',
    String(profile.postProcess.sampleRate),
    '-af',
    profile.postProcess.ffmpegFilter,
    '-c:a',
    profile.postProcess.codec,
    '-q:a',
    String(profile.postProcess.quality),
    outputPath,
  ]);

  if (existsSync(outputPath)) {
    console.info(`Generated ${outputPath.replace(rootDir, '').replace(/^[/\\]/, '')}`);
  }
}

rmSync(tempDir, { recursive: true, force: true });
