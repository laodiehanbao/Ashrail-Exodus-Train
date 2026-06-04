import type { GameConfigRegistry } from '../../data/ConfigRegistry.js';
import type { RewardBundle, RewardItem } from '../../domain/reward/Reward.types.js';
import type { P0UiScreenId, UiScreenLayoutConfig } from '../../shared/ui/P0Ui.types.js';
import { createAdRewardPanelState, type AdRewardPanelState } from './AdRewardViewModel.js';
import { createLootBoxScreenState, type LootBoxScreenState } from './LootBoxViewModel.js';
import { createMainHudState, type MainHudState } from './MainHudViewModel.js';
import { createRewardPanelState, type RewardPanelState } from './RewardPanelViewModel.js';
import { createTrainModulePanelState, type TrainModulePanelState } from './TrainModuleViewModel.js';
import type { P0UiSnapshot } from './P0UiSnapshot.types.js';
import { UiTextService } from './UiTextService.js';

export const DEFAULT_P0_LOOT_BOX_ID = 'lootbox_supply_common';
export const DEFAULT_P0_AD_PLACEMENT_ID = 'ad_reward_stage_clear_double';

export interface P0UiViewModelInput {
  configs: GameConfigRegistry;
  snapshot: P0UiSnapshot;
  nowMs: number;
  latestReward?: RewardBundle;
  lootBoxId?: string;
  adPlacementId?: string;
}

export interface P0UiState {
  mainHud: MainHudState;
  lootBox: LootBoxScreenState;
  rewardPanel: RewardPanelState | null;
  trainModule: TrainModulePanelState;
  adReward: AdRewardPanelState;
}

export function createP0UiState(input: P0UiViewModelInput): P0UiState {
  const text = new UiTextService(input.configs.uiCopy);
  const lootBox = findRequired(
    input.configs.lootBoxes,
    input.lootBoxId ?? DEFAULT_P0_LOOT_BOX_ID,
    'loot box',
  );
  const adPlacement = findRequired(
    input.configs.adPlacements,
    input.adPlacementId ?? DEFAULT_P0_AD_PLACEMENT_ID,
    'ad placement',
  );

  return {
    mainHud: createMainHudState(input.snapshot, text, getLayout(input.configs, 'main_hud')),
    lootBox: createLootBoxScreenState(
      input.snapshot.progress.inventory,
      input.snapshot.progress.resources,
      lootBox,
      text,
      getLayout(input.configs, 'loot_box'),
    ),
    rewardPanel: input.latestReward
      ? createRewardPanelState(
          input.latestReward,
          text,
          getLayout(input.configs, 'reward_panel'),
          createRewardLabelResolver(input.configs, text),
        )
      : null,
    trainModule: createTrainModulePanelState(
      input.snapshot.progress.train,
      input.snapshot.progress.inventory,
      input.configs.trainModules,
      text,
      getLayout(input.configs, 'train_module'),
    ),
    adReward: createAdRewardPanelState(
      adPlacement,
      input.snapshot.progress.adRecords,
      input.nowMs,
      text,
      getLayout(input.configs, 'ad_reward'),
    ),
  };
}

function getLayout(configs: GameConfigRegistry, screenId: P0UiScreenId): UiScreenLayoutConfig {
  const layout = configs.uiLayout.screens.find((screen) => screen.screenId === screenId);
  if (!layout) {
    throw new Error(`Missing P0 UI layout for screen ${screenId}`);
  }
  return layout;
}

function findRequired<T extends { id?: string; placementId?: string }>(
  items: T[],
  id: string,
  label: string,
): T {
  const item = items.find((candidate) => candidate.id === id || candidate.placementId === id);
  if (!item) {
    throw new Error(`Missing P0 ${label} config ${id}`);
  }
  return item;
}

function createRewardLabelResolver(
  configs: GameConfigRegistry,
  text: UiTextService,
): (item: RewardItem, fallbackKey: string) => string {
  return (item, fallbackKey) => {
    if (item.type === 'loot_box') {
      const lootBox = configs.lootBoxes.find((config) => config.id === item.id);
      return text.text(lootBox?.displayNameKey ?? fallbackKey);
    }

    if (item.type === 'equipment') {
      const equipment = configs.equipmentItems.find((config) => config.id === item.id);
      return text.text(equipment?.displayNameKey ?? fallbackKey);
    }

    if (item.type === 'module_fragment') {
      return createModuleFragmentLabel(configs, text, item, fallbackKey);
    }

    return text.text(fallbackKey);
  };
}

function createModuleFragmentLabel(
  configs: GameConfigRegistry,
  text: UiTextService,
  item: RewardItem,
  fallbackKey: string,
): string {
  const moduleConfig = configs.trainModules.find((config) => config.id === item.id);
  const moduleName = text.text(moduleConfig?.displayNameKey ?? fallbackKey);
  const fragmentName = text.text('reward.module_fragment.name');
  return moduleName === fallbackKey ? fragmentName : `${moduleName} ${fragmentName}`;
}
