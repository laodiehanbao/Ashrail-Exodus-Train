import { ok, type Result } from '../../core/Result.types.js';
import type { AdPlacementConfig } from '../../shared/ads/AdPlacement.types.js';
import { asArray, asRecord, readArray, readNumber, readString, validationError } from './commonValidation.js';

export function validateAdPlacements(input: unknown): Result<AdPlacementConfig[]> {
  const array = asArray(input, 'AdPlacements');
  if (!array.ok) return array;

  const placements: AdPlacementConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'AdPlacement');
    if (!record.ok) return record;

    const placementId = readString(record.value, 'placementId');
    const triggerScene = readString(record.value, 'triggerScene');
    const rewardType = readString(record.value, 'rewardType');
    const rewardMultiplier = readNumber(record.value, 'rewardMultiplier', 1);
    const dailyLimit = readNumber(record.value, 'dailyLimit', 0);
    const cooldownSeconds = readNumber(record.value, 'cooldownSeconds', 0);
    const fallbackReward = readArray(record.value, 'fallbackReward');
    if (!placementId.ok || !triggerScene.ok || !rewardType.ok || !rewardMultiplier.ok || !dailyLimit.ok || !cooldownSeconds.ok || !fallbackReward.ok) {
      return validationError<AdPlacementConfig[]>(placementId, triggerScene, rewardType, rewardMultiplier, dailyLimit, cooldownSeconds, fallbackReward);
    }

    placements.push({
      placementId: placementId.value,
      triggerScene: triggerScene.value,
      rewardType: rewardType.value,
      rewardMultiplier: rewardMultiplier.value,
      dailyLimit: dailyLimit.value,
      cooldownSeconds: cooldownSeconds.value,
      fallbackReward: fallbackReward.value.map((reward) => {
        const rewardRecord = asRecord(reward, 'AdFallbackReward');
        if (!rewardRecord.ok) throw new Error(rewardRecord.error.message);
        const type = readString(rewardRecord.value, 'type');
        const id = readString(rewardRecord.value, 'id');
        const amount = readNumber(rewardRecord.value, 'amount', 1);
        if (!type.ok || !id.ok || !amount.ok) throw new Error('Invalid ad fallback reward');
        return { type: type.value as AdPlacementConfig['fallbackReward'][number]['type'], id: id.value, amount: amount.value };
      }),
    });
  }

  return ok(placements);
}
