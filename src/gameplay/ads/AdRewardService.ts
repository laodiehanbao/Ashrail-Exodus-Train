import { fail, ok, type Result } from '../../core/Result.types.js';
import type { RewardBundle } from '../../domain/reward/Reward.types.js';
import type { IAdService } from '../../platform/ads/IAdService.js';
import type { AdPlacementConfig } from '../../shared/ads/AdPlacement.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { AdLimitService } from './AdLimitService.js';

export interface AdRewardResult {
  status: string;
  reward: RewardBundle;
  multiplierApplied: number;
}

export class AdRewardService {
  private readonly placementsById: Map<string, AdPlacementConfig>;

  constructor(
    placements: AdPlacementConfig[],
    private readonly adService: IAdService,
    private readonly adLimitService: AdLimitService,
  ) {
    this.placementsById = new Map(placements.map((placement) => [placement.placementId, placement]));
  }

  async applyOptionalMultiplier(
    placementId: string,
    baseReward: RewardBundle,
    nowMs: number,
  ): Promise<Result<AdRewardResult>> {
    const placement = this.placementsById.get(placementId);
    if (!placement) {
      return fail(ErrorCode.AdUnavailable, `Unknown ad placement ${placementId}`);
    }

    const canShow = this.adLimitService.canShow(placement, nowMs);
    if (!canShow.ok) {
      return canShow;
    }

    const adResult = await this.adService.playRewardedAd({ placementId, requestedAtMs: nowMs });
    this.adLimitService.recordShown(placementId, adResult.completedAtMs);

    if (adResult.status === 'success') {
      return ok({
        status: adResult.status,
        multiplierApplied: placement.rewardMultiplier,
        reward: multiplyReward(baseReward, placement.rewardMultiplier),
      });
    }

    if (adResult.status === 'no_fill' || adResult.status === 'timeout') {
      return ok({
        status: adResult.status,
        multiplierApplied: 0,
        reward: {
          sourceId: `${baseReward.sourceId}_${placement.placementId}_fallback`,
          items: placement.fallbackReward.map((item) => ({ ...item })),
        },
      });
    }

    return ok({
      status: adResult.status,
      multiplierApplied: 1,
      reward: baseReward,
    });
  }
}

function multiplyReward(reward: RewardBundle, multiplier: number): RewardBundle {
  return {
    sourceId: `${reward.sourceId}_x${multiplier}`,
    items: reward.items.map((item) => ({
      ...item,
      amount: item.amount * multiplier,
    })),
  };
}
