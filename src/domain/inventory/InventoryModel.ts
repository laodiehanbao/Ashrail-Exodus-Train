import type {
  EquipmentId,
  LootBoxId,
  TrainModuleId,
} from '../../shared/ids.types.js';
import type { EquipmentInstance } from '../equipment/Equipment.types.js';
import type { InventorySnapshot } from './Inventory.types.js';

export class InventoryModel {
  private readonly equipment: EquipmentInstance[];
  private readonly lootBoxes: Record<LootBoxId, number>;
  private readonly moduleFragments: Record<TrainModuleId, number>;

  constructor(snapshot?: InventorySnapshot) {
    this.equipment = snapshot?.equipment.map((item) => ({ ...item })) ?? [];
    this.lootBoxes = { ...(snapshot?.lootBoxes ?? {}) };
    this.moduleFragments = { ...(snapshot?.moduleFragments ?? {}) };
  }

  addEquipment(configId: EquipmentId, acquiredAtMs: number): EquipmentInstance {
    const instance: EquipmentInstance = {
      instanceId: `equipment_instance_${configId}_${acquiredAtMs}_${this.equipment.length + 1}`,
      configId,
      acquiredAtMs,
    };
    this.equipment.push(instance);
    return instance;
  }

  addLootBox(id: LootBoxId, amount: number): void {
    this.lootBoxes[id] = this.getLootBoxCount(id) + amount;
  }

  consumeLootBox(id: LootBoxId, amount: number): boolean {
    const current = this.getLootBoxCount(id);
    if (current < amount) {
      return false;
    }

    this.lootBoxes[id] = current - amount;
    return true;
  }

  getLootBoxCount(id: LootBoxId): number {
    return this.lootBoxes[id] ?? 0;
  }

  addModuleFragments(id: TrainModuleId, amount: number): void {
    this.moduleFragments[id] = this.getModuleFragments(id) + amount;
  }

  consumeModuleFragments(id: TrainModuleId, amount: number): boolean {
    const current = this.getModuleFragments(id);
    if (current < amount) {
      return false;
    }

    this.moduleFragments[id] = current - amount;
    return true;
  }

  getModuleFragments(id: TrainModuleId): number {
    return this.moduleFragments[id] ?? 0;
  }

  getEquipment(): EquipmentInstance[] {
    return this.equipment.map((item) => ({ ...item }));
  }

  toSnapshot(): InventorySnapshot {
    return {
      equipment: this.getEquipment(),
      lootBoxes: { ...this.lootBoxes },
      moduleFragments: { ...this.moduleFragments },
    };
  }
}
