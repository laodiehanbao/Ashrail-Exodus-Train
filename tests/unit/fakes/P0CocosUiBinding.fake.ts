import type {
  CocosRewardItemListBinding,
  CocosTrainModuleCardBindingState,
  CocosTrainModuleCardListBinding,
  CocosUiActionBinding,
  CocosUiFrameBinding,
  CocosUiMetricListBinding,
  CocosUiRequestSink,
  CocosUiTextBinding,
  P0CocosUiBinding,
} from '../../../src/presentation/ui/cocos/CocosUiBinding.types.js';
import type { RewardItemViewState } from '../../../src/presentation/viewmodels/RewardPanelViewModel.js';
import type { UiMetricState, UiPanelLayoutConfig } from '../../../src/shared/ui/P0Ui.types.js';
import type { UiInteractionRequest } from '../../../src/shared/ui/P0Ui.types.js';

export class FakeRequestSink implements CocosUiRequestSink {
  readonly requests: UiInteractionRequest[] = [];

  emit(request: UiInteractionRequest): void {
    this.requests.push(request);
  }
}

class FakeFrameBinding implements CocosUiFrameBinding {
  visible = false;
  backgroundAssetId = '';
  panels: UiPanelLayoutConfig[] = [];

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  setBackgroundAsset(assetId: string): void {
    this.backgroundAssetId = assetId;
  }

  setPanelLayouts(panels: UiPanelLayoutConfig[]): void {
    this.panels = panels;
  }
}

class FakeTextBinding implements CocosUiTextBinding {
  text = '';

  setText(text: string): void {
    this.text = text;
  }
}

class FakeMetricListBinding implements CocosUiMetricListBinding {
  items: UiMetricState[] = [];

  setItems(items: UiMetricState[]): void {
    this.items = items;
  }
}

class FakeActionBinding implements CocosUiActionBinding {
  label = '';
  enabled = false;
  disabledReason?: string;
  private handler: (() => void) | null = null;

  setLabel(label: string): void {
    this.label = label;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setDisabledReason(reason?: string): void {
    this.disabledReason = reason;
  }

  setOnPress(handler: (() => void) | null): void {
    this.handler = handler;
  }

  press(): void {
    this.handler?.();
  }
}

class FakeRewardItemListBinding implements CocosRewardItemListBinding {
  items: RewardItemViewState[] = [];

  setItems(items: RewardItemViewState[]): void {
    this.items = items;
  }
}

class FakeTrainModuleCardListBinding implements CocosTrainModuleCardListBinding {
  items: CocosTrainModuleCardBindingState[] = [];

  setItems(items: CocosTrainModuleCardBindingState[]): void {
    this.items = items;
  }
}

export function createFakeP0Binding() {
  return {
    mainHud: {
      frame: new FakeFrameBinding(),
      title: new FakeTextBinding(),
      status: new FakeTextBinding(),
      metrics: new FakeMetricListBinding(),
      primaryAction: new FakeActionBinding(),
    },
    lootBox: {
      frame: new FakeFrameBinding(),
      title: new FakeTextBinding(),
      lootBoxName: new FakeTextBinding(),
      count: new FakeTextBinding(),
      cost: new FakeTextBinding(),
      metrics: new FakeMetricListBinding(),
      openAction: new FakeActionBinding(),
    },
    rewardPanel: {
      frame: new FakeFrameBinding(),
      title: new FakeTextBinding(),
      items: new FakeRewardItemListBinding(),
      claimAction: new FakeActionBinding(),
    },
    trainModule: {
      frame: new FakeFrameBinding(),
      title: new FakeTextBinding(),
      metrics: new FakeMetricListBinding(),
      moduleCards: new FakeTrainModuleCardListBinding(),
    },
    adReward: {
      frame: new FakeFrameBinding(),
      title: new FakeTextBinding(),
      status: new FakeTextBinding(),
      metrics: new FakeMetricListBinding(),
      doubleAction: new FakeActionBinding(),
      skipAction: new FakeActionBinding(),
    },
  } satisfies P0CocosUiBinding;
}
