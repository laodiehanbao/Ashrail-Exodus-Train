import { CURRENT_SAVE_VERSION } from '../../src/domain/player/PlayerProgress.types.js';
import { SaveVersionMigrator } from '../../src/gameplay/save/SaveVersionMigrator.js';
import { assert, assertEqual, runTest } from './testHarness.js';

export async function testSaveVersionMigrator(): Promise<void> {
  await runTest('SaveVersionMigrator creates current safe snapshot', () => {
    const migrator = new SaveVersionMigrator();
    const result = migrator.migrate({ resources: { coin: 999 } });
    assert(result.ok, 'migration should succeed');
    assertEqual(result.value.saveVersion, CURRENT_SAVE_VERSION, 'save version should update');
    assertEqual(result.value.resources.coin, 999, 'existing resources should survive migration');
    assert(result.value.inventory.lootBoxes.lootbox_supply_common >= 1, 'default loot box should exist');
  });
}
