import type { Result } from '../../src/core/Result.types.js';
import { fail, ok } from '../../src/core/Result.types.js';
import type { PlayerProgressSnapshot } from '../../src/domain/player/PlayerProgress.types.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import type { IP0UiPresenter, P0UiPresenterUpdate } from '../../src/presentation/presenters/P0UiPresenter.types.js';
import { P0CocosUiRuntime } from '../../src/presentation/ui/cocos/P0CocosUiRuntime.js';
import { createP0UiState, type P0UiState } from '../../src/presentation/viewmodels/P0UiViewModel.js';
import type { P0UiSnapshot } from '../../src/presentation/viewmodels/P0UiSnapshot.types.js';
import { ErrorCode } from '../../src/shared/ErrorCodes.js';
import type { UiInteractionRequest } from '../../src/shared/ui/P0Ui.types.js';
import { createFakeP0Binding } from './fakes/P0CocosUiBinding.fake.js';
import { loadTestConfigs } from './loadTestConfigs.js';
import { assert, assertEqual, runTest } from './testHarness.js';

export async function testP0CocosUiRuntime(): Promise<void> {
  await runTest('P0 Cocos runtime mounts and refreshes presenter state through no-cc bindings', () => {
    const binding = createFakeP0Binding();
    const presenter = new FakeP0UiPresenter(createState(20));
    const clock = new MutableClock(100000);
    const runtime = new P0CocosUiRuntime({ presenter, binding, clock });

    runtime.mount();
    assertEqual(presenter.getStateCalls[0], 100000, 'mount should read state at injected clock time');
    assertEqual(binding.mainHud.metrics.items[0].value, '20', 'mount should render current state');

    presenter.setState(createState(35));
    clock.value = 110000;
    runtime.refresh();

    assertEqual(presenter.getStateCalls[1], 110000, 'refresh should read state at injected clock time');
    assertEqual(binding.mainHud.metrics.items[0].value, '35', 'refresh should rerender current state');
  });

  await runTest('P0 Cocos runtime forwards UI requests and rerenders accepted updates', async () => {
    const binding = createFakeP0Binding();
    const presenter = new FakeP0UiPresenter(createState(20));
    const clock = new MutableClock(200000);
    const runtime = new P0CocosUiRuntime({ presenter, binding, clock });
    presenter.enqueue(ok({ acceptedRequest: 'ui_request_stage_start', state: createState(45) }));

    runtime.mount();
    binding.mainHud.primaryAction.press();
    const result = await runtime.flushPending();

    assert(result?.ok, 'accepted request should be observable through flushPending');
    assertEqual(presenter.requests[0].request.actionId, 'ui_request_stage_start', 'runtime should forward strict request id');
    assertEqual(presenter.requests[0].nowMs, 200000, 'runtime should pass injected clock time to presenter');
    assertEqual(presenter.getStateCalls.length, 1, 'accepted update should not pull state a second time');
    assertEqual(binding.mainHud.metrics.items[0].value, '45', 'accepted update state should render');
    assert(!JSON.stringify(presenter.requests).includes('amount'), 'runtime requests should not contain reward amounts');
  });

  await runTest('P0 Cocos runtime schedules delayed presenter refreshes from accepted updates', async () => {
    const binding = createFakeP0Binding();
    const presenter = new FakeP0UiPresenter(createState(20));
    const clock = new MutableClock(250000);
    const scheduler = new FakeScheduler();
    const runtime = new P0CocosUiRuntime({ presenter, binding, clock, scheduler });
    presenter.enqueue(ok({ acceptedRequest: 'ui_request_stage_start', state: createState(45), refreshAfterMs: 500 }));

    runtime.mount();
    binding.mainHud.primaryAction.press();
    const result = await runtime.flushPending();

    assert(result?.ok, 'accepted request should complete before delayed refresh');
    assertEqual(scheduler.scheduled[0]?.delaySeconds, 0.5, 'runtime should convert refresh delay to seconds');

    presenter.setState(createState(60));
    clock.value = 250500;
    scheduler.runFirst();

    assertEqual(
      presenter.getStateCalls[presenter.getStateCalls.length - 1],
      250500,
      'scheduled refresh should pull state at current clock time',
    );
    assertEqual(binding.mainHud.metrics.items[0].value, '60', 'scheduled refresh should rerender current presenter state');
  });

  await runTest('P0 Cocos runtime keeps rendered state unchanged when a request is rejected', async () => {
    const binding = createFakeP0Binding();
    const presenter = new FakeP0UiPresenter(createState(20));
    const runtime = new P0CocosUiRuntime({ presenter, binding, clock: new MutableClock(300000) });
    presenter.enqueue(fail(ErrorCode.UiRequestRejected, 'fake rejected request'));

    runtime.mount();
    binding.mainHud.primaryAction.press();
    const result = await runtime.flushPending();

    assert(result && !result.ok, 'rejected request should be returned from flushPending');
    assert(runtime.getLatestResult() && !runtime.getLatestResult()?.ok, 'latest result should expose rejection');
    assertEqual(binding.mainHud.metrics.items[0].value, '20', 'rejected request should not rerender stale fallback state');
  });

  await runTest('P0 Cocos runtime serializes fire-and-forget Cocos requests', async () => {
    const binding = createFakeP0Binding();
    const presenter = new FakeP0UiPresenter(createState(20));
    const runtime = new P0CocosUiRuntime({ presenter, binding, clock: new MutableClock(400000) });
    const first = createDeferred<Result<P0UiPresenterUpdate>>();
    const second = createDeferred<Result<P0UiPresenterUpdate>>();
    presenter.enqueue(first.promise);
    presenter.enqueue(second.promise);

    runtime.mount();
    binding.mainHud.primaryAction.press();
    binding.lootBox.openAction.press();
    await flushMicrotasks();
    assertEqual(presenter.requests.length, 1, 'second request should wait for first request to settle');

    first.resolve(ok({ acceptedRequest: 'ui_request_stage_start', state: createState(55) }));
    await waitForRequestCount(presenter, 2);
    assertEqual(presenter.requests.length, 2, 'second request should run after first settles');
    assertEqual(presenter.requests[1].request.actionId, 'ui_request_lootbox_open', 'queued request order should be stable');

    second.resolve(ok({ acceptedRequest: 'ui_request_lootbox_open', state: createState(70) }));
    const result = await runtime.flushPending();

    assert(result?.ok, 'last queued request should resolve through flushPending');
    assertEqual(binding.mainHud.metrics.items[0].value, '70', 'last accepted queued state should render');
  });

  await runTest('P0 Cocos runtime reports render failures without breaking the request queue', async () => {
    const binding = createFakeP0Binding();
    const presenter = new FakeP0UiPresenter(createState(20));
    const runtime = new P0CocosUiRuntime({ presenter, binding, clock: new MutableClock(500000) });
    presenter.enqueue(ok({ acceptedRequest: 'ui_request_stage_start', state: createStateWithThrowingTitle(80) }));
    presenter.enqueue(ok({ acceptedRequest: 'ui_request_lootbox_open', state: createState(90) }));

    runtime.mount();
    const failed = await runtime.request({ actionId: 'ui_request_stage_start' });
    const recovered = await runtime.request({
      actionId: 'ui_request_lootbox_open',
      payload: { lootBoxId: 'lootbox_supply_common' },
    });

    assert(!failed.ok, 'render exception should become an observable runtime failure');
    assert(recovered.ok, 'request queue should recover after render exception');
    assertEqual(binding.mainHud.metrics.items[0].value, '90', 'later accepted request should still render');
  });
}

