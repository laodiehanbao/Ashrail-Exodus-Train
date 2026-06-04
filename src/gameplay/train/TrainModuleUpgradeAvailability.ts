import type { InventorySnapshot } from '../../domain/inventory/Inventory.types.js';
import type { TrainModuleConfig, TrainSnapshot } from '../../domain/train/Train.types.js';

export type TrainModuleUpgradeBlockReason = 'max_level' | 'insufficient_fragment';

export interface TrainModuleUpgradeAvailabilityState {
  moduleId: string;
  level: number;
  currentPower: number;
  nextPower: number;
  fragmentsOwned: number;
  fragmentsRequired: number;
  canUpgrade: boolean;
  blockReason?: TrainModuleUpgradeBlockReason;
}

export function createTrainModuleUpgradeAvailabilityState(
  train: TrainSnapshot,
  inventory: InventorySnapshot,
  moduleConfig: TrainModuleConfig,
): TrainModuleUpgradeAvailabilityState {
  const level = train.installedModules.find((item) => item.moduleId === moduleConfig.id)?.level ?? 0;
  const currentPower = moduleConfig.levels.find((item) => item.level === level)?.power ?? 0;
  const nextLevelConfig = moduleConfig.levels.find((item) => item.level === level + 1);
  const fragmentCost = nextLevelConfig?.upgradeCost.find((cost) => cost.type === 'module_fragment');
  const fragmentsOwned = inventory.moduleFragments[moduleConfig.id] ?? 0;
  const fragmentsRequired = fragmentCost?.amount ?? 0;
  const blockReason = getBlockReason(nextLevelConfig !== undefined, fragmentsOwned, fragmentsRequired);

  return {
    moduleId: moduleConfig.id,
    level,
    currentPower,
    nextPower: nextLevelConfig?.power ?? currentPower,
    fragmentsOwned,
    fragmentsRequired,
    canUpgrade: blockReason === undefined,
    blockReason,
  };
}

function getBlockReason(
  hasNextLevel: boolean,
  fragmentsOwned: number,
  fragmentsRequired: number,
): TrainModuleUpgradeBlockReason | undefined {
  if (!hasNextLevel) return 'max_level';
  return fragmentsOwned >= fragmentsRequired ? undefined : 'insufficient_fragment';
}
