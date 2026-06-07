import type {
  CocosCombatPreviewBinding,
  CocosRewardItemListBinding,
  CocosTrainModuleCardListBinding,
  CocosUiActionBinding,
  CocosUiFrameBinding,
  CocosUiMetricListBinding,
  CocosUiTextBinding,
  P0CocosUiBinding,
} from './CocosUiBinding.types.js';
import { fail, ok, type Result } from '../../../core/Result.types.js';
import { ErrorCode } from '../../../shared/ErrorCodes.js';
import type {
  P0UiBindingSlotId,
  UiNodeBindingSlotSpec,
  UiNodeBindingConfig,
  UiNodeBindingEntryConfig,
  UiNodeBindingKind,
} from '../../../shared/ui/P0UiNodeBinding.types.js';
import { P0_UI_NODE_BINDING_SLOT_SPECS } from '../../../shared/ui/P0UiNodeBinding.types.js';

export interface CocosUiBindingHost {
  createFrameBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiFrameBinding>;
  createTextBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiTextBinding>;
  createMetricListBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiMetricListBinding>;
  createCombatPreviewBinding(binding: UiNodeBindingEntryConfig): Result<CocosCombatPreviewBinding>;
  createActionBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiActionBinding>;
  createRewardItemListBinding(binding: UiNodeBindingEntryConfig): Result<CocosRewardItemListBinding>;
  createTrainModuleCardListBinding(binding: UiNodeBindingEntryConfig): Result<CocosTrainModuleCardListBinding>;
}

export function createP0CocosUiBindingFromManifest(
  manifest: UiNodeBindingConfig,
  host: CocosUiBindingHost,
): Result<P0CocosUiBinding> {
  const slots = createSlotMap(manifest);
  if (!slots.ok) return slots;

  const mainHudFrame = createFrame(slots.value, host, 'mainHud.frame');
  const mainHudTitle = createText(slots.value, host, 'mainHud.title');
  const mainHudStatus = createText(slots.value, host, 'mainHud.status');
  const mainHudMetrics = createMetricList(slots.value, host, 'mainHud.metrics');
  const mainHudCombatPreview = createCombatPreview(slots.value, host, 'mainHud.combatPreview');
  const mainHudPrimaryAction = createAction(slots.value, host, 'mainHud.primaryAction');
  const lootBoxFrame = createFrame(slots.value, host, 'lootBox.frame');
  const lootBoxTitle = createText(slots.value, host, 'lootBox.title');
  const lootBoxName = createText(slots.value, host, 'lootBox.lootBoxName');
  const lootBoxCount = createText(slots.value, host, 'lootBox.count');
  const lootBoxCost = createText(slots.value, host, 'lootBox.cost');
  const lootBoxMetrics = createMetricList(slots.value, host, 'lootBox.metrics');
  const lootBoxOpenAction = createAction(slots.value, host, 'lootBox.openAction');
  const rewardPanelFrame = createFrame(slots.value, host, 'rewardPanel.frame');
  const rewardPanelTitle = createText(slots.value, host, 'rewardPanel.title');
  const rewardPanelItems = createRewardItemList(slots.value, host, 'rewardPanel.items');
  const rewardPanelClaimAction = createAction(slots.value, host, 'rewardPanel.claimAction');
  const trainModuleFrame = createFrame(slots.value, host, 'trainModule.frame');
  const trainModuleTitle = createText(slots.value, host, 'trainModule.title');
  const trainModuleMetrics = createMetricList(slots.value, host, 'trainModule.metrics');
  const trainModuleCards = createTrainModuleCardList(slots.value, host, 'trainModule.moduleCards');
  const adRewardFrame = createFrame(slots.value, host, 'adReward.frame');
  const adRewardTitle = createText(slots.value, host, 'adReward.title');
  const adRewardStatus = createText(slots.value, host, 'adReward.status');
  const adRewardMetrics = createMetricList(slots.value, host, 'adReward.metrics');
  const adRewardDoubleAction = createAction(slots.value, host, 'adReward.doubleAction');
  const adRewardSkipAction = createAction(slots.value, host, 'adReward.skipAction');
  if (!mainHudFrame.ok) return mainHudFrame;
  if (!mainHudTitle.ok) return mainHudTitle;
  if (!mainHudStatus.ok) return mainHudStatus;
  if (!mainHudMetrics.ok) return mainHudMetrics;
  if (!mainHudCombatPreview.ok) return mainHudCombatPreview;
  if (!mainHudPrimaryAction.ok) return mainHudPrimaryAction;
  if (!lootBoxFrame.ok) return lootBoxFrame;
  if (!lootBoxTitle.ok) return lootBoxTitle;
  if (!lootBoxName.ok) return lootBoxName;
  if (!lootBoxCount.ok) return lootBoxCount;
  if (!lootBoxCost.ok) return lootBoxCost;
  if (!lootBoxMetrics.ok) return lootBoxMetrics;
  if (!lootBoxOpenAction.ok) return lootBoxOpenAction;
  if (!rewardPanelFrame.ok) return rewardPanelFrame;
  if (!rewardPanelTitle.ok) return rewardPanelTitle;
  if (!rewardPanelItems.ok) return rewardPanelItems;
  if (!rewardPanelClaimAction.ok) return rewardPanelClaimAction;
  if (!trainModuleFrame.ok) return trainModuleFrame;
  if (!trainModuleTitle.ok) return trainModuleTitle;
  if (!trainModuleMetrics.ok) return trainModuleMetrics;
  if (!trainModuleCards.ok) return trainModuleCards;
  if (!adRewardFrame.ok) return adRewardFrame;
  if (!adRewardTitle.ok) return adRewardTitle;
  if (!adRewardStatus.ok) return adRewardStatus;
  if (!adRewardMetrics.ok) return adRewardMetrics;
  if (!adRewardDoubleAction.ok) return adRewardDoubleAction;
  if (!adRewardSkipAction.ok) return adRewardSkipAction;

  return ok({
    mainHud: {
      frame: mainHudFrame.value,
      title: mainHudTitle.value,
      status: mainHudStatus.value,
      metrics: mainHudMetrics.value,
      combatPreview: mainHudCombatPreview.value,
      primaryAction: mainHudPrimaryAction.value,
    },
    lootBox: {
      frame: lootBoxFrame.value,
      title: lootBoxTitle.value,
      lootBoxName: lootBoxName.value,
      count: lootBoxCount.value,
      cost: lootBoxCost.value,
      metrics: lootBoxMetrics.value,
      openAction: lootBoxOpenAction.value,
    },
    rewardPanel: {
      frame: rewardPanelFrame.value,
      title: rewardPanelTitle.value,
      items: rewardPanelItems.value,
      claimAction: rewardPanelClaimAction.value,
    },
    trainModule: {
      frame: trainModuleFrame.value,
      title: trainModuleTitle.value,
      metrics: trainModuleMetrics.value,
      moduleCards: trainModuleCards.value,
    },
    adReward: {
      frame: adRewardFrame.value,
      title: adRewardTitle.value,
      status: adRewardStatus.value,
      metrics: adRewardMetrics.value,
      doubleAction: adRewardDoubleAction.value,
      skipAction: adRewardSkipAction.value,
    },
  });
}

