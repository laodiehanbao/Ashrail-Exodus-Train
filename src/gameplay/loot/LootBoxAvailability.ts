import type { InventorySnapshot } from '../../domain/inventory/Inventory.types.js';
import type { ResourceWalletSnapshot } from '../../domain/player/ResourceWallet.js';
import type { LootBoxConfig } from './LootBox.types.js';

export type LootBoxOpenBlockReason = 'no_loot_box' | 'insufficient_resource';

export interface LootBoxAvailabilityState {
  lootBoxId: string;
  count: number;
  canPayCost: boolean;
  canOpen: boolean;
  blockReason?: LootBoxOpenBlockReason;
}

export function createLootBoxAvailabilityState(
  inventory: InventorySnapshot,
  resources: ResourceWalletSnapshot,
  lootBox: LootBoxConfig,
): LootBoxAvailabilityState {
  const count = inventory.lootBoxes[lootBox.id] ?? 0;
  const canPayCost = lootBox.openCost.every((cost) => (resources[cost.resourceId] ?? 0) >= cost.amount);
  const blockReason = getBlockReason(count, canPayCost);

  return {
    lootBoxId: lootBox.id,
    count,
    canPayCost,
    canOpen: blockReason === undefined,
    blockReason,
  };
}

function getBlockReason(count: number, canPayCost: boolean): LootBoxOpenBlockReason | undefined {
  if (count <= 0) return 'no_loot_box';
  return canPayCost ? undefined : 'insufficient_resource';
}
