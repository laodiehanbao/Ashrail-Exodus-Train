import { fail, ok, type Result } from '../core/Result.types.js';
import type { GameConfigRegistry } from './ConfigRegistry.js';
import { validateAdPlacements } from './schemas/AdPlacement.schema.js';
import { validateEconomyCurve } from './schemas/EconomyCurve.schema.js';
import { validateLootBoxes, validateLootPools } from './schemas/LootBox.schema.js';
import { validateRewardDefinitions } from './schemas/Reward.schema.js';
import { validateStageChapters, validateStageWaves } from './schemas/Stage.schema.js';
import { validateTrainModules } from './schemas/TrainModule.schema.js';
import { validateEquipmentItems } from './schemas/Equipment.schema.js';
import { ErrorCode } from '../shared/ErrorCodes.js';
import { validateAudioConfigSources } from './schemas/Audio.schema.js';
import { validateUiConfigSources } from './schemas/Ui.schema.js';
import { validateUiNodeBindingConfig } from './schemas/UiNodeBinding.schema.js';
import type { RewardItem } from '../domain/reward/Reward.types.js';

export interface RawConfigSources {
  lootBoxes: unknown;
  lootPools: unknown;
  rewardDefinitions: unknown;
  equipmentItems: unknown;
  stageChapters: unknown;
  stageWaves: unknown;
  trainModules: unknown;
  adPlacements: unknown;
  economyCurve: unknown;
  audioCues: unknown;
  audioEvents: unknown;
  audioMixer: unknown;
  audioBudget: unknown;
  audioLicenses: unknown;
  audioVoiceLines: unknown;
  elevenLabsVoiceProfile: unknown;
  uiCopy: unknown;
  uiLayout: unknown;
  uiNodeBindings: unknown;
}

export function loadConfigRegistry(sources: RawConfigSources): Result<GameConfigRegistry> {
  const lootBoxes = validateLootBoxes(sources.lootBoxes);
  const lootPools = validateLootPools(sources.lootPools);
  const rewardDefinitions = validateRewardDefinitions(sources.rewardDefinitions);
  const equipmentItems = validateEquipmentItems(sources.equipmentItems);
  const stageChapters = validateStageChapters(sources.stageChapters);
  const stageWaves = validateStageWaves(sources.stageWaves);
  const trainModules = validateTrainModules(sources.trainModules);
  const adPlacements = validateAdPlacements(sources.adPlacements);
  const economyCurve = validateEconomyCurve(sources.economyCurve);
  const audioConfig = validateAudioConfigSources({
    audioCues: sources.audioCues,
    audioEvents: sources.audioEvents,
    audioMixer: sources.audioMixer,
    audioBudget: sources.audioBudget,
    audioLicenses: sources.audioLicenses,
    audioVoiceLines: sources.audioVoiceLines,
    elevenLabsVoiceProfile: sources.elevenLabsVoiceProfile,
  });
  const uiConfig = validateUiConfigSources({
    uiCopy: sources.uiCopy,
    uiLayout: sources.uiLayout,
  });
  const uiNodeBindings = uiConfig.ok
    ? validateUiNodeBindingConfig(sources.uiNodeBindings, uiConfig.value.uiLayout)
    : validateUiNodeBindingConfig(sources.uiNodeBindings);

  const validations = [
    lootBoxes,
    lootPools,
    rewardDefinitions,
    equipmentItems,
    stageChapters,
    stageWaves,
    trainModules,
    adPlacements,
    economyCurve,
    audioConfig,
    uiConfig,
    uiNodeBindings,
  ];
  const failed = validations.find((result) => !result.ok);
  if (failed && !failed.ok) {
    return failed;
  }

  const referenceCheck = validateReferences({
    lootBoxes: lootBoxes.ok ? lootBoxes.value : [],
    lootPools: lootPools.ok ? lootPools.value : [],
    rewardDefinitions: rewardDefinitions.ok ? rewardDefinitions.value : [],
    equipmentItems: equipmentItems.ok ? equipmentItems.value : [],
    stageChapters: stageChapters.ok ? stageChapters.value : [],
    stageWaves: stageWaves.ok ? stageWaves.value : [],
    trainModules: trainModules.ok ? trainModules.value : [],
    adPlacements: adPlacements.ok ? adPlacements.value : [],
    economyCurve: economyCurve.ok ? economyCurve.value : [],
    audioCues: audioConfig.ok ? audioConfig.value.audioCues : [],
    audioEvents: audioConfig.ok ? audioConfig.value.audioEvents : [],
    audioMixer: audioConfig.ok
      ? audioConfig.value.audioMixer
      : { buses: [], masterVolume: 0, maxTotalInstances: 0 },
    audioBudget: audioConfig.ok
      ? audioConfig.value.audioBudget
      : {
          targetMainPackageBytes: 0,
          hardMainPackageBytes: 0,
          generatedP0TargetBytes: 0,
          maxRuntimeSfxBytes: 0,
          maxRuntimeLoopBytes: 0,
          maxVariantsPerEvent: 0,
          maxVoiceCues: 0,
          maxVoiceBytes: 0,
          allowedRuntimeExtensions: [],
          allowRuntimeWav: false,
        },
    audioLicenses: audioConfig.ok ? audioConfig.value.audioLicenses : [],
    audioVoiceLines: audioConfig.ok ? audioConfig.value.audioVoiceLines : [],
    elevenLabsVoiceProfile: audioConfig.ok
      ? audioConfig.value.elevenLabsVoiceProfile
      : {
          profileId: '',
          displayName: '',
          primaryDirection: '',
          fallbackDirection: '',
          selectedVoice: {
            voiceId: '',
            name: '',
            category: '',
            selectionReason: '',
          },
          searchKeywords: [],
          rejectKeywords: [],
          auditionRules: [],
          modelId: '',
          languageCode: '',
          outputFormat: '',
          seed: 0,
          voiceSettings: {
            stability: 0,
            similarityBoost: 0,
            style: 0,
            useSpeakerBoost: false,
            speed: 0.7,
          },
          postProcess: {
            channels: 1,
            sampleRate: 8000,
            ffmpegFilter: '',
            codec: '',
            quality: 0,
          },
          },
    uiCopy: uiConfig.ok ? uiConfig.value.uiCopy : { locale: '', entries: [] },
    uiLayout: uiConfig.ok ? uiConfig.value.uiLayout : createEmptyUiLayout(),
    uiNodeBindings: uiNodeBindings.ok ? uiNodeBindings.value : createEmptyUiNodeBindings(),
  });
  if (!referenceCheck.ok) {
    return referenceCheck;
  }

  return ok(referenceCheck.value);
}

