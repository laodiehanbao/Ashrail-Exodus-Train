import type { UiInteractionRequest } from '../../shared/ui/P0Ui.types.js';
import type { RewardPanelState } from '../viewmodels/RewardPanelViewModel.js';

export class RewardPanelView {
  private state: RewardPanelState | null = null;
  private readonly requests: UiInteractionRequest[] = [];

  render(state: RewardPanelState): void {
    this.state = state;
  }

  requestClaim(): void {
    if (!this.state?.actions.some((action) => action.actionId === 'ui_request_reward_claim' && action.enabled)) return;
    this.requests.push({
      actionId: 'ui_request_reward_claim',
      payload: { sourceId: this.state.sourceId },
    });
  }

  getState(): RewardPanelState | null {
    return this.state;
  }

  getRequests(): UiInteractionRequest[] {
    return [...this.requests];
  }
}
