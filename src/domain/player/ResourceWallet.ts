import type { ResourceId } from '../../shared/ids.types.js';

export type ResourceWalletSnapshot = Record<ResourceId, number>;

export class ResourceWallet {
  private readonly resources: ResourceWalletSnapshot;

  constructor(snapshot?: ResourceWalletSnapshot) {
    this.resources = { ...(snapshot ?? {}) };
  }

  get(resourceId: ResourceId): number {
    return this.resources[resourceId] ?? 0;
  }

  add(resourceId: ResourceId, amount: number): void {
    this.resources[resourceId] = this.get(resourceId) + amount;
  }

  canSpend(costs: Array<{ resourceId: ResourceId; amount: number }>): boolean {
    return costs.every((cost) => this.get(cost.resourceId) >= cost.amount);
  }

  spend(costs: Array<{ resourceId: ResourceId; amount: number }>): boolean {
    if (!this.canSpend(costs)) {
      return false;
    }

    for (const cost of costs) {
      this.resources[cost.resourceId] = this.get(cost.resourceId) - cost.amount;
    }

    return true;
  }

  toSnapshot(): ResourceWalletSnapshot {
    return { ...this.resources };
  }
}
