import type { Random } from '../../core/Random.js';
import { fail, ok, type Result } from '../../core/Result.types.js';
import type { InventoryModel } from '../../domain/inventory/InventoryModel.js';
import type { ResourceWallet } from '../../domain/player/ResourceWallet.js';
import type { GrantedRewardSummary } from '../../domain/reward/Reward.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { LootBoxConfig } from './LootBox.types.js';
import type { LootGenerator } from './LootGenerator.js';
import type { RewardService } from './RewardService.js';

export interface OpenLootBoxRequest {
  lootBoxId: string;
  settlementId: string;
  nowMs: number;
}

export interface OpenLootBoxResult {
  rewardId: string;
  granted: GrantedRewardSummary;
}

export class LootBoxSystem {
  private readonly lootBoxesById: Map<string, LootBoxConfig>;

  constructor(
    lootBoxes: LootBoxConfig[],
    private readonly wallet: ResourceWallet,
    private readonly inventory: InventoryModel,
    private readonly lootGenerator: LootGenerator,
    private readonly rewardService: RewardService,
    private readonly random: Random,
  ) {
    this.lootBoxesById = new Map(lootBoxes.map((lootBox) => [lootBox.id, lootBox]));
  }

  open(request: OpenLootBoxRequest): Result<OpenLootBoxResult> {
    const lootBox = this.lootBoxesById.get(request.lootBoxId);
    if (!lootBox) {
      return fail(ErrorCode.UnknownLootBox, `Unknown loot box ${request.lootBoxId}`);
    }

    if (this.inventory.getLootBoxCount(lootBox.id) < 1) {
      return fail(ErrorCode.InsufficientItem, `No loot box available: ${lootBox.id}`);
    }

    if (!this.wallet.canSpend(lootBox.openCost)) {
      return fail(ErrorCode.InsufficientResource, `Cannot afford loot box ${lootBox.id}`);
    }

    const roll = this.lootGenerator.roll(lootBox.id, this.random);
    if (!roll.ok) {
      return roll;
    }

    const rewardBundle = this.rewardService.createBundle(roll.value.rewardId);
    if (!rewardBundle.ok) {
      return rewardBundle;
    }

    this.inventory.consumeLootBox(lootBox.id, 1);
    this.wallet.spend(lootBox.openCost);

    const granted = this.rewardService.grant({
      settlementId: request.settlementId,
      reward: rewardBundle.value,
    }, request.nowMs);
    if (!granted.ok) {
      return granted;
    }

    return ok({
      rewardId: roll.value.rewardId,
      granted: granted.value,
    });
  }
}
