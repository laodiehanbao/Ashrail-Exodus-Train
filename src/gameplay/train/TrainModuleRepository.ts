import type { TrainModuleConfig } from '../../domain/train/Train.types.js';

export class TrainModuleRepository {
  private readonly modulesById: Map<string, TrainModuleConfig>;

  constructor(modules: TrainModuleConfig[]) {
    this.modulesById = new Map(modules.map((moduleConfig) => [moduleConfig.id, moduleConfig]));
  }

  get(moduleId: string): TrainModuleConfig | undefined {
    return this.modulesById.get(moduleId);
  }

  list(): TrainModuleConfig[] {
    return Array.from(this.modulesById.values());
  }
}
