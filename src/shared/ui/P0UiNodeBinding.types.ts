import type { P0UiScreenId, UiActionId } from './P0Ui.types.js';

export type P0UiBindingSetId = string;
export type P0UiSceneId = string;
export type P0UiNodePath = string;
export type P0UiBindingSlotId =
  | 'mainHud.frame'
  | 'mainHud.title'
  | 'mainHud.status'
  | 'mainHud.metrics'
  | 'mainHud.combatPreview'
  | 'mainHud.primaryAction'
  | 'lootBox.frame'
  | 'lootBox.title'
  | 'lootBox.lootBoxName'
  | 'lootBox.count'
  | 'lootBox.cost'
  | 'lootBox.metrics'
  | 'lootBox.openAction'
  | 'rewardPanel.frame'
  | 'rewardPanel.title'
  | 'rewardPanel.items'
  | 'rewardPanel.claimAction'
  | 'trainModule.frame'
  | 'trainModule.title'
  | 'trainModule.metrics'
  | 'trainModule.moduleCards'
  | 'adReward.frame'
  | 'adReward.title'
  | 'adReward.status'
  | 'adReward.metrics'
  | 'adReward.doubleAction'
  | 'adReward.skipAction';

export type UiNodeBindingKind =
  | 'frame'
  | 'text'
  | 'metricList'
  | 'combatPreview'
  | 'action'
  | 'rewardItemList'
  | 'moduleCardList';

export interface UiNodeBindingEntryConfig {
  bindingKey: string;
  slotId: P0UiBindingSlotId;
  nodePath: P0UiNodePath;
  kind: UiNodeBindingKind;
  panelId?: string;
  componentId?: string;
  actionId?: UiActionId;
  itemTemplatePath?: P0UiNodePath;
  emptyStatePath?: P0UiNodePath;
}

export interface UiScreenNodeBindingConfig {
  screenId: P0UiScreenId;
  rootPath: P0UiNodePath;
  bindings: UiNodeBindingEntryConfig[];
}

export interface UiNodeBindingConfig {
  bindingSetId: P0UiBindingSetId;
  sceneId: P0UiSceneId;
  layoutId: string;
  screens: UiScreenNodeBindingConfig[];
}

export interface UiNodeBindingSlotSpec {
  screenId: P0UiScreenId;
  slotId: P0UiBindingSlotId;
  kind: UiNodeBindingKind;
  actionId?: UiActionId;
  requiresItemTemplate?: boolean;
}

export const P0_UI_NODE_BINDING_SLOT_SPECS = [
  { screenId: 'main_hud', slotId: 'mainHud.frame', kind: 'frame' },
  { screenId: 'main_hud', slotId: 'mainHud.title', kind: 'text' },
  { screenId: 'main_hud', slotId: 'mainHud.status', kind: 'text' },
  { screenId: 'main_hud', slotId: 'mainHud.metrics', kind: 'metricList', requiresItemTemplate: true },
  { screenId: 'main_hud', slotId: 'mainHud.combatPreview', kind: 'combatPreview' },
  {
    screenId: 'main_hud',
    slotId: 'mainHud.primaryAction',
    kind: 'action',
    actionId: 'ui_request_stage_start',
  },
  { screenId: 'loot_box', slotId: 'lootBox.frame', kind: 'frame' },
  { screenId: 'loot_box', slotId: 'lootBox.title', kind: 'text' },
  { screenId: 'loot_box', slotId: 'lootBox.lootBoxName', kind: 'text' },
  { screenId: 'loot_box', slotId: 'lootBox.count', kind: 'text' },
  { screenId: 'loot_box', slotId: 'lootBox.cost', kind: 'text' },
  { screenId: 'loot_box', slotId: 'lootBox.metrics', kind: 'metricList', requiresItemTemplate: true },
  {
    screenId: 'loot_box',
    slotId: 'lootBox.openAction',
    kind: 'action',
    actionId: 'ui_request_lootbox_open',
  },
  { screenId: 'reward_panel', slotId: 'rewardPanel.frame', kind: 'frame' },
  { screenId: 'reward_panel', slotId: 'rewardPanel.title', kind: 'text' },
  { screenId: 'reward_panel', slotId: 'rewardPanel.items', kind: 'rewardItemList', requiresItemTemplate: true },
  {
    screenId: 'reward_panel',
    slotId: 'rewardPanel.claimAction',
    kind: 'action',
    actionId: 'ui_request_reward_claim',
  },
  { screenId: 'train_module', slotId: 'trainModule.frame', kind: 'frame' },
  { screenId: 'train_module', slotId: 'trainModule.title', kind: 'text' },
  { screenId: 'train_module', slotId: 'trainModule.metrics', kind: 'metricList', requiresItemTemplate: true },
  {
    screenId: 'train_module',
    slotId: 'trainModule.moduleCards',
    kind: 'moduleCardList',
    actionId: 'ui_request_train_module_upgrade',
    requiresItemTemplate: true,
  },
  { screenId: 'ad_reward', slotId: 'adReward.frame', kind: 'frame' },
  { screenId: 'ad_reward', slotId: 'adReward.title', kind: 'text' },
  { screenId: 'ad_reward', slotId: 'adReward.status', kind: 'text' },
  { screenId: 'ad_reward', slotId: 'adReward.metrics', kind: 'metricList', requiresItemTemplate: true },
  {
    screenId: 'ad_reward',
    slotId: 'adReward.doubleAction',
    kind: 'action',
    actionId: 'ui_request_ad_reward_double',
  },
  {
    screenId: 'ad_reward',
    slotId: 'adReward.skipAction',
    kind: 'action',
    actionId: 'ui_request_ad_reward_skip',
  },
] as const satisfies readonly UiNodeBindingSlotSpec[];
