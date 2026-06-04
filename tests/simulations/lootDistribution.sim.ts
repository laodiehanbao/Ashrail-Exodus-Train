import { Random } from '../../src/core/Random.js';
import { LootGenerator } from '../../src/gameplay/loot/LootGenerator.js';
import { loadTestConfigs } from '../unit/loadTestConfigs.js';

const configs = loadTestConfigs();
const generator = new LootGenerator(configs.lootBoxes, configs.lootPools);
const random = new Random(20260604);
const counts: Record<string, number> = {};
const runs = 1000;

for (let index = 0; index < runs; index += 1) {
  const roll = generator.roll('lootbox_supply_common', random);
  if (!roll.ok) {
    throw new Error(roll.error.message);
  }

  counts[roll.value.rewardId] = (counts[roll.value.rewardId] ?? 0) + 1;
}

console.table(Object.entries(counts).map(([rewardId, count]) => ({
  rewardId,
  count,
  percent: `${((count / runs) * 100).toFixed(1)}%`,
})));
