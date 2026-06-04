import type {
  EquipmentInstanceId,
  LootBoxId,
  TrainModuleId,
} from '../../shared/ids.types.js';
import type { EquipmentInstance } from '../equipment/Equipment.types.js';

export interface InventorySnapshot {
  equipment: EquipmentInstance[];
  lootBoxes: Record<LootBoxId, number>;
  moduleFragments: Record<TrainModuleId, number>;
}

export interface InventoryMutation {
  equipmentInstanceIds: EquipmentInstanceId[];
  lootBoxes: Record<LootBoxId, number>;
  moduleFragments: Record<TrainModuleId, number>;
}
