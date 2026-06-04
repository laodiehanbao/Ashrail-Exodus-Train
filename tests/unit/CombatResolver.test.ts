import { CombatResolver } from '../../src/gameplay/combat/CombatResolver.js';
import { TrainCombatModel } from '../../src/gameplay/combat/TrainCombatModel.js';
import { assertEqual, runTest } from './testHarness.js';

export async function testCombatResolver(): Promise<void> {
  await runTest('CombatResolver simulates 60 second auto combat', () => {
    const resolver = new CombatResolver();
    const train = new TrainCombatModel({ power: 80, maxHp: 300, armor: 4 });
    const result = resolver.resolve(train, {
      id: 'wave_test',
      stageId: 'stage_test',
      durationSeconds: 60,
      enemies: [{ enemyId: 'enemy_test', count: 3, hp: 80, attack: 5 }],
    });

    assertEqual(result.result, 'victory', 'train should clear first wave');
  });
}
