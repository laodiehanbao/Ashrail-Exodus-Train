import type { Result } from '../../core/Result.types.js';
import type { UiInteractionRequest } from '../../shared/ui/P0Ui.types.js';
import type { P0UiState } from '../viewmodels/P0UiViewModel.js';

export interface P0UiPresenterUpdate {
  acceptedRequest: UiInteractionRequest['actionId'];
  state: P0UiState;
  refreshAfterMs?: number;
}

export interface IP0UiPresenter {
  getState(nowMs: number): P0UiState;
  handleRequest(request: UiInteractionRequest, nowMs: number): Promise<Result<P0UiPresenterUpdate>>;
}
