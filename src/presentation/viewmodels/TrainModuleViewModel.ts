import type { InventorySnapshot } from '../../domain/inventory/Inventory.types.js';
import type { TrainModuleConfig, TrainSnapshot } from '../../domain/train/Train.types.js';
import {
  createTrainModuleUpgradeAvailabilityState,
  type TrainModuleUpgradeBlockReason,
} from '../../gameplay/train/TrainModuleUpgradeAvailability.js';
import type {
  UiActionState,
  UiMetricState,
  UiScreenLayoutConfig,
  UiVisualAssetResolver,
} from '../../shared/ui/P0Ui.types.js';
import type { UiTextService } from './UiTextService.js';

export interface TrainModuleCardState {
  moduleId: string;
  displayName: string;
  iconAssetId?: string;
  slot: string;
  level: number;
  maxLevel: number;
  currentPower: number;
  nextPower: number;
  fragmentsOwned: number;
  fragmentsRequired: number;
  canUpgrade: boolean;
  statusText: string;
  action: UiActionState;
}

export interface TrainModulePanelState {
  title: string;
  modules: TrainModuleCardState[];
  metrics: UiMetricState[];
  layout?: UiScreenLayoutConfig;
}

export function createTrainModulePanelState(
  train: TrainSnapshot,
  inventory: InventorySnapshot,
  modules: TrainModuleConfig[],
  text?: UiTextService,
  layout?: UiScreenLayoutConfig,
  resolveVisualAsset?: UiVisualAssetResolver,
): TrainModulePanelState {
  const cards = modules.map((moduleConfig) => createModuleCard(train, inventory, moduleConfig, text, resolveVisualAsset));
  const totalPower = cards.reduce((sum, card) => sum + card.currentPower, 0);

  return {
    title: getText(text, 'ui.screen.trainModule.title'),
    modules: cards,
    metrics: [
      {
        labelKey: 'ui.label.power',
        label: getText(text, 'ui.label.power'),
        value: String(totalPower),
        accentToken: 'ember_orange',
      },
    ],
    layout,
  };
}

function createModuleCard(
  train: TrainSnapshot,
  inventory: InventorySnapshot,
  moduleConfig: TrainModuleConfig,
  text?: UiTextService,
  resolveVisualAsset?: UiVisualAssetResolver,
): TrainModuleCardState {
  const availability = createTrainModuleUpgradeAvailabilityState(train, inventory, moduleConfig);
  const disabledReasonKey = getDisabledReasonKey(availability.blockReason);

  return {
    moduleId: moduleConfig.id,
    displayName: getText(text, moduleConfig.displayNameKey),
    iconAssetId: resolveVisualAsset?.('train_module', moduleConfig.id),
    slot: moduleConfig.slot,
    level: availability.level,
    maxLevel: moduleConfig.maxLevel,
    currentPower: availability.currentPower,
    nextPower: availability.nextPower,
    fragmentsOwned: availability.fragmentsOwned,
    fragmentsRequired: availability.fragmentsRequired,
    canUpgrade: availability.canUpgrade,
    statusText: disabledReasonKey ? getText(text, disabledReasonKey) : getText(text, 'ui.button.module.upgrade'),
    action: {
      actionId: 'ui_request_train_module_upgrade',
      labelKey: availability.canUpgrade ? 'ui.button.module.upgrade' : 'ui.button.module.locked',
      label: getText(text, availability.canUpgrade ? 'ui.button.module.upgrade' : 'ui.button.module.locked'),
      enabled: availability.canUpgrade,
      disabledReasonKey,
      disabledReason: disabledReasonKey ? getText(text, disabledReasonKey) : undefined,
    },
  };
}

function getDisabledReasonKey(reason: TrainModuleUpgradeBlockReason | undefined): string | undefined {
  if (reason === 'insufficient_fragment') return 'ui.status.module.fragment.insufficient';
  if (reason === 'max_level') return 'ui.status.module.max';
  return undefined;
}

function getText(text: UiTextService | undefined, key: string): string {
  return text?.text(key) ?? key;
}
