import type { StageWaveConfig } from '../../domain/stage/Stage.types.js';
import type { StageRunResult } from '../../shared/GameEnums.js';
import { DamageCalculator, type DamageSummary } from './DamageCalculator.js';
import type { TrainCombatModel } from './TrainCombatModel.js';

export interface CombatResolveResult {
  result: StageRunResult;
  durationSeconds: number;
  damage: DamageSummary;
}

export class CombatResolver {
  constructor(private readonly damageCalculator = new DamageCalculator()) {}

  resolve(train: TrainCombatModel, wave: StageWaveConfig): CombatResolveResult {
    const damage = this.damageCalculator.calculate(train, wave.enemies);
    const clearedInTime = damage.secondsToClear <= wave.durationSeconds;
    const survived = damage.trainDamageTaken < train.survivability;

    return {
      result: clearedInTime && survived ? 'victory' : 'defeat',
      durationSeconds: Math.min(wave.durationSeconds, damage.secondsToClear),
      damage,
    };
  }
}
