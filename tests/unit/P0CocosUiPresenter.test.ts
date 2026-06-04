import type { PlayerProgressSnapshot } from '../../src/domain/player/PlayerProgress.types.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import type { CocosUiActionBinding } from '../../src/presentation/ui/cocos/CocosUiBinding.types.js';
import { P0CocosUiPresenter } from '../../src/presentation/ui/cocos/P0CocosUiPresenter.js';
import { createP0UiState } from '../../src/presentation/viewmodels/P0UiViewModel.js';
import type { P0UiSnapshot } from '../../src/presentation/viewmodels/P0UiSnapshot.types.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';
import { createFakeP0Binding, FakeRequestSink } from './fakes/P0CocosUiBinding.fake.js';

export async function testP0CocosUiPresenter(): Promise<void> {
  await runTest('P0 Cocos presenter binds all screen state into node adapters', () => {
    const binding = createFakeP0Binding();
    const sink = new FakeRequestSink();
    const presenter = new P0CocosUiPresenter(binding, sink);
    const state = createP0UiState({
      configs: loadTestConfigs(),
      snapshot: createSnapshot(createProgress()),
      nowMs: 100000,
      latestReward: { sourceId: 'reward_coin_small', items: [{ type: 'resource', id: 'coin', amount: 80 }] },
    });

    presenter.render(state);

    assertEqual(binding.mainHud.title.text, '废轨巡航', 'main HUD title should bind to text node');
    assertEqual(binding.mainHud.frame.backgroundAssetId, 'tex_bg_stage_wasteland_rail_001', 'HUD background should bind');
    assertEqual(binding.mainHud.frame.panels.length, 3, 'HUD panel layouts should bind');
    assertEqual(binding.lootBox.cost.text, '煤币 100', 'loot box cost should bind');
    assertEqual(binding.rewardPanel.frame.visible, true, 'reward panel should be visible with reward state');
    assertEqual(binding.rewardPanel.items.items[0].label, '煤币', 'reward item label should bind');
    assertEqual(binding.trainModule.moduleCards.items[0].displayName, '锈蚀车顶炮', 'module card should bind');
    assertEqual(binding.adReward.doubleAction.enabled, true, 'ad double action should bind enabled state');
  });

  await runTest('P0 Cocos presenter emits only enabled stable ui requests', () => {
    const binding = createFakeP0Binding();
    const sink = new FakeRequestSink();
    const presenter = new P0CocosUiPresenter(binding, sink);
    const state = createP0UiState({
      configs: loadTestConfigs(),
      snapshot: createSnapshot(createProgress()),
      nowMs: 100000,
      latestReward: { sourceId: 'reward_coin_small', items: [{ type: 'resource', id: 'coin', amount: 80 }] },
    });
    state.adReward.actions.reverse();
    presenter.render(state);

    assertEqual(binding.adReward.doubleAction.label, '观看加倍', 'ad double action should bind by action id');
    assertEqual(binding.adReward.skipAction.label, '普通领取', 'ad skip action should bind by action id');
    binding.mainHud.primaryAction.press();
    binding.lootBox.openAction.press();
    binding.rewardPanel.claimAction.press();
    binding.trainModule.moduleCards.items[0].onUpgrade?.();
    binding.adReward.doubleAction.press();
    binding.adReward.skipAction.press();

    assertEqual(sink.requests.length, 6, 'enabled UI actions should emit six requests');
    assert(sink.requests.every((request) => request.actionId.startsWith('ui_request_')), 'requests must use ui_request prefix');
    assert(!JSON.stringify(sink.requests).includes('amount'), 'requests must not include reward amounts');
  });

  await runTest('P0 Cocos presenter hides missing reward panel and blocks disabled actions', () => {
    const progress = createProgress();
    progress.resources.coin = 0;
    progress.adRecords.lastShownAtMs.ad_reward_stage_clear_double = 90000;

    const binding = createFakeP0Binding();
    const sink = new FakeRequestSink();
    new P0CocosUiPresenter(binding, sink).render(createP0UiState({
      configs: loadTestConfigs(),
      snapshot: createSnapshot(progress),
      nowMs: 100000,
    }));

    binding.lootBox.openAction.press();
    binding.adReward.doubleAction.press();
    binding.adReward.skipAction.press();

    assertEqual(binding.rewardPanel.frame.visible, false, 'reward panel should hide without reward state');
    assertEqual(binding.lootBox.openAction.enabled, false, 'disabled loot box action should bind disabled');
    assertEqual(binding.adReward.doubleAction.enabled, false, 'cooldown ad action should bind disabled');
    assertEqual(sink.requests.length, 1, 'only skip should emit when open and ad double are disabled');
    assertEqual(sink.requests[0].actionId, 'ui_request_ad_reward_skip', 'skip request should remain available');
  });

  await runTest('P0 Cocos presenter invalidates stale handlers after rerender', () => {
    const configs = loadTestConfigs();
    const binding = createFakeP0Binding();
    const stackedOpenAction = new StackingActionBinding();
    (binding.lootBox as { openAction: CocosUiActionBinding }).openAction = stackedOpenAction;
    const sink = new FakeRequestSink();
    const presenter = new P0CocosUiPresenter(binding, sink);

    presenter.render(createP0UiState({
      configs,
      snapshot: createSnapshot(createProgress()),
      nowMs: 100000,
    }));
    const staleModuleUpgrade = binding.trainModule.moduleCards.items[0].onUpgrade;
    presenter.render(createP0UiState({
      configs,
      snapshot: createSnapshot(createProgress()),
      nowMs: 110000,
    }));

    stackedOpenAction.pressAll();
    assertEqual(sink.requests.length, 1, 'stacked handlers should emit only the current render request');

    const disabledProgress = createProgress();
    disabledProgress.resources.coin = 0;
    disabledProgress.inventory.moduleFragments.module_cannon_basic_001 = 0;
    presenter.render(createP0UiState({
      configs,
      snapshot: createSnapshot(disabledProgress),
      nowMs: 120000,
    }));

    stackedOpenAction.pressAll();
    staleModuleUpgrade?.();
    assertEqual(sink.requests.length, 1, 'handlers from stale renders should not emit after disabled rerender');
  });
}

class StackingActionBinding implements CocosUiActionBinding {
  private readonly handlers: Array<() => void> = [];

  setLabel(_label: string): void {}
  setEnabled(_enabled: boolean): void {}
  setDisabledReason(_reason?: string): void {}

  setOnPress(handler: (() => void) | null): void {
    if (handler) {
      this.handlers.push(handler);
    }
  }

  pressAll(): void {
    for (const handler of this.handlers) {
      handler();
    }
  }
}

function createProgress(): PlayerProgressSnapshot {
  return JSON.parse(JSON.stringify(createDefaultProgress())) as PlayerProgressSnapshot;
}

function createSnapshot(progress: PlayerProgressSnapshot): P0UiSnapshot {
  return {
    progress,
    power: 20,
  };
}
