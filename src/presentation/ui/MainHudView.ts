import type { UiInteractionRequest } from '../../shared/ui/P0Ui.types.js';
import type { MainHudState } from '../viewmodels/MainHudViewModel.js';

export class MainHudView {
  private state: MainHudState | null = null;
  private readonly requests: UiInteractionRequest[] = [];

  render(state: MainHudState): void {
    this.state = state;
  }

  requestStageStart(): void {
    if (!this.state?.actions.some((action) => action.actionId === 'ui_request_stage_start' && action.enabled)) return;
    this.requests.push({ actionId: 'ui_request_stage_start' });
  }

  getState(): MainHudState | null {
    return this.state;
  }

  getRequests(): UiInteractionRequest[] {
    return [...this.requests];
  }
}
