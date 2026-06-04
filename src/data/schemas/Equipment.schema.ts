import { ok, type Result } from '../../core/Result.types.js';
import type { EquipmentConfig } from '../../domain/equipment/Equipment.types.js';
import { asArray, asRecord, readNumber, readString, validationError } from './commonValidation.js';

export function validateEquipmentItems(input: unknown): Result<EquipmentConfig[]> {
  const array = asArray(input, 'EquipmentItems');
  if (!array.ok) return array;

  const items: EquipmentConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'EquipmentItem');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const displayNameKey = readString(record.value, 'displayNameKey');
    const rarity = readString(record.value, 'rarity');
    const slot = readString(record.value, 'slot');
    const power = readNumber(record.value, 'power', 0);
    if (!id.ok || !displayNameKey.ok || !rarity.ok || !slot.ok || !power.ok) {
      return validationError<EquipmentConfig[]>(id, displayNameKey, rarity, slot, power);
    }

    items.push({
      id: id.value,
      displayNameKey: displayNameKey.value,
      rarity: rarity.value as EquipmentConfig['rarity'],
      slot: slot.value as EquipmentConfig['slot'],
      power: power.value,
    });
  }

  return ok(items);
}
