import type {
  EquipmentId,
  EquipmentInstanceId,
} from '../../shared/ids.types.js';
import type { EquipmentRarity } from '../../shared/GameEnums.js';

export type EquipmentSlot = 'weapon' | 'engine' | 'armor' | 'utility';

export interface EquipmentConfig {
  id: EquipmentId;
  displayNameKey: string;
  rarity: EquipmentRarity;
  slot: EquipmentSlot;
  power: number;
}

export interface EquipmentInstance {
  instanceId: EquipmentInstanceId;
  configId: EquipmentId;
  acquiredAtMs: number;
}
