import { EventBus } from '../../src/core/EventBus.js';
import { InventoryModel } from '../../src/domain/inventory/InventoryModel.js';
import { ResourceWallet } from '../../src/domain/player/ResourceWallet.js';
import { RewardService } from '../../src/gameplay/loot/RewardService.js';
import { assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testRewardService(): Promise<void> {
  await runTest('RewardService grants idempotent rewards', () => {
    const configs = loadTestConfigs();
    const wallet = new ResourceWallet();
    const inventory = new InventoryModel();
    const service = new RewardService(configs.rewardDefinitions, wallet, inventory, new EventBus());
    const bundle = service.createBundle('reward_coin_small');
    if (!bundle.ok) throw new Error(bundle.error.message);

    const first = service.grant({ settlementId: 'settlement_test', reward: bundle.value }, 100);
    const second = service.grant({ settlementId: 'settlement_test', reward: bundle.value }, 100);
    if (!first.ok || !second.ok) throw new Error('grant should succeed');

    assertEqual(wallet.get('coin'), 80, 'coin should be granted once');
    assertEqual(second.value.duplicate, true, 'duplicate settlement should be reported');
  });
}
