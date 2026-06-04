import type { ISaveService } from './ISaveService.js';

export class LocalSaveService<TSnapshot> implements ISaveService<TSnapshot> {
  private snapshot: TSnapshot | null;

  constructor(initialSnapshot: TSnapshot | null = null) {
    this.snapshot = clone(initialSnapshot);
  }

  async load(): Promise<TSnapshot | null> {
    return clone(this.snapshot);
  }

  async save(snapshot: TSnapshot): Promise<void> {
    this.snapshot = clone(snapshot);
  }

  async clear(): Promise<void> {
    this.snapshot = null;
  }
}

function clone<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}
