import { CombatResolver } from '../../src/gameplay/combat/CombatResolver.js';
import { TrainCombatModel } from '../../src/gameplay/combat/TrainCombatModel.js';
import { loadTestConfigs } from '../unit/loadTestConfigs.js';

const configs = loadTestConfigs();
const resolver = new CombatResolver();

for (const wave of configs.stageWaves) {
  const result = resolver.resolve(
    new TrainCombatModel({ power: 80, maxHp: 360, armor: 5 }),
    wave,
  );
  console.info(`${wave.stageId}: ${result.result}, clear=${result.damage.secondsToClear}s, damage=${result.damage.trainDamageTaken}`);
}
