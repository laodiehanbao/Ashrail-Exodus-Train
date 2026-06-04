import { AdLimitService } from '../../src/gameplay/ads/AdLimitService.js';
import { AdRewardService } from '../../src/gameplay/ads/AdRewardService.js';
import { MockAdService } from '../../src/platform/ads/MockAdService.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testAdRewardService(): Promise<void> {
  await runTest('AdRewardService handles success cancellation failure no-fill timeout', async () => {
    const configs = loadTestConfigs();
    const statuses = ['success', 'cancelled', 'failed', 'no_fill', 'timeout'] as const;
    const service = new AdRewardService(
      configs.adPlacements,
      new MockAdService([...statuses]),
      new AdLimitService({ dailyCounts: {}, lastShownAtMs: {} }),
    );
    const baseReward = { sourceId: 'reward_coin_small', items: [{ type: 'resource' as const, id: 'coin', amount: 10 }] };

    const success = await service.applyOptionalMultiplier('ad_reward_stage_clear_double', baseReward, 100000);
    const cancelled = await service.applyOptionalMultiplier('ad_reward_stage_clear_double', baseReward, 200000);
    const failed = await service.applyOptionalMultiplier('ad_reward_stage_clear_double', baseReward, 300000);
    const noFill = await service.applyOptionalMultiplier('ad_reward_stage_clear_double', baseReward, 400000);
    const timeout = await service.applyOptionalMultiplier('ad_reward_stage_clear_double', baseReward, 500000);

    assert(success.ok && cancelled.ok && failed.ok && noFill.ok && timeout.ok, 'all ad statuses should return controlled results');
    if (!success.ok || !cancelled.ok || !failed.ok || !noFill.ok || !timeout.ok) return;
    assertEqual(success.value.reward.items[0].amount, 20, 'success should multiply reward');
    assertEqual(cancelled.value.reward.items[0].amount, 10, 'cancelled should keep base reward');
    assertEqual(failed.value.reward.items[0].amount, 10, 'failed should keep base reward');
    assertEqual(noFill.value.reward.items[0].amount, 20, 'no-fill should use fallback coin amount');
    assertEqual(timeout.value.reward.items[0].amount, 20, 'timeout should use fallback coin amount');
  });
}
