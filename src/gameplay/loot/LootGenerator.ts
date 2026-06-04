import type { Random } from '../../core/Random.js';
import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { LootBoxConfig, LootPoolConfig, LootRollResult } from './LootBox.types.js';

export class LootGenerator {
  private readonly lootBoxesById: Map<string, LootBoxConfig>;
  private readonly poolsById: Map<string, LootPoolConfig>;

  constructor(lootBoxes: LootBoxConfig[], lootPools: LootPoolConfig[]) {
    this.lootBoxesById = new Map(lootBoxes.map((lootBox) => [lootBox.id, lootBox]));
    this.poolsById = new Map(lootPools.map((pool) => [pool.id, pool]));
  }

  roll(lootBoxId: string, random: Random): Result<LootRollResult> {
    const lootBox = this.lootBoxesById.get(lootBoxId);
    if (!lootBox) {
      return fail(ErrorCode.UnknownLootBox, `Unknown loot box ${lootBoxId}`);
    }

    const pool = this.poolsById.get(lootBox.poolId);
    if (!pool) {
      return fail(ErrorCode.ConfigMissingReference, `Unknown loot pool ${lootBox.poolId}`);
    }

    const rewardId = random.pickWeighted(pool.entries.map((entry) => ({
      value: entry.rewardId,
      weight: entry.weight,
    })));

    return ok({
      lootBoxId: lootBox.id,
      poolId: pool.id,
      rewardId,
    });
  }
}
