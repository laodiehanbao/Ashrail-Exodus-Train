import type { RewardItem } from '../../domain/reward/Reward.types.js';
import type { AdPlacementId } from '../ids.types.js';

export interface AdPlacementConfig {
  placementId: AdPlacementId;
  triggerScene: string;
  rewardType: string;
  rewardMultiplier: number;
  dailyLimit: number;
  cooldownSeconds: number;
  fallbackReward: RewardItem[];
}
