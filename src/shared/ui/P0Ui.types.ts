import type { AdPlacementId, LootBoxId, TrainModuleId } from '../ids.types.js';

export const P0_UI_SCREEN_IDS = ['main_hud', 'loot_box', 'reward_panel', 'train_module', 'ad_reward'] as const;
export type P0UiScreenId = (typeof P0_UI_SCREEN_IDS)[number];

export const P0_UI_ACTION_IDS = [
  'ui_request_stage_start',
  'ui_request_lootbox_open',
  'ui_request_reward_claim',
  'ui_request_train_module_upgrade',
  'ui_request_ad_reward_double',
  'ui_request_ad_reward_skip',
] as const;
export type UiActionId = (typeof P0_UI_ACTION_IDS)[number];

export interface UiCopyEntryConfig {
  key: string;
  text: string;
}

export interface UiCopyConfig {
  locale: string;
  entries: UiCopyEntryConfig[];
}

export interface UiSafeAreaConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface UiColorTokenConfig {
  token: string;
  hex: string;
}

export interface UiComponentSkinConfig {
  componentId: string;
  assetId: string;
  minWidth: number;
  minHeight: number;
}

export type UiVisualAssetKind = 'spriteFrame';
export type UiVisualAssetUsage = 'screen_background' | 'ui_skin' | 'actor_sheet' | 'concept';
export type UiVisualAssetPackageTag = 'main' | 'subpackage' | 'remote' | 'prototype';

export interface UiVisualAssetConfig {
  assetId: string;
  assetPath: string;
  kind: UiVisualAssetKind;
  usage: UiVisualAssetUsage;
  packageTag: UiVisualAssetPackageTag;
  width: number;
  height: number;
  targetMaxBytes: number;
}

export interface UiVisualAssetSetConfig {
  assetSetId: string;
  assets: UiVisualAssetConfig[];
}

export interface UiPanelLayoutConfig {
  panelId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UiScreenLayoutConfig {
  screenId: P0UiScreenId;
  backgroundAssetId: string;
  panels: UiPanelLayoutConfig[];
}

export interface UiLayoutConfig {
  layoutId: string;
  designWidth: number;
  designHeight: number;
  safeArea: UiSafeAreaConfig;
  colorTokens: UiColorTokenConfig[];
  componentSkins: UiComponentSkinConfig[];
  screens: UiScreenLayoutConfig[];
}

export interface UiActionState {
  actionId: UiActionId;
  labelKey: string;
  label: string;
  enabled: boolean;
  disabledReasonKey?: string;
  disabledReason?: string;
}

export interface UiMetricState {
  labelKey: string;
  label: string;
  value: string;
  accentToken?: string;
}

export type UiInteractionRequest =
  | { actionId: 'ui_request_stage_start' }
  | { actionId: 'ui_request_lootbox_open'; payload: { lootBoxId: LootBoxId } }
  | { actionId: 'ui_request_reward_claim'; payload: { sourceId: string } }
  | { actionId: 'ui_request_train_module_upgrade'; payload: { moduleId: TrainModuleId } }
  | { actionId: 'ui_request_ad_reward_double'; payload: { placementId: AdPlacementId } }
  | { actionId: 'ui_request_ad_reward_skip'; payload: { placementId: AdPlacementId } };
