import { P0CocosUiPresenter } from '../../src/presentation/ui/cocos/P0CocosUiPresenter.js';
import { createP0UiState } from '../../src/presentation/viewmodels/P0UiViewModel.js';
import { P0_UI_NODE_BINDING_SLOT_SPECS } from '../../src/shared/ui/P0UiNodeBinding.types.js';
import { P0_UI_SCREEN_IDS } from '../../src/shared/ui/P0Ui.types.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';
import { createFakeP0Binding, FakeRequestSink } from './fakes/P0CocosUiBinding.fake.js';

export async function testP0UiNodeBindingCoverage(): Promise<void> {
  await runTest('P0 UI node binding manifest covers every required Cocos presenter slot', () => {
    const configs = loadTestConfigs();
    for (const screenId of P0_UI_SCREEN_IDS) {
      const screen = configs.uiNodeBindings.screens.find((item) => item.screenId === screenId);
      assert(screen, `node binding manifest should include ${screenId}`);

      for (const spec of P0_UI_NODE_BINDING_SLOT_SPECS.filter((item) => item.screenId === screenId)) {
        const binding = screen.bindings.find((item) => item.slotId === spec.slotId);
        assert(binding, `node binding manifest should include ${spec.slotId}`);
        assertEqual(binding.kind, spec.kind, `${spec.slotId} should bind the expected kind`);
        if ('actionId' in spec && spec.actionId) {
          assertEqual(binding.actionId, spec.actionId, `${spec.slotId} should bind the expected action`);
        }
      }
    }
  });

  await runTest('P0 UI node binding manifest can drive a no-cc presenter smoke render', () => {
    const configs = loadTestConfigs();
    const binding = createFakeP0Binding();
    const sink = new FakeRequestSink();
    new P0CocosUiPresenter(binding, sink).render(createP0UiState({
      configs,
      snapshot: { progress: createDefaultProgress(), power: 20 },
      nowMs: 100000,
      latestReward: { sourceId: 'reward_coin_small', items: [{ type: 'resource', id: 'coin', amount: 80 }] },
    }));

    assertEqual(
      configs.uiNodeBindings.screens.length,
      P0_UI_SCREEN_IDS.length,
      'node binding manifest should include the same number of P0 screens as the UI state',
    );
    assertEqual(binding.mainHud.title.text, '废轨巡航', 'fake no-cc binding should receive presenter text');
    assertEqual(binding.rewardPanel.items.items.length, 1, 'fake no-cc binding should receive reward item list');
  });
}
