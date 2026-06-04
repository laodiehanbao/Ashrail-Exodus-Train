import type { TrainModuleId } from '../../shared/ids.types.js';
import type { RewardItem } from '../reward/Reward.types.js';

export type TrainModuleSlot = 'roof_weapon' | 'engine_core' | 'cargo' | 'armor';

export interface TrainModuleLevelConfig {
  level: number;
  power: number;
  upgradeCost: RewardItem[];
}

export interface TrainModuleConfig {
  id: TrainModuleId;
  displayNameKey: string;
  slot: TrainModuleSlot;
  maxLevel: number;
  levels: TrainModuleLevelConfig[];
}

export interface InstalledTrainModule {
  moduleId: TrainModuleId;
  level: number;
}

export interface TrainSnapshot {
  installedModules: InstalledTrainModule[];
}
