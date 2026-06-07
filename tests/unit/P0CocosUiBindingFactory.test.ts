import type {
  CocosCombatPreviewBinding,
  CocosRewardItemListBinding,
  CocosTrainModuleCardBindingState,
  CocosTrainModuleCardListBinding,
  CocosUiActionBinding,
  CocosUiFrameBinding,
  CocosUiMetricListBinding,
  CocosUiTextBinding,
} from '../../src/presentation/ui/cocos/CocosUiBinding.types.js';
import {
  createP0CocosUiBindingFromManifest,
  type CocosUiBindingHost,
} from '../../src/presentation/ui/cocos/P0CocosUiBindingFactory.js';
import { P0CocosUiPresenter } from '../../src/presentation/ui/cocos/P0CocosUiPresenter.js';
import { createP0UiState } from '../../src/presentation/viewmodels/P0UiViewModel.js';
import type { MainHudCombatPreviewState } from '../../src/presentation/viewmodels/MainHudViewModel.js';
import type { RewardItemViewState } from '../../src/presentation/viewmodels/RewardPanelViewModel.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import { fail, ok, type Result } from '../../src/core/Result.types.js';
import { ErrorCode } from '../../src/shared/ErrorCodes.js';
import type { UiNodeBindingConfig, UiNodeBindingEntryConfig } from '../../src/shared/ui/P0UiNodeBinding.types.js';
import type { UiMetricState, UiPanelLayoutConfig } from '../../src/shared/ui/P0Ui.types.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';
import { FakeRequestSink } from './fakes/P0CocosUiBinding.fake.js';

export async function testP0CocosUiBindingFactory(): Promise<void> {
  await runTest('P0 Cocos binding factory maps manifest slots through a no-cc host', () => {
    const host = new InspectingHost();
    const configs = loadTestConfigs();
    const binding = createP0CocosUiBindingFromManifest(configs.uiNodeBindings, host);
    assert(binding.ok, 'factory should create a binding from the valid manifest');

    assertEqual(host.created.length, 27, 'factory should create one adapter per required slot');
    assertEqual(host.created[0], 'frame:mainHud.frame:Canvas/P0/MainHud/Frame', 'factory should pass slot metadata');
    assertEqual(host.created.includes('combatPreview:mainHud.combatPreview:Canvas/P0/MainHud/CombatPreview'), true, 'factory should bind combat preview slot');
    assertEqual(host.created.includes('action:adReward.skipAction:Canvas/P0/AdReward/ModalFrame/SkipButton'), true, 'factory should bind skip action slot');

    const sink = new FakeRequestSink();
    new P0CocosUiPresenter(binding.value, sink).render(createP0UiState({
      configs,
      snapshot: { progress: createDefaultProgress(), power: 20 },
      nowMs: 100000,
      latestReward: { sourceId: 'reward_coin_small', items: [{ type: 'resource', id: 'coin', amount: 80 }] },
    }));

    host.actions.get('adReward.skipAction')?.press();
    assertEqual(sink.requests[0].actionId, 'ui_request_ad_reward_skip', 'factory binding should wire presenter requests');
    assert(!JSON.stringify(sink.requests).includes('amount'), 'factory binding requests should not include reward amounts');
    assertEqual(host.texts.get('mainHud.title')?.text, '废轨巡航', 'factory binding should receive presenter text');
    assertEqual(host.rewardLists.get('rewardPanel.items')?.items.length, 1, 'factory binding should receive reward list items');
  });

  await runTest('P0 Cocos binding factory rejects incomplete or mismatched manifests', () => {
    const configs = loadTestConfigs();
    const missingSlot = clone(configs.uiNodeBindings);
    missingSlot.screens[4].bindings = missingSlot.screens[4].bindings.filter(
      (binding) => binding.slotId !== 'adReward.skipAction',
    );
    assert(!createP0CocosUiBindingFromManifest(missingSlot, new InspectingHost()).ok, 'missing slot should fail binding creation');

    const mismatchedKind = clone(configs.uiNodeBindings);
    mismatchedKind.screens[0].bindings[0].kind = 'text';
    assert(!createP0CocosUiBindingFromManifest(mismatchedKind, new InspectingHost()).ok, 'mismatched slot kind should fail binding creation');

    const mismatchedAction = clone(configs.uiNodeBindings);
    const skipAction = mismatchedAction.screens[4].bindings.find((binding) => binding.slotId === 'adReward.skipAction');
    assert(skipAction, 'test manifest should contain ad reward skip action');
    skipAction.actionId = 'ui_request_ad_reward_double';
    assert(!createP0CocosUiBindingFromManifest(mismatchedAction, new InspectingHost()).ok, 'mismatched slot action should fail binding creation');

    const missingNode = createP0CocosUiBindingFromManifest(configs.uiNodeBindings, new InspectingHost('mainHud.title'));
    assert(!missingNode.ok, 'host missing node should fail binding creation');
    if (!missingNode.ok) {
      assert(missingNode.error.message.includes('mainHud.title'), 'missing node error should include slot id');
    }
  });
}

