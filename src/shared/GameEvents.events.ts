import type { RewardBundle } from '../domain/reward/Reward.types.js';
import type { StageId, TrainModuleId } from './ids.types.js';

export interface RewardGrantedEvent {
  type: 'reward_granted';
  settlementId: string;
  reward: RewardBundle;
}

export interface PowerChangedEvent {
  type: 'power_changed';
  previousPower: number;
  currentPower: number;
}

export interface LootBoxOpenedEvent {
  type: 'loot_box_opened';
  lootBoxId: string;
  reward: RewardBundle;
}

export interface StageClearedEvent {
  type: 'stage_cleared';
  stageId: StageId;
  reward: RewardBundle;
}

export interface TrainModuleUpgradedEvent {
  type: 'train_module_upgraded';
  moduleId: TrainModuleId;
  level: number;
}

export type GameEvent =
  | RewardGrantedEvent
  | PowerChangedEvent
  | LootBoxOpenedEvent
  | StageClearedEvent
  | TrainModuleUpgradedEvent;
