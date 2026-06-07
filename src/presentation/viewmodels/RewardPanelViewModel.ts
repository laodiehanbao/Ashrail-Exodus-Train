import type { RewardBundle, RewardItem } from '../../domain/reward/Reward.types.js';
import type { UiActionState, UiScreenLayoutConfig, UiVisualAssetResolver } from '../../shared/ui/P0Ui.types.js';
import type { UiTextService } from './UiTextService.js';

export type RewardLabelResolver = (item: RewardItem, fallbackKey: string) => string;

export interface RewardItemViewState {
  type: string;
  id: string;
  amount: number;
  label: string;
  accentToken: string;
  iconAssetId?: string;
}

export interface RewardPanelState {
  title: string;
  sourceId: string;
  items: RewardItemViewState[];
  actions: UiActionState[];
  layout?: UiScreenLayoutConfig;
}

export function createRewardPanelState(
  reward: RewardBundle,
  text?: UiTextService,
  layout?: UiScreenLayoutConfig,
  labelResolver?: RewardLabelResolver,
  resolveVisualAsset?: UiVisualAssetResolver,
): RewardPanelState {
  return {
    title: getText(text, 'ui.screen.reward.title'),
    sourceId: reward.sourceId,
    items: reward.items.map((item) => createRewardItemState(item, text, labelResolver, resolveVisualAsset)),
    actions: [
      {
        actionId: 'ui_request_reward_claim',
        labelKey: 'ui.button.reward.claim',
        label: getText(text, 'ui.button.reward.claim'),
        enabled: true,
      },
    ],
    layout,
  };
}

function createRewardItemState(
  item: RewardItem,
  text?: UiTextService,
  labelResolver?: RewardLabelResolver,
  resolveVisualAsset?: UiVisualAssetResolver,
): RewardItemViewState {
  const labelKey = item.type === 'resource' ? `resource.${item.id}.name` : `${item.type}.${item.id}.name`;
  return {
    type: item.type,
    id: item.id,
    amount: item.amount,
    label: labelResolver?.(item, labelKey) ?? getText(text, labelKey),
    accentToken: getRewardAccent(item.type),
    iconAssetId: resolveRewardIconAssetId(item, resolveVisualAsset),
  };
}

function resolveRewardIconAssetId(
  item: RewardItem,
  resolveVisualAsset?: UiVisualAssetResolver,
): string | undefined {
  if (item.type === 'resource') return resolveVisualAsset?.('resource', item.id);
  if (item.type === 'loot_box') return resolveVisualAsset?.('loot_box', item.id);
  if (item.type === 'equipment') return resolveVisualAsset?.('equipment', item.id);
  if (item.type === 'module_fragment') return resolveVisualAsset?.('train_module', item.id)
    ?? resolveVisualAsset?.('resource', 'module_fragment');
  return undefined;
}

function getRewardAccent(type: string): string {
  if (type === 'resource') return 'warning_yellow';
  if (type === 'equipment') return 'signal_cyan';
  if (type === 'module_fragment') return 'ember_orange';
  return 'steel_white';
}

function getText(text: UiTextService | undefined, key: string): string {
  return text?.text(key) ?? key;
}
