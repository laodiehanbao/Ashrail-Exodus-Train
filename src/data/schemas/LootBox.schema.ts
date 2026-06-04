import { fail, ok, type Result } from '../../core/Result.types.js';
import type { LootBoxConfig, LootPoolConfig } from '../../gameplay/loot/LootBox.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import { asArray, asRecord, readArray, readNumber, readString, validationError } from './commonValidation.js';

export function validateLootBoxes(input: unknown): Result<LootBoxConfig[]> {
  const array = asArray(input, 'LootBoxes');
  if (!array.ok) return array;

  const configs: LootBoxConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'LootBox');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const displayNameKey = readString(record.value, 'displayNameKey');
    const poolId = readString(record.value, 'poolId');
    const openCost = readArray(record.value, 'openCost');
    if (!id.ok || !displayNameKey.ok || !poolId.ok || !openCost.ok) {
      return validationError<LootBoxConfig[]>(id, displayNameKey, poolId, openCost);
    }

    configs.push({
      id: id.value,
      displayNameKey: displayNameKey.value,
      poolId: poolId.value,
      openCost: openCost.value.map((cost) => {
        const costRecord = asRecord(cost, 'openCost');
        if (!costRecord.ok) {
          throw new Error(costRecord.error.message);
        }

        const resourceId = readString(costRecord.value, 'resourceId');
        const amount = readNumber(costRecord.value, 'amount', 1);
        if (!resourceId.ok || !amount.ok) {
          throw new Error('Invalid loot box open cost');
        }

        return { resourceId: resourceId.value, amount: amount.value };
      }),
      adPlacementId: typeof record.value.adPlacementId === 'string' ? record.value.adPlacementId : undefined,
      guaranteedRules: [],
    });
  }

  return ok(configs);
}

export function validateLootPools(input: unknown): Result<LootPoolConfig[]> {
  const array = asArray(input, 'LootPools');
  if (!array.ok) return array;

  const configs: LootPoolConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'LootPool');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const entries = readArray(record.value, 'entries');
    if (!id.ok || !entries.ok) {
      return validationError<LootPoolConfig[]>(id, entries);
    }

    configs.push({
      id: id.value,
      entries: entries.value.map((entry) => {
        const entryRecord = asRecord(entry, 'lootPoolEntry');
        if (!entryRecord.ok) {
          throw new Error(entryRecord.error.message);
        }

        const rewardId = readString(entryRecord.value, 'rewardId');
        const weight = readNumber(entryRecord.value, 'weight', 0.0001);
        if (!rewardId.ok || !weight.ok) {
          throw new Error('Invalid loot pool entry');
        }

        return { rewardId: rewardId.value, weight: weight.value };
      }),
    });
  }

  return ok(configs);
}
