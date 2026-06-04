import { loadConfigRegistry } from '../data/ConfigLoader.js';
import type { RawConfigSources } from '../data/ConfigLoader.js';
import type { PlayerProgressSnapshot } from '../domain/player/PlayerProgress.types.js';
import { GameApp } from './GameApp.js';

export function createGameAppFromRawConfigs(
  sources: RawConfigSources,
  progress: PlayerProgressSnapshot,
  seed?: number,
): GameApp {
  const configs = loadConfigRegistry(sources);
  if (!configs.ok) {
    throw new Error(configs.error.message);
  }

  return new GameApp(configs.value, progress, seed);
}
