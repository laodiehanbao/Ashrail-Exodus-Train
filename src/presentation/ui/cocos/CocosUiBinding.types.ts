import type { RewardItemViewState } from '../../viewmodels/RewardPanelViewModel.js';
import type { MainHudCombatPreviewState } from '../../viewmodels/MainHudViewModel.js';
import type { TrainModuleCardState } from '../../viewmodels/TrainModuleViewModel.js';
import type { UiActionState, UiInteractionRequest, UiMetricState, UiPanelLayoutConfig } from '../../../shared/ui/P0Ui.types.js';

export interface CocosUiRequestSink {
  emit(request: UiInteractionRequest): void;
}

export interface CocosUiFrameBinding {
  setVisible(visible: boolean): void;
  setBackgroundAsset(assetId: string): void;
  setPanelLayouts(panels: UiPanelLayoutConfig[]): void;
}

export interface CocosUiTextBinding {
  setText(text: string): void;
}

export interface CocosUiMetricListBinding {
  setItems(items: UiMetricState[]): void;
}

export interface CocosCombatPreviewBinding {
  setState(state: MainHudCombatPreviewState): void;
}

export interface CocosUiActionBinding {
  setLabel(label: string): void;
  setEnabled(enabled: boolean): void;
  setDisabledReason(reason?: string): void;
  setOnPress(handler: (() => void) | null): void;
}

export interface CocosRewardItemListBinding {
  setItems(items: RewardItemViewState[]): void;
}

export interface CocosTrainModuleCardBindingState extends TrainModuleCardState {
  onUpgrade: (() => void) | null;
}

export interface CocosTrainModuleCardListBinding {
  setItems(items: CocosTrainModuleCardBindingState[]): void;
}

export interface CocosMainHudBinding {
  frame: CocosUiFrameBinding;
  title: CocosUiTextBinding;
  status: CocosUiTextBinding;
  metrics: CocosUiMetricListBinding;
  combatPreview: CocosCombatPreviewBinding;
  primaryAction: CocosUiActionBinding;
}

export interface CocosLootBoxBinding {
  frame: CocosUiFrameBinding;
  title: CocosUiTextBinding;
  lootBoxName: CocosUiTextBinding;
  count: CocosUiTextBinding;
  cost: CocosUiTextBinding;
  metrics: CocosUiMetricListBinding;
  openAction: CocosUiActionBinding;
}

export interface CocosRewardPanelBinding {
  frame: CocosUiFrameBinding;
  title: CocosUiTextBinding;
  items: CocosRewardItemListBinding;
  claimAction: CocosUiActionBinding;
}

export interface CocosTrainModuleBinding {
  frame: CocosUiFrameBinding;
  title: CocosUiTextBinding;
  metrics: CocosUiMetricListBinding;
  moduleCards: CocosTrainModuleCardListBinding;
}

export interface CocosAdRewardBinding {
  frame: CocosUiFrameBinding;
  title: CocosUiTextBinding;
  status: CocosUiTextBinding;
  metrics: CocosUiMetricListBinding;
  doubleAction: CocosUiActionBinding;
  skipAction: CocosUiActionBinding;
}

export interface P0CocosUiBinding {
  mainHud: CocosMainHudBinding;
  lootBox: CocosLootBoxBinding;
  rewardPanel: CocosRewardPanelBinding;
  trainModule: CocosTrainModuleBinding;
  adReward: CocosAdRewardBinding;
}
