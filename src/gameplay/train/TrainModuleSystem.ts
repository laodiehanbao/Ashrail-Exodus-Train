import { EventBus } from '../../core/EventBus.js';
import { fail, ok, type Result } from '../../core/Result.types.js';
import type { InventoryModel } from '../../domain/inventory/InventoryModel.js';
import type { TrainModel } from '../../domain/train/TrainModel.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { TrainModuleRepository } from './TrainModuleRepository.js';

export interface TrainModuleUpgradeResult {
  moduleId: string;
  previousLevel: number;
  currentLevel: number;
}

export class TrainModuleSystem {
  constructor(
    private readonly train: TrainModel,
    private readonly inventory: InventoryModel,
    private readonly repository: TrainModuleRepository,
    private readonly eventBus: EventBus,
  ) {}

  upgrade(moduleId: string): Result<TrainModuleUpgradeResult> {
    const config = this.repository.get(moduleId);
    if (!config) {
      return fail(ErrorCode.UnknownTrainModule, `Unknown train module ${moduleId}`);
    }

    const previousLevel = this.train.getLevel(moduleId);
    const previousPower = this.train.getPower(this.repository.list());
    const nextLevel = previousLevel + 1;
    const nextLevelConfig = config.levels.find((level) => level.level === nextLevel);
    if (!nextLevelConfig) {
      return fail(ErrorCode.InsufficientItem, `No upgrade level available for ${moduleId}`);
    }

    for (const cost of nextLevelConfig.upgradeCost) {
      if (cost.type !== 'module_fragment') {
        return fail(ErrorCode.ConfigInvalid, `Unsupported train module cost type ${cost.type}`);
      }

      if (this.inventory.getModuleFragments(cost.id) < cost.amount) {
        return fail(ErrorCode.InsufficientItem, `Not enough fragments for ${moduleId}`);
      }
    }

    for (const cost of nextLevelConfig.upgradeCost) {
      this.inventory.consumeModuleFragments(cost.id, cost.amount);
    }

    this.train.setLevel(moduleId, nextLevel);
    const currentPower = this.train.getPower(this.repository.list());
    this.eventBus.emit({
      type: 'power_changed',
      previousPower,
      currentPower,
    });
    this.eventBus.emit({
      type: 'train_module_upgraded',
      moduleId,
      level: nextLevel,
    });

    return ok({
      moduleId,
      previousLevel,
      currentLevel: nextLevel,
    });
  }
}
