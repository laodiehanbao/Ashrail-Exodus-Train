import { EventBus } from '../../core/EventBus.js';
import { fail, ok, type Result } from '../../core/Result.types.js';
import type { InventoryModel } from '../../domain/inventory/InventoryModel.js';
import type { ResourceWallet } from '../../domain/player/ResourceWallet.js';
import type {
  GrantedRewardSummary,
  RewardBundle,
  RewardDefinition,
  RewardGrantRequest,
} from '../../domain/reward/Reward.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';

export class RewardService {
  private readonly rewardsById: Map<string, RewardDefinition>;
  private readonly settledRewardIds: Set<string>;

  constructor(
    rewardDefinitions: RewardDefinition[],
    private readonly wallet: ResourceWallet,
    private readonly inventory: InventoryModel,
    private readonly eventBus: EventBus,
    settledRewardIds: string[] = [],
  ) {
    this.rewardsById = new Map(rewardDefinitions.map((reward) => [reward.id, reward]));
    this.settledRewardIds = new Set(settledRewardIds);
  }

  createBundle(rewardId: string): Result<RewardBundle> {
    const reward = this.rewardsById.get(rewardId);
    if (!reward) {
      return fail(ErrorCode.UnknownReward, `Unknown reward ${rewardId}`);
    }

    return ok({
      sourceId: reward.id,
      items: reward.items.map((item) => ({ ...item })),
    });
  }

  grant(request: RewardGrantRequest, nowMs: number): Result<GrantedRewardSummary> {
    if (this.settledRewardIds.has(request.settlementId)) {
      return ok({
        settlementId: request.settlementId,
        reward: request.reward,
        duplicate: true,
      });
    }

    for (const item of request.reward.items) {
      if (item.type === 'resource') {
        this.wallet.add(item.id, item.amount);
      } else if (item.type === 'equipment') {
        for (let i = 0; i < item.amount; i += 1) {
          this.inventory.addEquipment(item.id, nowMs + i);
        }
      } else if (item.type === 'module_fragment') {
        this.inventory.addModuleFragments(item.id, item.amount);
      } else if (item.type === 'loot_box') {
        this.inventory.addLootBox(item.id, item.amount);
      }
    }

    this.settledRewardIds.add(request.settlementId);
    this.eventBus.emit({
      type: 'reward_granted',
      settlementId: request.settlementId,
      reward: request.reward,
    });

    return ok({
      settlementId: request.settlementId,
      reward: request.reward,
      duplicate: false,
    });
  }

  getSettledRewardIds(): string[] {
    return Array.from(this.settledRewardIds);
  }
}
