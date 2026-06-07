import { fail, type Result } from '../../../core/Result.types.js';
import { ErrorCode } from '../../../shared/ErrorCodes.js';
import type { UiInteractionRequest } from '../../../shared/ui/P0Ui.types.js';
import type { IP0UiPresenter, P0UiPresenterUpdate } from '../../presenters/P0UiPresenter.types.js';
import type { CocosUiRequestSink, P0CocosUiBinding } from './CocosUiBinding.types.js';
import { P0CocosUiPresenter } from './P0CocosUiPresenter.js';

export interface P0CocosUiRuntimeClock {
  nowMs(): number;
}

export interface P0CocosUiRuntimeScheduler {
  scheduleOnce(callback: () => void, delaySeconds: number): void;
}

export interface P0CocosUiRuntimeOptions {
  presenter: IP0UiPresenter;
  binding: P0CocosUiBinding;
  clock: P0CocosUiRuntimeClock;
  scheduler?: P0CocosUiRuntimeScheduler;
}

export class P0CocosUiRuntime implements CocosUiRequestSink {
  private readonly presenter: IP0UiPresenter;
  private readonly clock: P0CocosUiRuntimeClock;
  private readonly scheduler?: P0CocosUiRuntimeScheduler;
  private readonly cocosPresenter: P0CocosUiPresenter;
  private pending: Promise<Result<P0UiPresenterUpdate> | null> = Promise.resolve(null);
  private latestResult: Result<P0UiPresenterUpdate> | null = null;

  constructor(options: P0CocosUiRuntimeOptions) {
    this.presenter = options.presenter;
    this.clock = options.clock;
    this.scheduler = options.scheduler;
    this.cocosPresenter = new P0CocosUiPresenter(options.binding, this);
  }

  mount(): void {
    this.renderCurrentState();
  }

  refresh(): void {
    this.renderCurrentState();
  }

  emit(request: UiInteractionRequest): void {
    void this.request(request);
  }

  request(request: UiInteractionRequest): Promise<Result<P0UiPresenterUpdate>> {
    const next = this.pending.then(
      () => this.handleRequest(request),
      () => this.handleRequest(request),
    );
    this.pending = next;
    return next;
  }

  flushPending(): Promise<Result<P0UiPresenterUpdate> | null> {
    return this.pending;
  }

  getLatestResult(): Result<P0UiPresenterUpdate> | null {
    return this.latestResult;
  }

  private renderCurrentState(): void {
    this.cocosPresenter.render(this.presenter.getState(this.clock.nowMs()));
  }

  private async handleRequest(request: UiInteractionRequest): Promise<Result<P0UiPresenterUpdate>> {
    const result = await this.safeHandleRequest(request);
    if (result.ok) {
      const renderResult = this.renderUpdateState(result);
      this.latestResult = renderResult;
      return renderResult;
    }
    this.latestResult = result;
    return result;
  }

  private async safeHandleRequest(request: UiInteractionRequest): Promise<Result<P0UiPresenterUpdate>> {
    try {
      return await this.presenter.handleRequest(request, this.clock.nowMs());
    } catch (error) {
      return fail(ErrorCode.UiRequestRejected, 'P0 UI request handler failed', {
        actionId: request.actionId,
        error,
      });
    }
  }

  private renderUpdateState(result: Result<P0UiPresenterUpdate>): Result<P0UiPresenterUpdate> {
    if (!result.ok) return result;
    try {
      this.cocosPresenter.render(result.value.state);
      this.scheduleRefresh(result.value.refreshAfterMs);
      return result;
    } catch (error) {
      return fail(ErrorCode.UiRequestRejected, 'P0 UI render failed after accepted request', {
        acceptedRequest: result.value.acceptedRequest,
        error,
      });
    }
  }

  private scheduleRefresh(refreshAfterMs: number | undefined): void {
    if (!refreshAfterMs || refreshAfterMs <= 0 || !this.scheduler) return;
    this.scheduler.scheduleOnce(() => this.renderCurrentState(), refreshAfterMs / 1000);
  }
}