class InspectingHost implements CocosUiBindingHost {
  readonly created: string[] = [];
  readonly texts = new Map<string, TextAdapter>();
  readonly actions = new Map<string, ActionAdapter>();
  readonly rewardLists = new Map<string, RewardListAdapter>();

  constructor(private readonly missingSlotId?: string) {}

  createFrameBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiFrameBinding> {
    this.record('frame', binding);
    return this.maybeFail(binding) ?? ok(new FrameAdapter());
  }

  createTextBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiTextBinding> {
    this.record('text', binding);
    const failure = this.maybeFail(binding);
    if (failure) return failure;
    const adapter = new TextAdapter();
    this.texts.set(binding.slotId, adapter);
    return ok(adapter);
  }

  createMetricListBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiMetricListBinding> {
    this.record('metricList', binding);
    return this.maybeFail(binding) ?? ok(new MetricListAdapter());
  }

  createCombatPreviewBinding(binding: UiNodeBindingEntryConfig): Result<CocosCombatPreviewBinding> {
    this.record('combatPreview', binding);
    return this.maybeFail(binding) ?? ok(new CombatPreviewAdapter());
  }

  createActionBinding(binding: UiNodeBindingEntryConfig): Result<CocosUiActionBinding> {
    this.record('action', binding);
    const failure = this.maybeFail(binding);
    if (failure) return failure;
    const adapter = new ActionAdapter();
    this.actions.set(binding.slotId, adapter);
    return ok(adapter);
  }

  createRewardItemListBinding(binding: UiNodeBindingEntryConfig): Result<CocosRewardItemListBinding> {
    this.record('rewardItemList', binding);
    const failure = this.maybeFail(binding);
    if (failure) return failure;
    const adapter = new RewardListAdapter();
    this.rewardLists.set(binding.slotId, adapter);
    return ok(adapter);
  }

  createTrainModuleCardListBinding(binding: UiNodeBindingEntryConfig): Result<CocosTrainModuleCardListBinding> {
    this.record('moduleCardList', binding);
    return this.maybeFail(binding) ?? ok(new ModuleCardListAdapter());
  }

  private record(kind: string, binding: UiNodeBindingEntryConfig): void {
    this.created.push(`${kind}:${binding.slotId}:${binding.nodePath}`);
  }

  private maybeFail(binding: UiNodeBindingEntryConfig): Result<never> | null {
    if (binding.slotId !== this.missingSlotId) return null;
    return fail(ErrorCode.ConfigMissingReference, `Missing fake node for ${binding.slotId}`, binding);
  }
}

class FrameAdapter implements CocosUiFrameBinding {
  setVisible(_visible: boolean): void {}
  setBackgroundAsset(_assetId: string): void {}
  setPanelLayouts(_panels: UiPanelLayoutConfig[]): void {}
}

class TextAdapter implements CocosUiTextBinding {
  text = '';

  setText(text: string): void {
    this.text = text;
  }
}

class MetricListAdapter implements CocosUiMetricListBinding {
  setItems(_items: UiMetricState[]): void {}
}

class CombatPreviewAdapter implements CocosCombatPreviewBinding {
  setState(_state: MainHudCombatPreviewState): void {}
}

class ActionAdapter implements CocosUiActionBinding {
  private handler: (() => void) | null = null;

  setLabel(_label: string): void {}
  setEnabled(_enabled: boolean): void {}
  setDisabledReason(_reason?: string): void {}

  setOnPress(handler: (() => void) | null): void {
    this.handler = handler;
  }

  press(): void {
    this.handler?.();
  }
}

class RewardListAdapter implements CocosRewardItemListBinding {
  items: RewardItemViewState[] = [];

  setItems(items: RewardItemViewState[]): void {
    this.items = items;
  }
}

class ModuleCardListAdapter implements CocosTrainModuleCardListBinding {
  setItems(_items: CocosTrainModuleCardBindingState[]): void {}
}

function clone<T extends UiNodeBindingConfig>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
