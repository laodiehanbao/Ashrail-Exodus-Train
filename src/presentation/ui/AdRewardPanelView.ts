import type { UiInteractionRequest } from '../../shared/ui/P0Ui.types.js';
import type { AdRewardPanelState } from '../viewmodels/AdRewardViewModel.js';

export class AdRewardPanelView {
  private state: AdRewardPanelState | null = null;
  private readonly requests: UiInteractionRequest[] = [];

  render(state: AdRewardPanelState): void {
    this.state = state;
  }

  requestDouble(): void {
    const state = this.state;
    if (!state || !this.isActionEnabled('ui_request_ad_reward_double')) return;
    this.requests.push({
      actionId: 'ui_request_ad_reward_double',
      payload: { placementId: state.placementId },
    });
  }

  requestSkip(): void {
    const state = this.state;
    if (!state || !this.isActionEnabled('ui_request_ad_reward_skip')) return;
    this.requests.push({
      actionId: 'ui_request_ad_reward_skip',
      payload: { placementId: state.placementId },
    });
  }

  getState(): AdRewardPanelState | null {
    return this.state;
  }

  getRequests(): UiInteractionRequest[] {
    return [...this.requests];
  }

  private isActionEnabled(actionId: UiInteractionRequest['actionId']): boolean {
    return this.state?.actions.some((action) => action.actionId === actionId && action.enabled) ?? false;
  }
}
