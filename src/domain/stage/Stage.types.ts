import type { RewardId, StageId, StageWaveId } from '../../shared/ids.types.js';

export interface StageChapterConfig {
  id: StageId;
  chapter: number;
  order: number;
  displayNameKey: string;
  waveId: StageWaveId;
  clearRewardId: RewardId;
  requiredPower: number;
}

export interface StageEnemyConfig {
  enemyId: string;
  count: number;
  hp: number;
  attack: number;
}

export interface StageWaveConfig {
  id: StageWaveId;
  stageId: StageId;
  durationSeconds: number;
  enemies: StageEnemyConfig[];
}
