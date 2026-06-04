import { loadConfigRegistry } from '../../src/data/ConfigLoader.js';
import type { GameConfigRegistry } from '../../src/data/ConfigRegistry.js';
import { readJsonConfig } from '../../src/tools/readJsonConfig.js';

export function loadTestConfigs(): GameConfigRegistry {
  const result = loadConfigRegistry(readJsonConfig(process.cwd()));
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
}
