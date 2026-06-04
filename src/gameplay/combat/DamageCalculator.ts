import type { StageEnemyConfig } from '../../domain/stage/Stage.types.js';
import type { TrainCombatModel } from './TrainCombatModel.js';

export interface DamageSummary {
  totalEnemyHp: number;
  trainDamageTaken: number;
  secondsToClear: number;
}

export class DamageCalculator {
  calculate(train: TrainCombatModel, enemies: StageEnemyConfig[]): DamageSummary {
    const totalEnemyHp = enemies.reduce((sum, enemy) => sum + enemy.hp * enemy.count, 0);
    const totalEnemyAttack = enemies.reduce((sum, enemy) => sum + enemy.attack * enemy.count, 0);
    const secondsToClear = Math.ceil(totalEnemyHp / train.dps);

    return {
      totalEnemyHp,
      trainDamageTaken: Math.max(0, totalEnemyAttack * secondsToClear),
      secondsToClear,
    };
  }
}
