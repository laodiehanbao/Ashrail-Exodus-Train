import { EventBus } from '../core/EventBus.js';
import { Random } from '../core/Random.js';
import { ConfigRegistry, type GameConfigRegistry } from '../data/ConfigRegistry.js';
import { InventoryModel } from '../domain/inventory/InventoryModel.js';
import type { PlayerProgressSnapshot } from '../domain/player/PlayerProgress.types.js';
import { ResourceWallet } from '../domain/player/ResourceWallet.js';
import { TrainModel } from '../domain/train/TrainModel.js';
import { MockAdService } from '../platform/ads/MockAdService.js';
import { AdLimitService } from '../gameplay/ads/AdLimitService.js';
import { AdRewardService } from '../gameplay/ads/AdRewardService.js';
import { CombatResolver } from '../gameplay/combat/CombatResolver.js';
import { TrainCombatModel } from '../gameplay/combat/TrainCombatModel.js';
import { LootBoxSystem } from '../gameplay/loot/LootBoxSystem.js';
import { LootGenerator } from '../gameplay/loot/LootGenerator.js';
import { RewardService } from '../gameplay/loot/RewardService.js';
import { StageProgressService } from '../gameplay/stage/StageProgressService.js';
import { WaveDirector } from '../gameplay/stage/WaveDirector.js';
import { TrainModuleRepository } from '../gameplay/train/TrainModuleRepository.js';
import { TrainModuleSystem } from '../gameplay/train/TrainModuleSystem.js';
import type { StageId } from '../shared/ids.types.js';

export interface GameAppSnapshot {
  progress: PlayerProgressSnapshot;
  power: number;
}

export class GameApp {
  readonly eventBus = new EventBus();
  readonly configs: ConfigRegistry;
  readonly wallet: ResourceWallet;
  readonly inventory: InventoryModel;
  readonly train: TrainModel;
  readonly rewardService: RewardService;
  readonly lootBoxSystem: LootBoxSystem;
  readonly stageProgressService: StageProgressService;
  readonly trainModuleSystem: TrainModuleSystem;
  readonly adRewardService: AdRewardService;

  constructor(
    configRegistry: GameConfigRegistry,
    private readonly progress: PlayerProgressSnapshot,
    seed = 1001,
  ) {
    this.configs = new ConfigRegistry(configRegistry);
    this.wallet = new ResourceWallet(progress.resources);
    this.inventory = new InventoryModel(progress.inventory);
    this.train = new TrainModel(progress.train);
    this.rewardService = new RewardService(
      this.configs.rewardDefinitions,
      this.wallet,
      this.inventory,
      this.eventBus,
      progress.settledRewardIds,
    );

    const random = new Random(seed);
    const lootGenerator = new LootGenerator(this.configs.lootBoxes, this.configs.lootPools);
    this.lootBoxSystem = new LootBoxSystem(
      this.configs.lootBoxes,
      this.wallet,
      this.inventory,
      lootGenerator,
      this.rewardService,
      random,
    );

    const adLimitService = new AdLimitService(progress.adRecords);
    this.adRewardService = new AdRewardService(this.configs.adPlacements, new MockAdService(), adLimitService);

    const waveDirector = new WaveDirector(this.configs.stageWaves);
    this.stageProgressService = new StageProgressService(
      this.configs.stageChapters,
      waveDirector,
      new CombatResolver(),
      this.rewardService,
      this.eventBus,
    );

    const trainModuleRepository = new TrainModuleRepository(this.configs.trainModules);
    this.trainModuleSystem = new TrainModuleSystem(
      this.train,
      this.inventory,
      trainModuleRepository,
      this.eventBus,
    );
  }

  createTrainCombatModel(): TrainCombatModel {
    const modulePower = this.train.getPower(this.configs.trainModules);
    const equipmentPower = this.inventory
      .getEquipment()
      .reduce((sum, equipment) => {
        const config = this.configs.equipmentItems.find((item) => item.id === equipment.configId);
        return sum + (config?.power ?? 0);
      }, 0);

    return new TrainCombatModel({
      power: 20 + modulePower + equipmentPower,
      maxHp: 360,
      armor: 5,
    });
  }

  async runPrototypeLoop(nowMs: number): Promise<GameAppSnapshot> {
    const stageResult = this.stageProgressService.runStage(
      this.progress.currentStageId,
      this.createTrainCombatModel(),
    );

    if (stageResult.ok && stageResult.value.reward) {
      const adReward = await this.adRewardService.applyOptionalMultiplier(
        'ad_reward_stage_clear_double',
        stageResult.value.reward,
        nowMs,
      );
      const reward = adReward.ok ? adReward.value.reward : stageResult.value.reward;
      this.stageProgressService.grantStageReward(
        stageResult.value.stage.id,
        reward,
        `stage_clear_${stageResult.value.stage.id}_${nowMs}`,
        nowMs,
      );
      this.progress.currentStageId = stageResult.value.nextStageId;
    }

    this.lootBoxSystem.open({
      lootBoxId: 'lootbox_supply_common',
      settlementId: `lootbox_supply_common_${nowMs}`,
      nowMs,
    });
    this.trainModuleSystem.upgrade('module_cannon_basic_001');

    return this.snapshot();
  }

  setCurrentStageId(stageId: StageId): void {
    this.progress.currentStageId = stageId;
  }

  snapshot(): GameAppSnapshot {
    this.progress.resources = this.wallet.toSnapshot();
    this.progress.inventory = this.inventory.toSnapshot();
    this.progress.train = this.train.toSnapshot();
    this.progress.settledRewardIds = this.rewardService.getSettledRewardIds();

    return {
      progress: JSON.parse(JSON.stringify(this.progress)) as PlayerProgressSnapshot,
      power: this.createTrainCombatModel().toStats().power,
    };
  }
}
