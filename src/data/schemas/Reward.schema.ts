import { ok, type Result } from '../../core/Result.types.js';
import type { RewardDefinition } from '../../domain/reward/Reward.types.js';
import { asArray, asRecord, readArray, readNumber, readString, validationError } from './commonValidation.js';

export function validateRewardDefinitions(input: unknown): Result<RewardDefinition[]> {
  const array = asArray(input, 'RewardDefinitions');
  if (!array.ok) return array;

  const rewards: RewardDefinition[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'RewardDefinition');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const items = readArray(record.value, 'items');
    if (!id.ok || !items.ok) return validationError<RewardDefinition[]>(id, items);

    rewards.push({
      id: id.value,
      items: items.value.map((rewardItem) => {
        const rewardRecord = asRecord(rewardItem, 'RewardItem');
        if (!rewardRecord.ok) {
          throw new Error(rewardRecord.error.message);
        }

        const type = readString(rewardRecord.value, 'type');
        const itemId = readString(rewardRecord.value, 'id');
        const amount = readNumber(rewardRecord.value, 'amount', 1);
        if (!type.ok || !itemId.ok || !amount.ok) {
          throw new Error('Invalid reward item');
        }

        return { type: type.value as RewardDefinition['items'][number]['type'], id: itemId.value, amount: amount.value };
      }),
    });
  }

  return ok(rewards);
}
