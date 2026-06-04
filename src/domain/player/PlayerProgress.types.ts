import type { InventorySnapshot } from '../inventory/Inventory.types.js';
import type { ResourceWalletSnapshot } from './ResourceWallet.js';
import type { StageId, ThemeId } from '../../shared/ids.types.js';
import type { TrainSnapshot } from '../train/Train.types.js';

export const CURRENT_SAVE_VERSION = 1;

export interface AdRecordSnapshot {
  dailyCounts: Record<string, number>;
  lastShownAtMs: Record<string, number>;
}

export interface PlayerProgressSnapshot {
  saveVersion: number;
  playerLevel: number;
  currentStageId: StageId;
  resources: ResourceWalletSnapshot;
  inventory: InventorySnapshot;
  train: TrainSnapshot;
  unlockedSystems: string[];
  adRecords: AdRecordSnapshot;
  offlineRewardTimestampMs: number;
  tutorialProgress: Record<string, boolean>;
  themeSkinId: ThemeId;
  settledRewardIds: string[];
}