function createEmptyUiLayout(): GameConfigRegistry['uiLayout'] {
  return {
    layoutId: '',
    designWidth: 320,
    designHeight: 480,
    safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    colorTokens: [],
    componentSkins: [],
    screens: [],
  };
}

function createEmptyUiNodeBindings(): GameConfigRegistry['uiNodeBindings'] {
  return {
    bindingSetId: '',
    sceneId: '',
    layoutId: '',
    screens: [],
  };
}

function validateReferences(configs: GameConfigRegistry): Result<GameConfigRegistry> {
  const poolIds = new Set(configs.lootPools.map((pool) => pool.id));
  const rewardIds = new Set(configs.rewardDefinitions.map((reward) => reward.id));
  const waveIds = new Set(configs.stageWaves.map((wave) => wave.id));

  for (const lootBox of configs.lootBoxes) {
    if (!poolIds.has(lootBox.poolId)) {
      return fail(ErrorCode.ConfigMissingReference, `Loot box references unknown pool ${lootBox.poolId}`, lootBox);
    }
  }

  for (const pool of configs.lootPools) {
    for (const entry of pool.entries) {
      if (!rewardIds.has(entry.rewardId)) {
        return fail(ErrorCode.ConfigMissingReference, `Loot pool references unknown reward ${entry.rewardId}`, entry);
      }
    }
  }

  for (const stage of configs.stageChapters) {
    if (!waveIds.has(stage.waveId)) {
      return fail(ErrorCode.ConfigMissingReference, `Stage references unknown wave ${stage.waveId}`, stage);
    }

    if (!rewardIds.has(stage.clearRewardId)) {
      return fail(ErrorCode.ConfigMissingReference, `Stage references unknown reward ${stage.clearRewardId}`, stage);
    }
  }

  const uiCopyCheck = validateUiCopyReferences(configs);
  if (!uiCopyCheck.ok) return uiCopyCheck;

  return ok(configs);
}

const FIXED_P0_UI_COPY_KEYS = [
  'ui.screen.mainHud.title',
  'ui.screen.lootBox.title',
  'ui.screen.reward.title',
  'ui.screen.trainModule.title',
  'ui.screen.adReward.title',
  'ui.button.stage.start',
  'ui.button.lootbox.open',
  'ui.button.lootbox.locked',
  'ui.button.reward.claim',
  'ui.button.module.upgrade',
  'ui.button.module.locked',
  'ui.button.ad.double',
  'ui.button.ad.skip',
  'ui.button.ad.cooldown',
  'ui.label.power',
  'ui.label.coin',
  'ui.label.stage',
  'ui.status.stage.ready',
  'ui.status.ad.available',
  'ui.status.ad.unavailable',
  'ui.status.cost.insufficient',
  'ui.status.module.fragment.insufficient',
  'ui.status.module.max',
  'reward.module_fragment.name',
];

function validateUiCopyReferences(configs: GameConfigRegistry): Result<GameConfigRegistry> {
  const copyKeys = new Set(configs.uiCopy.entries.map((entry) => entry.key));
  const requiredKeys = new Set<string>(FIXED_P0_UI_COPY_KEYS);

  for (const lootBox of configs.lootBoxes) {
    requiredKeys.add(lootBox.displayNameKey);
    for (const cost of lootBox.openCost) {
      requiredKeys.add(`resource.${cost.resourceId}.name`);
    }
  }

  for (const equipment of configs.equipmentItems) {
    requiredKeys.add(equipment.displayNameKey);
  }

  for (const moduleConfig of configs.trainModules) {
    requiredKeys.add(moduleConfig.displayNameKey);
    for (const level of moduleConfig.levels) {
      collectRewardItemCopyKeys(level.upgradeCost, requiredKeys);
    }
  }

  for (const reward of configs.rewardDefinitions) {
    collectRewardItemCopyKeys(reward.items, requiredKeys);
  }

  for (const placement of configs.adPlacements) {
    collectRewardItemCopyKeys(placement.fallbackReward, requiredKeys);
  }

  for (const key of requiredKeys) {
    if (!copyKeys.has(key)) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI copy key ${key}`);
    }
  }

  return ok(configs);
}

function collectRewardItemCopyKeys(items: RewardItem[], keys: Set<string>): void {
  for (const item of items) {
    if (item.type === 'resource') {
      keys.add(`resource.${item.id}.name`);
    }
    if (item.type === 'module_fragment') {
      keys.add('reward.module_fragment.name');
    }
  }
}
