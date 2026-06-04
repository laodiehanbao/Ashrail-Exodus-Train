import type { UiInteractionRequest } from '../../shared/ui/P0Ui.types.js';
import type { TrainModulePanelState } from '../viewmodels/TrainModuleViewModel.js';

export class TrainModuleView {
  private state: TrainModulePanelState | null = null;
  private readonly requests: UiInteractionRequest[] = [];

  render(state: TrainModulePanelState): void {
    this.state = state;
  }

  requestUpgrade(moduleId: string): void {
    const moduleState = this.state?.modules.find((item) => item.moduleId === moduleId);
    if (!moduleState?.action.enabled) return;
    this.requests.push({
      actionId: 'ui_request_train_module_upgrade',
      payload: { moduleId },
    });
  }

  getState(): TrainModulePanelState | null {
    return this.state;
  }

  getRequests(): UiInteractionRequest[] {
    return [...this.requests];
  }
}
