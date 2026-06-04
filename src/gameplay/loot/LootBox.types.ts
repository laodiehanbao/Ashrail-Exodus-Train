import type {
  AdPlacementId,
  LootBoxId,
  LootPoolId,
  RewardId,
} from '../../shared/ids.types.js';
import type { ResourceId } from '../../shared/ids.types.js';

export interface LootBoxOpenCost {
  resourceId: ResourceId;
  amount: number;
}

export interface LootBoxConfig {
  id: LootBoxId;
  displayNameKey: string;
  poolId: LootPoolId;
  openCost: LootBoxOpenCost[];
  adPlacementId?: AdPlacementId;
  guaranteedRules: unknown[];
}

export interface LootPoolEntryConfig {
  rewardId: RewardId;
  weight: number;
}

export interface LootPoolConfig {
  id: LootPoolId;
  entries: LootPoolEntryConfig[];
}

export interface LootRollResult {
  lootBoxId: LootBoxId;
  poolId: LootPoolId;
  rewardId: RewardId;
}
