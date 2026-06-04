import type {
  EquipmentId,
  LootBoxId,
  RewardId,
  SettlementId,
  TrainModuleId,
} from '../../shared/ids.types.js';
import type { RewardItemType } from '../../shared/GameEnums.js';

export interface RewardItem {
  type: RewardItemType;
  id: string;
  amount: number;
}

export interface RewardDefinition {
  id: RewardId;
  items: RewardItem[];
}

export interface RewardBundle {
  sourceId: string;
  items: RewardItem[];
}

export interface RewardGrantRequest {
  settlementId: SettlementId;
  reward: RewardBundle;
}

export interface GrantedRewardSummary {
  settlementId: SettlementId;
  reward: RewardBundle;
  duplicate: boolean;
}

export type RewardEntityId = EquipmentId | LootBoxId | TrainModuleId | string;
