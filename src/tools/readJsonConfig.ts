import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { RawConfigSources } from '../data/ConfigLoader.js';

export function readJsonConfig(rootDir: string): RawConfigSources {
  return {
    lootBoxes: readJson(rootDir, 'configs/loot/LootBoxes.json'),
    lootPools: readJson(rootDir, 'configs/loot/LootPools.json'),
    rewardDefinitions: readJson(rootDir, 'configs/loot/RewardDefinitions.json'),
    equipmentItems: readJson(rootDir, 'configs/loot/EquipmentItems.json'),
    stageChapters: readJson(rootDir, 'configs/stages/StageChapters.json'),
    stageWaves: readJson(rootDir, 'configs/stages/StageWaves.json'),
    trainModules: readJson(rootDir, 'configs/train/TrainModules.json'),
    adPlacements: readJson(rootDir, 'configs/ads/AdPlacements.json'),
    economyCurve: readJson(rootDir, 'configs/balance/EconomyCurve.json'),
    audioCues: readJson(rootDir, 'configs/audio/AudioCues.json'),
    audioEvents: readJson(rootDir, 'configs/audio/AudioEvents.json'),
    audioMixer: readJson(rootDir, 'configs/audio/AudioMixer.json'),
    audioBudget: readJson(rootDir, 'configs/audio/AudioBudget.json'),
    audioLicenses: readJson(rootDir, 'configs/audio/AudioLicense.manifest.json'),
    audioVoiceLines: readJson(rootDir, 'configs/audio/VoiceLines.json'),
    elevenLabsVoiceProfile: readJson(rootDir, 'configs/audio/ElevenLabsVoiceProfile.json'),
    uiCopy: readJson(rootDir, 'configs/ui/P0UiCopy.zh-CN.json'),
    uiLayout: readJson(rootDir, 'configs/ui/P0UiLayout.json'),
    uiNodeBindings: readJson(rootDir, 'configs/ui/P0UiNodeBindings.json'),
  };
}

function readJson(rootDir: string, relativePath: string): unknown {
  const path = resolve(rootDir, relativePath);
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}
