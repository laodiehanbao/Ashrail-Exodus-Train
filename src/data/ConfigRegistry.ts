import type { RewardDefinition } from '../domain/reward/Reward.types.js';
import type { StageChapterConfig, StageWaveConfig } from '../domain/stage/Stage.types.js';
import type { TrainModuleConfig } from '../domain/train/Train.types.js';
import type { LootBoxConfig, LootPoolConfig } from '../gameplay/loot/LootBox.types.js';
import type { AdPlacementConfig } from '../shared/ads/AdPlacement.types.js';
import type { EquipmentConfig } from '../domain/equipment/Equipment.types.js';
import type { EconomyCurvePoint } from './schemas/EconomyCurve.schema.js';
import type { UiNodeBindingConfig } from '../shared/ui/P0UiNodeBinding.types.js';
import type {
  AudioBudgetConfig,
  AudioCueConfig,
  AudioEventConfig,
  AudioLicenseEntry,
  AudioMixerConfig,
  AudioVoiceLineConfig,
  ElevenLabsVoiceProfileConfig,
} from '../shared/audio/AudioCue.types.js';
import type {
  UiCopyConfig,
  UiLayoutConfig,
  UiVisualAssetSetConfig,
  UiVisualBindingConfig,
} from '../shared/ui/P0Ui.types.js';

export interface GameConfigRegistry {
  lootBoxes: LootBoxConfig[];
  lootPools: LootPoolConfig[];
  rewardDefinitions: RewardDefinition[];
  equipmentItems: EquipmentConfig[];
  stageChapters: StageChapterConfig[];
  stageWaves: StageWaveConfig[];
  trainModules: TrainModuleConfig[];
  adPlacements: AdPlacementConfig[];
  economyCurve: EconomyCurvePoint[];
  audioCues: AudioCueConfig[];
  audioEvents: AudioEventConfig[];
  audioMixer: AudioMixerConfig;
  audioBudget: AudioBudgetConfig;
  audioLicenses: AudioLicenseEntry[];
  audioVoiceLines: AudioVoiceLineConfig[];
  elevenLabsVoiceProfile: ElevenLabsVoiceProfileConfig;
  uiCopy: UiCopyConfig;
  uiLayout: UiLayoutConfig;
  uiVisualAssets: UiVisualAssetSetConfig;
  uiVisualBindings: UiVisualBindingConfig;
  uiNodeBindings: UiNodeBindingConfig;
}

export class ConfigRegistry {
  constructor(private readonly configs: GameConfigRegistry) {}

  get lootBoxes(): LootBoxConfig[] {
    return this.configs.lootBoxes;
  }

  get lootPools(): LootPoolConfig[] {
    return this.configs.lootPools;
  }

  get rewardDefinitions(): RewardDefinition[] {
    return this.configs.rewardDefinitions;
  }

  get equipmentItems(): EquipmentConfig[] {
    return this.configs.equipmentItems;
  }

  get stageChapters(): StageChapterConfig[] {
    return this.configs.stageChapters;
  }

  get stageWaves(): StageWaveConfig[] {
    return this.configs.stageWaves;
  }

  get trainModules(): TrainModuleConfig[] {
    return this.configs.trainModules;
  }

  get adPlacements(): AdPlacementConfig[] {
    return this.configs.adPlacements;
  }

  get economyCurve(): EconomyCurvePoint[] {
    return this.configs.economyCurve;
  }

  get audioCues(): AudioCueConfig[] {
    return this.configs.audioCues;
  }

  get audioEvents(): AudioEventConfig[] {
    return this.configs.audioEvents;
  }

  get audioMixer(): AudioMixerConfig {
    return this.configs.audioMixer;
  }

  get audioBudget(): AudioBudgetConfig {
    return this.configs.audioBudget;
  }

  get audioLicenses(): AudioLicenseEntry[] {
    return this.configs.audioLicenses;
  }

  get audioVoiceLines(): AudioVoiceLineConfig[] {
    return this.configs.audioVoiceLines;
  }

  get elevenLabsVoiceProfile(): ElevenLabsVoiceProfileConfig {
    return this.configs.elevenLabsVoiceProfile;
  }

  get uiCopy(): UiCopyConfig {
    return this.configs.uiCopy;
  }

  get uiLayout(): UiLayoutConfig {
    return this.configs.uiLayout;
  }

  get uiVisualAssets(): UiVisualAssetSetConfig {
    return this.configs.uiVisualAssets;
  }

  get uiVisualBindings(): UiVisualBindingConfig {
    return this.configs.uiVisualBindings;
  }

  get uiNodeBindings(): UiNodeBindingConfig {
    return this.configs.uiNodeBindings;
  }
}
