import { ok, type Result } from '../../core/Result.types.js';
import type { TrainModuleConfig } from '../../domain/train/Train.types.js';
import { asArray, asRecord, readArray, readNumber, readString, validationError } from './commonValidation.js';

export function validateTrainModules(input: unknown): Result<TrainModuleConfig[]> {
  const array = asArray(input, 'TrainModules');
  if (!array.ok) return array;

  const modules: TrainModuleConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'TrainModule');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const displayNameKey = readString(record.value, 'displayNameKey');
    const slot = readString(record.value, 'slot');
    const maxLevel = readNumber(record.value, 'maxLevel', 1);
    const levels = readArray(record.value, 'levels');
    if (!id.ok || !displayNameKey.ok || !slot.ok || !maxLevel.ok || !levels.ok) {
      return validationError<TrainModuleConfig[]>(id, displayNameKey, slot, maxLevel, levels);
    }

    modules.push({
      id: id.value,
      displayNameKey: displayNameKey.value,
      slot: slot.value as TrainModuleConfig['slot'],
      maxLevel: maxLevel.value,
      levels: levels.value.map((level) => {
        const levelRecord = asRecord(level, 'TrainModuleLevel');
        if (!levelRecord.ok) {
          throw new Error(levelRecord.error.message);
        }

        const levelNumber = readNumber(levelRecord.value, 'level', 1);
        const power = readNumber(levelRecord.value, 'power', 0);
        const upgradeCost = readArray(levelRecord.value, 'upgradeCost');
        if (!levelNumber.ok || !power.ok || !upgradeCost.ok) {
          throw new Error('Invalid train module level');
        }

        return {
          level: levelNumber.value,
          power: power.value,
          upgradeCost: upgradeCost.value.map((cost) => {
            const costRecord = asRecord(cost, 'TrainModuleUpgradeCost');
            if (!costRecord.ok) throw new Error(costRecord.error.message);
            const type = readString(costRecord.value, 'type');
            const costId = readString(costRecord.value, 'id');
            const amount = readNumber(costRecord.value, 'amount', 1);
            if (!type.ok || !costId.ok || !amount.ok) throw new Error('Invalid module upgrade cost');
            return { type: type.value as TrainModuleConfig['levels'][number]['upgradeCost'][number]['type'], id: costId.value, amount: amount.value };
          }),
        };
      }),
    });
  }

  return ok(modules);
}
