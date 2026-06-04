import { loadConfigRegistry } from '../data/ConfigLoader.js';
import { createDefaultProgress } from '../gameplay/save/SaveVersionMigrator.js';
import { readJsonConfig } from '../tools/readJsonConfig.js';
import { GameApp } from './GameApp.js';

const configs = loadConfigRegistry(readJsonConfig(process.cwd()));
if (!configs.ok) {
  console.error(configs.error.message, configs.error.context);
  process.exit(1);
}

const app = new GameApp(configs.value, createDefaultProgress(), 20260604);
const snapshot = await app.runPrototypeLoop(Date.now());

console.info('Ashrail prototype loop complete');
console.info(JSON.stringify({
  stage: snapshot.progress.currentStageId,
  power: snapshot.power,
  coin: snapshot.progress.resources.coin ?? 0,
  lootBoxes: snapshot.progress.inventory.lootBoxes,
  moduleFragments: snapshot.progress.inventory.moduleFragments,
  train: snapshot.progress.train,
  settledRewards: snapshot.progress.settledRewardIds.length,
}, null, 2));
