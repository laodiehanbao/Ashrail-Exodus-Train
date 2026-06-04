import type { TrainModuleConfig, TrainSnapshot } from './Train.types.js';
import type { TrainModuleId } from '../../shared/ids.types.js';

export class TrainModel {
  private readonly installedModules = new Map<TrainModuleId, number>();

  constructor(snapshot?: TrainSnapshot) {
    for (const moduleState of snapshot?.installedModules ?? []) {
      this.installedModules.set(moduleState.moduleId, moduleState.level);
    }
  }

  install(moduleId: TrainModuleId, level: number): void {
    this.installedModules.set(moduleId, level);
  }

  getLevel(moduleId: TrainModuleId): number {
    return this.installedModules.get(moduleId) ?? 0;
  }

  setLevel(moduleId: TrainModuleId, level: number): void {
    this.installedModules.set(moduleId, level);
  }

  getPower(configs: TrainModuleConfig[]): number {
    let totalPower = 0;
    for (const config of configs) {
      const currentLevel = this.getLevel(config.id);
      const levelConfig = config.levels.find((level) => level.level === currentLevel);
      totalPower += levelConfig?.power ?? 0;
    }

    return totalPower;
  }

  toSnapshot(): TrainSnapshot {
    return {
      installedModules: Array.from(this.installedModules.entries()).map(([moduleId, level]) => ({
        moduleId,
        level,
      })),
    };
  }
}
