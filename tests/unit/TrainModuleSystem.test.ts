import { EventBus } from '../../src/core/EventBus.js';
import { InventoryModel } from '../../src/domain/inventory/InventoryModel.js';
import { TrainModel } from '../../src/domain/train/TrainModel.js';
import { TrainModuleRepository } from '../../src/gameplay/train/TrainModuleRepository.js';
import { TrainModuleSystem } from '../../src/gameplay/train/TrainModuleSystem.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testTrainModuleSystem(): Promise<void> {
  await runTest('TrainModuleSystem upgrades from configured fragment cost', () => {
    const configs = loadTestConfigs();
    const inventory = new InventoryModel({
      equipment: [],
      lootBoxes: {},
      moduleFragments: { module_cannon_basic_001: 5 },
    });
    const train = new TrainModel();
    const system = new TrainModuleSystem(
      train,
      inventory,
      new TrainModuleRepository(configs.trainModules),
      new EventBus(),
    );

    const result = system.upgrade('module_cannon_basic_001');
    assert(result.ok, 'upgrade should succeed');
    assertEqual(train.getLevel('module_cannon_basic_001'), 1, 'module should reach level 1');
    assertEqual(inventory.getModuleFragments('module_cannon_basic_001'), 0, 'fragments should be consumed');
  });
}
