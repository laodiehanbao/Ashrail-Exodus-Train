import { loadConfigRegistry } from '../data/ConfigLoader.js';
import { readJsonConfig } from './readJsonConfig.js';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const result = loadConfigRegistry(readJsonConfig(process.cwd()));

if (!result.ok) {
  console.error(result.error.message, result.error.context);
  process.exit(1);
}

for (const asset of result.value.uiVisualAssets.assets) {
  const assetPath = resolve(process.cwd(), asset.assetPath);
  if (!existsSync(assetPath)) {
    console.error(`Missing UI visual asset file: ${asset.assetPath}`);
    process.exit(1);
  }
  const bytes = statSync(assetPath).size;
  if (bytes > asset.targetMaxBytes) {
    console.error(`UI visual asset exceeds target bytes: ${asset.assetId} ${bytes}/${asset.targetMaxBytes}`);
    process.exit(1);
  }
}

console.info(`Validated configs: ${result.value.lootBoxes.length} loot boxes, ${result.value.stageChapters.length} stages`);
