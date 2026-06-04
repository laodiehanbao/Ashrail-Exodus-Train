import { Random } from '../../src/core/Random.js';
import { LootGenerator } from '../../src/gameplay/loot/LootGenerator.js';
import { assert, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testLootGenerator(): Promise<void> {
  await runTest('LootGenerator uses configured weighted pool', () => {
    const configs = loadTestConfigs();
    const generator = new LootGenerator(configs.lootBoxes, configs.lootPools);
    const random = new Random(42);
    const counts: Record<string, number> = {};

    for (let index = 0; index < 1000; index += 1) {
      const roll = generator.roll('lootbox_supply_common', random);
      assert(roll.ok, 'roll should succeed');
      counts[roll.value.rewardId] = (counts[roll.value.rewardId] ?? 0) + 1;
    }

    assert((counts.reward_equipment_rifle_rusty_001 ?? 0) > 450, 'common equipment should dominate pool');
    assert((counts.reward_module_fragment_cannon_basic ?? 0) > 150, 'module fragments should appear');
    assert((counts.reward_coin_small ?? 0) > 100, 'coin reward should appear');
  });
}