class MutableClock {
  constructor(public value: number) {}

  nowMs(): number {
    return this.value;
  }
}

class FakeScheduler {
  readonly scheduled: Array<{ callback: () => void; delaySeconds: number }> = [];

  scheduleOnce(callback: () => void, delaySeconds: number): void {
    this.scheduled.push({ callback, delaySeconds });
  }

  runFirst(): void {
    const next = this.scheduled.shift();
    next?.callback();
  }
}

class FakeP0UiPresenter implements IP0UiPresenter {
  readonly getStateCalls: number[] = [];
  readonly requests: Array<{ request: UiInteractionRequest; nowMs: number }> = [];
  private readonly responses: Array<Result<P0UiPresenterUpdate> | Promise<Result<P0UiPresenterUpdate>>> = [];

  constructor(private state: P0UiState) {}

  setState(state: P0UiState): void {
    this.state = state;
  }

  enqueue(response: Result<P0UiPresenterUpdate> | Promise<Result<P0UiPresenterUpdate>>): void {
    this.responses.push(response);
  }

  getState(nowMs: number): P0UiState {
    this.getStateCalls.push(nowMs);
    return this.state;
  }

  async handleRequest(request: UiInteractionRequest, nowMs: number): Promise<Result<P0UiPresenterUpdate>> {
    this.requests.push({ request, nowMs });
    const result = await (this.responses.shift() ?? ok({ acceptedRequest: request.actionId, state: this.state }));
    if (result.ok) {
      this.state = result.value.state;
    }
    return result;
  }
}

function createState(power: number): P0UiState {
  const progress = createProgress();
  return createP0UiState({
    configs: loadTestConfigs(),
    snapshot: createSnapshot(progress, power),
    nowMs: 100000,
  });
}

function createStateWithThrowingTitle(power: number): P0UiState {
  const state = createState(power);
  Object.defineProperty(state.mainHud, 'title', {
    get() {
      throw new Error('fake title render failure');
    },
  });
  return state;
}

function createProgress(): PlayerProgressSnapshot {
  return JSON.parse(JSON.stringify(createDefaultProgress())) as PlayerProgressSnapshot;
}

function createSnapshot(progress: PlayerProgressSnapshot, power: number): P0UiSnapshot {
  return {
    progress,
    power,
  };
}

function createDeferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolveValue: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolve) => {
    resolveValue = resolve;
  });
  return { promise, resolve: resolveValue };
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

async function waitForRequestCount(presenter: FakeP0UiPresenter, count: number): Promise<void> {
  for (let attempt = 0; attempt < 10 && presenter.requests.length < count; attempt += 1) {
    await flushMicrotasks();
  }
}