function createSlotMap(manifest: UiNodeBindingConfig): Result<Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>> {
  const slots = new Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>();
  for (const screen of manifest.screens) {
    for (const binding of screen.bindings) {
      if (slots.has(binding.slotId)) {
        return fail(ErrorCode.ConfigInvalid, `Duplicate P0 Cocos UI binding slot ${binding.slotId}`, binding);
      }
      slots.set(binding.slotId, binding);
    }
  }
  return ok(slots);
}

function createFrame(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosUiFrameBinding> {
  const slot = requireSlot(slots, slotId, 'frame');
  return slot.ok ? host.createFrameBinding(slot.value) : slot;
}

function createText(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosUiTextBinding> {
  const slot = requireSlot(slots, slotId, 'text');
  return slot.ok ? host.createTextBinding(slot.value) : slot;
}

function createMetricList(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosUiMetricListBinding> {
  const slot = requireSlot(slots, slotId, 'metricList');
  return slot.ok ? host.createMetricListBinding(slot.value) : slot;
}

function createCombatPreview(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosCombatPreviewBinding> {
  const slot = requireSlot(slots, slotId, 'combatPreview');
  return slot.ok ? host.createCombatPreviewBinding(slot.value) : slot;
}

function createAction(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosUiActionBinding> {
  const slot = requireSlot(slots, slotId, 'action');
  return slot.ok ? host.createActionBinding(slot.value) : slot;
}

function createRewardItemList(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosRewardItemListBinding> {
  const slot = requireSlot(slots, slotId, 'rewardItemList');
  return slot.ok ? host.createRewardItemListBinding(slot.value) : slot;
}

function createTrainModuleCardList(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  host: CocosUiBindingHost,
  slotId: P0UiBindingSlotId,
): Result<CocosTrainModuleCardListBinding> {
  const slot = requireSlot(slots, slotId, 'moduleCardList');
  return slot.ok ? host.createTrainModuleCardListBinding(slot.value) : slot;
}

function requireSlot(
  slots: Map<P0UiBindingSlotId, UiNodeBindingEntryConfig>,
  slotId: P0UiBindingSlotId,
  kind: UiNodeBindingKind,
): Result<UiNodeBindingEntryConfig> {
  const binding = slots.get(slotId);
  if (!binding) {
    return fail(ErrorCode.ConfigMissingReference, `Missing P0 Cocos UI binding slot ${slotId}`);
  }
  if (binding.kind !== kind) {
    return fail(ErrorCode.ConfigInvalid, `P0 Cocos UI binding slot ${slotId} expected ${kind}, got ${binding.kind}`, binding);
  }
  const slotSpec = findSlotSpec(slotId);
  if (slotSpec?.actionId && binding.actionId !== slotSpec.actionId) {
    return fail(
      ErrorCode.ConfigInvalid,
      `P0 Cocos UI binding slot ${slotId} expected action ${slotSpec.actionId}, got ${binding.actionId ?? 'none'}`,
      binding,
    );
  }
  return ok(binding);
}

function findSlotSpec(slotId: P0UiBindingSlotId): UiNodeBindingSlotSpec | undefined {
  return P0_UI_NODE_BINDING_SLOT_SPECS.find((spec) => spec.slotId === slotId);
}
