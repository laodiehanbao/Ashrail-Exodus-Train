import { ok, type Result } from '../../core/Result.types.js';
import type { StageChapterConfig, StageWaveConfig } from '../../domain/stage/Stage.types.js';
import { asArray, asRecord, readArray, readNumber, readString, validationError } from './commonValidation.js';

export function validateStageChapters(input: unknown): Result<StageChapterConfig[]> {
  const array = asArray(input, 'StageChapters');
  if (!array.ok) return array;

  const stages: StageChapterConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'StageChapter');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const chapter = readNumber(record.value, 'chapter', 1);
    const order = readNumber(record.value, 'order', 1);
    const displayNameKey = readString(record.value, 'displayNameKey');
    const waveId = readString(record.value, 'waveId');
    const clearRewardId = readString(record.value, 'clearRewardId');
    const requiredPower = readNumber(record.value, 'requiredPower', 0);
    if (!id.ok || !chapter.ok || !order.ok || !displayNameKey.ok || !waveId.ok || !clearRewardId.ok || !requiredPower.ok) {
      return validationError<StageChapterConfig[]>(id, chapter, order, displayNameKey, waveId, clearRewardId, requiredPower);
    }

    stages.push({
      id: id.value,
      chapter: chapter.value,
      order: order.value,
      displayNameKey: displayNameKey.value,
      waveId: waveId.value,
      clearRewardId: clearRewardId.value,
      requiredPower: requiredPower.value,
    });
  }

  return ok(stages);
}

export function validateStageWaves(input: unknown): Result<StageWaveConfig[]> {
  const array = asArray(input, 'StageWaves');
  if (!array.ok) return array;

  const waves: StageWaveConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'StageWave');
    if (!record.ok) return record;

    const id = readString(record.value, 'id');
    const stageId = readString(record.value, 'stageId');
    const durationSeconds = readNumber(record.value, 'durationSeconds', 1);
    const enemies = readArray(record.value, 'enemies');
    if (!id.ok || !stageId.ok || !durationSeconds.ok || !enemies.ok) {
      return validationError<StageWaveConfig[]>(id, stageId, durationSeconds, enemies);
    }

    waves.push({
      id: id.value,
      stageId: stageId.value,
      durationSeconds: durationSeconds.value,
      enemies: enemies.value.map((enemy) => {
        const enemyRecord = asRecord(enemy, 'StageEnemy');
        if (!enemyRecord.ok) {
          throw new Error(enemyRecord.error.message);
        }

        const enemyId = readString(enemyRecord.value, 'enemyId');
        const count = readNumber(enemyRecord.value, 'count', 1);
        const hp = readNumber(enemyRecord.value, 'hp', 1);
        const attack = readNumber(enemyRecord.value, 'attack', 0);
        if (!enemyId.ok || !count.ok || !hp.ok || !attack.ok) {
          throw new Error('Invalid stage enemy');
        }

        return { enemyId: enemyId.value, count: count.value, hp: hp.value, attack: attack.value };
      }),
    });
  }

  return ok(waves);
}
