import type { RewardBundle } from '../../domain/reward/Reward.types.js';

export class LootBoxAnimator {
  async playLootBoxAnimation(rewardPreview: RewardBundle): Promise<RewardBundle> {
    return rewardPreview;
  }
}
