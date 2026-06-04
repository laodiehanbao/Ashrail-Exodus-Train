import type { ISaveService } from './ISaveService.js';

export class DouyinSaveService<TSnapshot> implements ISaveService<TSnapshot> {
  async load(): Promise<TSnapshot | null> {
    return null;
  }

  async save(_snapshot: TSnapshot): Promise<void> {
    return;
  }

  async clear(): Promise<void> {
    return;
  }
}
