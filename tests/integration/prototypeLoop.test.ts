import { GameApp } from '../../src/app/GameApp.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import { assert, runTest } from '../unit/testHarness.js';
import { loadTestConfigs } from '../unit/loadTestConfigs.js';

export async function testPrototypeLoop(): Promise<void> {
  await runTest('Prototype loop runs combat loot upgrade and saveable snapshot', async () => {
    const app = new GameApp(loadTestConfigs(), createDefaultProgress(), 7);
    const snapshot = await app.runPrototypeLoop(100000);

    assert(snapshot.progress.resources.coin >= 0, 'coin should remain valid');
    assert(snapshot.progress.settledRewardIds.length >= 1, 'at least one reward should settle');
    assert(snapshot.power > 20, 'train power should increase after module upgrade or equipment');
    assert(snapshot.progress.train.installedModules.length >= 1, 'train module state should save');
  });
}
