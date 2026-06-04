import type { InventorySnapshot } from '../../domain/inventory/Inventory.types.js';
import type { ResourceWalletSnapshot } from '../../domain/player/ResourceWallet.js';
import {
  createLootBoxAvailabilityState,
  type LootBoxOpenBlockReason,
} from '../../gameplay/loot/LootBoxAvailability.js';
import type { LootBoxConfig } from '../../gameplay/loot/LootBox.types.js';
import type { UiActionState, UiMetricState, UiScreenLayoutConfig } from '../../shared/ui/P0Ui.types.js';
import type { UiTextService } from './UiTextService.js';

export interface LootBoxButtonState {
  lootBoxId: string;
  count: number;
  canOpen: boolean;
}

export interface LootBoxScreenState {
  title: string;
  lootBoxId: string;
  lootBoxName: string;
  count: number;
  costText: string;
  metrics: UiMetricState[];
  actions: UiActionState[];
  layout?: UiScreenLayoutConfig;
}

export function createLootBoxButtonState(inventory: InventorySnapshot, lootBoxId: string): LootBoxButtonState {
  const count = inventory.lootBoxes[lootBoxId] ?? 0;
  return {
    lootBoxId,
    count,
    canOpen: count > 0,
  };
}

export function createLootBoxScreenState(
  inventory: InventorySnapshot,
  resources: ResourceWalletSnapshot,
  lootBox: LootBoxConfig,
  text?: UiTextService,
  layout?: UiScreenLayoutConfig,
): LootBoxScreenState {
  const availability = createLootBoxAvailabilityState(inventory, resources, lootBox);
  const disabledReasonKey = getDisabledReasonKey(availability.blockReason);
  const costText = lootBox.openCost
    .map((cost) => `${getText(text, `resource.${cost.resourceId}.name`)} ${cost.amount}`)
    .join(' / ');

  return {
    title: getText(text, 'ui.screen.lootBox.title'),
    lootBoxId: lootBox.id,
    lootBoxName: getText(text, lootBox.displayNameKey),
    count: availability.count,
    costText,
    metrics: [
      {
        labelKey: lootBox.displayNameKey,
        label: getText(text, lootBox.displayNameKey),
        value: String(availability.count),
        accentToken: availability.canOpen ? 'ember_orange' : 'ash_gray',
      },
    ],
    actions: [
      {
        actionId: 'ui_request_lootbox_open',
        labelKey: availability.canOpen ? 'ui.button.lootbox.open' : 'ui.button.lootbox.locked',
        label: getText(text, availability.canOpen ? 'ui.button.lootbox.open' : 'ui.button.lootbox.locked'),
        enabled: availability.canOpen,
        disabledReasonKey,
        disabledReason: disabledReasonKey ? getText(text, disabledReasonKey) : undefined,
      },
    ],
    layout,
  };
}

function getDisabledReasonKey(reason: LootBoxOpenBlockReason | undefined): string | undefined {
  if (reason === 'no_loot_box') return 'ui.button.lootbox.locked';
  if (reason === 'insufficient_resource') return 'ui.status.cost.insufficient';
  return undefined;
}

function getText(text: UiTextService | undefined, key: string): string {
  return text?.text(key) ?? key;
}
