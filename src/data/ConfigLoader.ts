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
import {
  P0_COMBAT_TRAIN_PART_IDS,
  P0_DEFAULT_AD_PLACEMENT_ID,
  P0_DEFAULT_LOOT_BOX_ID,
  P0_UI_SCREEN_IDS,
} from '../shared/ui/P0Ui.types.js';

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
  uiVisualAssets: unknown;
  uiVisualBindings: unknown;
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
    uiVisualAssets: sources.uiVisualAssets,
    uiVisualBindings: sources.uiVisualBindings,
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
    uiVisualAssets: uiConfig.ok ? uiConfig.value.uiVisualAssets : createEmptyUiVisualAssets(),
    uiVisualBindings: uiConfig.ok ? uiConfig.value.uiVisualBindings : createEmptyUiVisualBindings(),
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

function createEmptyUiVisualAssets(): GameConfigRegistry['uiVisualAssets'] {
  return {
    assetSetId: '',
    assets: [],
  };
}

function createEmptyUiVisualBindings(): GameConfigRegistry['uiVisualBindings'] {
  return {
    bindingSetId: '',
    entries: [],
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
  const defaultP0Check = validateDefaultP0References(configs);
  if (!defaultP0Check.ok) return defaultP0Check;
  const uiVisualAssetCheck = validateUiVisualAssetReferences(configs);
  if (!uiVisualAssetCheck.ok) return uiVisualAssetCheck;
  const uiVisualBindingCheck = validateUiVisualBindingReferences(configs);
  if (!uiVisualBindingCheck.ok) return uiVisualBindingCheck;

  return ok(configs);
}

function validateDefaultP0References(configs: GameConfigRegistry): Result<GameConfigRegistry> {
  if (!configs.lootBoxes.some((lootBox) => lootBox.id === P0_DEFAULT_LOOT_BOX_ID)) {
    return fail(ErrorCode.ConfigMissingReference, `Missing default P0 loot box ${P0_DEFAULT_LOOT_BOX_ID}`);
  }
  if (!configs.adPlacements.some((placement) => placement.placementId === P0_DEFAULT_AD_PLACEMENT_ID)) {
    return fail(ErrorCode.ConfigMissingReference, `Missing default P0 ad placement ${P0_DEFAULT_AD_PLACEMENT_ID}`);
  }

  const layoutScreenIds = new Set(configs.uiLayout.screens.map((screen) => screen.screenId));
  for (const screenId of P0_UI_SCREEN_IDS) {
    if (!layoutScreenIds.has(screenId)) {
      return fail(ErrorCode.ConfigMissingReference, `Missing default P0 UI layout screen ${screenId}`);
    }
  }

  return ok(configs);
}

function validateUiVisualAssetReferences(configs: GameConfigRegistry): Result<GameConfigRegistry> {
  const spriteFramesById = new Map(
    configs.uiVisualAssets.assets
      .filter((asset) => asset.kind === 'spriteFrame')
      .map((asset) => [asset.assetId, asset]),
  );

  for (const screen of configs.uiLayout.screens) {
    const asset = spriteFramesById.get(screen.backgroundAssetId);
    if (!asset) {
      return fail(ErrorCode.ConfigMissingReference, `UI screen ${screen.screenId} references unknown background asset ${screen.backgroundAssetId}`, screen);
    }
    if (asset.usage !== 'screen_background') {
      return fail(ErrorCode.ConfigInvalid, `UI screen ${screen.screenId} background must reference a screen_background asset`, screen);
    }
  }

  for (const skin of configs.uiLayout.componentSkins) {
    const asset = spriteFramesById.get(skin.assetId);
    if (!asset) {
      return fail(ErrorCode.ConfigMissingReference, `UI component skin ${skin.componentId} references unknown visual asset ${skin.assetId}`, skin);
    }
    if (asset.usage !== 'ui_skin') {
      return fail(ErrorCode.ConfigInvalid, `UI component skin ${skin.componentId} must reference a ui_skin asset`, skin);
    }
  }

  return ok(configs);
}

function validateUiVisualBindingReferences(configs: GameConfigRegistry): Result<GameConfigRegistry> {
  const assetsById = new Map(configs.uiVisualAssets.assets.map((asset) => [asset.assetId, asset]));
  const lootBoxIds = new Set(configs.lootBoxes.map((lootBox) => lootBox.id));
  const equipmentIds = new Set(configs.equipmentItems.map((equipment) => equipment.id));
  const trainModuleIds = new Set(configs.trainModules.map((moduleConfig) => moduleConfig.id));
  const trainPartIds = new Set<string>(P0_COMBAT_TRAIN_PART_IDS);
  const enemyIds = collectKnownEnemyIds(configs);
  const resourceIds = collectKnownResourceIds(configs);
  const bindingKeys = new Set(configs.uiVisualBindings.entries.map((entry) => visualBindingKey(entry.domainType, entry.domainId)));

  for (const entry of configs.uiVisualBindings.entries) {
    const asset = assetsById.get(entry.assetId);
    if (!asset) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown visual asset ${entry.assetId}`, entry);
    }

    const expectedUsage = expectedVisualBindingAssetUsage(entry.domainType);
    if (asset.usage !== expectedUsage) {
      return fail(
        ErrorCode.ConfigInvalid,
        `UI visual binding ${entry.bindingId} must reference a ${expectedUsage} asset`,
        entry,
      );
    }

    if (entry.domainType === 'resource' && !resourceIds.has(entry.domainId)) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown resource ${entry.domainId}`, entry);
    }
    if (entry.domainType === 'loot_box' && !lootBoxIds.has(entry.domainId)) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown loot box ${entry.domainId}`, entry);
    }
    if (entry.domainType === 'equipment' && !equipmentIds.has(entry.domainId)) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown equipment ${entry.domainId}`, entry);
    }
    if (entry.domainType === 'train_module' && !trainModuleIds.has(entry.domainId)) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown train module ${entry.domainId}`, entry);
    }
    if (entry.domainType === 'train_part' && !trainPartIds.has(entry.domainId)) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown train part ${entry.domainId}`, entry);
    }
    if (entry.domainType === 'enemy' && !enemyIds.has(entry.domainId)) {
      return fail(ErrorCode.ConfigMissingReference, `UI visual binding ${entry.bindingId} references unknown enemy ${entry.domainId}`, entry);
    }
  }

  for (const resourceId of resourceIds) {
    if (!bindingKeys.has(visualBindingKey('resource', resourceId))) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI visual binding for resource ${resourceId}`);
    }
  }
  for (const lootBoxId of lootBoxIds) {
    if (!bindingKeys.has(visualBindingKey('loot_box', lootBoxId))) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI visual binding for loot box ${lootBoxId}`);
    }
  }
  for (const equipmentId of equipmentIds) {
    if (!bindingKeys.has(visualBindingKey('equipment', equipmentId))) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI visual binding for equipment ${equipmentId}`);
    }
  }
  for (const trainModuleId of trainModuleIds) {
    if (!bindingKeys.has(visualBindingKey('train_module', trainModuleId))) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI visual binding for train module ${trainModuleId}`);
    }
  }
  for (const trainPartId of trainPartIds) {
    if (!bindingKeys.has(visualBindingKey('train_part', trainPartId))) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI visual binding for train part ${trainPartId}`);
    }
  }
  for (const enemyId of enemyIds) {
    if (!bindingKeys.has(visualBindingKey('enemy', enemyId))) {
      return fail(ErrorCode.ConfigMissingReference, `Missing UI visual binding for enemy ${enemyId}`);
    }
  }

  return ok(configs);
}

function collectKnownEnemyIds(configs: GameConfigRegistry): Set<string> {
  const ids = new Set<string>();
  for (const wave of configs.stageWaves) {
    for (const enemy of wave.enemies) {
      ids.add(enemy.enemyId);
    }
  }
  return ids;
}

function collectKnownResourceIds(configs: GameConfigRegistry): Set<string> {
  const ids = new Set<string>();
  for (const lootBox of configs.lootBoxes) {
    for (const cost of lootBox.openCost) {
      ids.add(cost.resourceId);
    }
  }
  for (const reward of configs.rewardDefinitions) {
    collectRewardItemResourceIds(reward.items, ids);
  }
  for (const placement of configs.adPlacements) {
    collectRewardItemResourceIds(placement.fallbackReward, ids);
  }
  for (const moduleConfig of configs.trainModules) {
    for (const level of moduleConfig.levels) {
      collectRewardItemResourceIds(level.upgradeCost, ids);
    }
  }
  return ids;
}

function collectRewardItemResourceIds(items: RewardItem[], ids: Set<string>): void {
  for (const item of items) {
    if (item.type === 'resource') {
      ids.add(item.id);
    }
    if (item.type === 'module_fragment') {
      ids.add('module_fragment');
    }
  }
}

function expectedVisualBindingAssetUsage(domainType: GameConfigRegistry['uiVisualBindings']['entries'][number]['domainType']): string {
  if (domainType === 'equipment') return 'equipment_icon';
  if (domainType === 'train_module') return 'train_module_icon';
  if (domainType === 'train_part') return 'train_sprite';
  if (domainType === 'enemy') return 'enemy_sprite';
  return 'resource_icon';
}

function visualBindingKey(domainType: string, domainId: string): string {
  return `${domainType}:${domainId}`;
}

const FIXED_P0_UI_COPY_KEYS = [
  'ui.screen.mainHud.title',
  'ui.screen.lootBox.title',
  'ui.screen.reward.title',
  'ui.screen.trainModule.title',
  'ui.screen.adReward.title',
  'ui.button.stage.start',
  'ui.button.stage.resolving',
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
  'ui.label.threat',
  'ui.status.stage.ready',
  'ui.status.stage.combat',
  'ui.status.stage.clear',
  'ui.status.stage.failed',
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

  for (const stage of configs.stageChapters) {
    requiredKeys.add(stage.displayNameKey);
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
