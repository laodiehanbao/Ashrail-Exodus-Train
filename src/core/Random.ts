type WeightedEntry<T> = {
  value: T;
  weight: number;
};

export class Random {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }

  integer(minInclusive: number, maxInclusive: number): number {
    const min = Math.ceil(minInclusive);
    const max = Math.floor(maxInclusive);
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pickWeighted<T>(entries: WeightedEntry<T>[]): T {
    const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) {
      throw new Error('Weighted pick requires positive total weight');
    }

    let cursor = this.next() * totalWeight;
    for (const entry of entries) {
      cursor -= entry.weight;
      if (cursor <= 0) {
        return entry.value;
      }
    }

    return entries[entries.length - 1].value;
  }
}
