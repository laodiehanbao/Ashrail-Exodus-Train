import type { UiCopyConfig } from '../../shared/ui/P0Ui.types.js';

export class UiTextService {
  private readonly entries: Map<string, string>;

  constructor(copy: UiCopyConfig) {
    this.entries = new Map(copy.entries.map((entry) => [entry.key, entry.text]));
  }

  text(key: string): string {
    return this.entries.get(key) ?? key;
  }
}
