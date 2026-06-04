import { loadConfigRegistry } from '../data/ConfigLoader.js';
import { readJsonConfig } from './readJsonConfig.js';

const result = loadConfigRegistry(readJsonConfig(process.cwd()));

if (!result.ok) {
  console.error(result.error.message, result.error.context);
  process.exit(1);
}

console.info(`Validated configs: ${result.value.lootBoxes.length} loot boxes, ${result.value.stageChapters.length} stages`);
