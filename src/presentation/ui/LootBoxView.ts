import type { UiInteractionRequest } from '../../shared/ui/P0Ui.types.js';
import type { LootBoxScreenState } from '../viewmodels/LootBoxViewModel.js';

export class LootBoxView {
  private state: LootBoxScreenState | null = null;
  private readonly requests: UiInteractionRequest[] = [];

  render(state: LootBoxScreenState): void {
    this.state = state;
  }

  requestOpen(): void {
    if (!this.state?.actions.some((action) => action.actionId === 'ui_request_lootbox_open' && action.enabled)) return;
    this.requests.push({
      actionId: 'ui_request_lootbox_open',
      payload: { lootBoxId: this.state.lootBoxId },
    });
  }

  getState(): LootBoxScreenState | null {
    return this.state;
  }

  getRequests(): UiInteractionRequest[] {
    return [...this.requests];
  }
}
