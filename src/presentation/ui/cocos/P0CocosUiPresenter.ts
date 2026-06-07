import type { P0UiState } from '../../viewmodels/P0UiViewModel.js';
import type { RewardPanelState } from '../../viewmodels/RewardPanelViewModel.js';
import type { UiActionId, UiActionState, UiInteractionRequest, UiScreenLayoutConfig } from '../../../shared/ui/P0Ui.types.js';
import type {
  CocosRewardPanelBinding,
  CocosTrainModuleCardBindingState,
  CocosUiActionBinding,
  CocosUiFrameBinding,
  CocosUiRequestSink,
  P0CocosUiBinding,
} from './CocosUiBinding.types.js';

export class P0CocosUiPresenter {
  private renderRevision = 0;

  constructor(
    private readonly binding: P0CocosUiBinding,
    private readonly requestSink: CocosUiRequestSink,
  ) {}

  render(state: P0UiState): void {
    this.renderRevision += 1;
    const revision = this.renderRevision;
    this.renderMainHud(state, revision);
    this.renderLootBox(state, revision);
    this.renderRewardPanel(state.rewardPanel, revision);
    this.renderTrainModule(state, revision);
    this.renderAdReward(state, revision);
  }

  private renderMainHud(state: P0UiState, revision: number): void {
    const hud = state.mainHud;
    bindFrame(this.binding.mainHud.frame, hud.layout, true);
    this.binding.mainHud.title.setText(hud.title);
    this.binding.mainHud.status.setText(hud.statusText);
    this.binding.mainHud.metrics.setItems(hud.metrics);
    this.binding.mainHud.combatPreview.setState(hud.combatPreview);
    bindAction(this.binding.mainHud.primaryAction, findAction(hud.actions, 'ui_request_stage_start'), this.requestSink, {
      actionId: 'ui_request_stage_start',
    }, () => this.isCurrentRevision(revision));
  }

  private renderLootBox(state: P0UiState, revision: number): void {
    const lootBox = state.lootBox;
    bindFrame(this.binding.lootBox.frame, lootBox.layout, true);
    this.binding.lootBox.title.setText(lootBox.title);
    this.binding.lootBox.lootBoxName.setText(lootBox.lootBoxName);
    this.binding.lootBox.count.setText(String(lootBox.count));
    this.binding.lootBox.cost.setText(lootBox.costText);
    this.binding.lootBox.metrics.setItems(lootBox.metrics);
    bindAction(this.binding.lootBox.openAction, findAction(lootBox.actions, 'ui_request_lootbox_open'), this.requestSink, {
      actionId: 'ui_request_lootbox_open',
      payload: { lootBoxId: lootBox.lootBoxId },
    }, () => this.isCurrentRevision(revision));
  }

  private renderRewardPanel(rewardPanel: RewardPanelState | null, revision: number): void {
    const binding = this.binding.rewardPanel;
    if (!rewardPanel) {
      hideRewardPanel(binding);
      return;
    }

    bindFrame(binding.frame, rewardPanel.layout, true);
    binding.title.setText(rewardPanel.title);
    binding.items.setItems(rewardPanel.items);
    bindAction(binding.claimAction, findAction(rewardPanel.actions, 'ui_request_reward_claim'), this.requestSink, {
      actionId: 'ui_request_reward_claim',
      payload: { sourceId: rewardPanel.sourceId },
    }, () => this.isCurrentRevision(revision));
  }

  private renderTrainModule(state: P0UiState, revision: number): void {
    const trainModule = state.trainModule;
    bindFrame(this.binding.trainModule.frame, trainModule.layout, true);
    this.binding.trainModule.title.setText(trainModule.title);
    this.binding.trainModule.metrics.setItems(trainModule.metrics);
    this.binding.trainModule.moduleCards.setItems(
      trainModule.modules.map((card): CocosTrainModuleCardBindingState => ({
        ...card,
        onUpgrade: card.action.enabled
          ? () => this.emitCurrent({
              actionId: 'ui_request_train_module_upgrade',
              payload: { moduleId: card.moduleId },
            }, revision)
          : null,
      })),
    );
  }

  private renderAdReward(state: P0UiState, revision: number): void {
    const adReward = state.adReward;
    bindFrame(this.binding.adReward.frame, adReward.layout, true);
    this.binding.adReward.title.setText(adReward.title);
    this.binding.adReward.status.setText(adReward.statusText);
    this.binding.adReward.metrics.setItems(adReward.metrics);
    bindAction(this.binding.adReward.doubleAction, findAction(adReward.actions, 'ui_request_ad_reward_double'), this.requestSink, {
      actionId: 'ui_request_ad_reward_double',
      payload: { placementId: adReward.placementId },
    }, () => this.isCurrentRevision(revision));
    bindAction(this.binding.adReward.skipAction, findAction(adReward.actions, 'ui_request_ad_reward_skip'), this.requestSink, {
      actionId: 'ui_request_ad_reward_skip',
      payload: { placementId: adReward.placementId },
    }, () => this.isCurrentRevision(revision));
  }

  private emitCurrent(request: UiInteractionRequest, revision: number): void {
    if (this.isCurrentRevision(revision)) {
      this.requestSink.emit(request);
    }
  }

  private isCurrentRevision(revision: number): boolean {
    return this.renderRevision === revision;
  }
}

function bindFrame(frame: CocosUiFrameBinding, layout: UiScreenLayoutConfig | undefined, visible: boolean): void {
  frame.setVisible(visible);
  frame.setBackgroundAsset(layout?.backgroundAssetId ?? '');
  frame.setPanelLayouts(layout?.panels ?? []);
}

function bindAction(
  binding: CocosUiActionBinding,
  action: UiActionState | undefined,
  sink: CocosUiRequestSink,
  request?: UiInteractionRequest,
  shouldEmit: () => boolean = () => true,
): void {
  if (!action || !request) {
    binding.setLabel('');
    binding.setEnabled(false);
    binding.setDisabledReason(undefined);
    binding.setOnPress(null);
    return;
  }

  binding.setLabel(action.label);
  binding.setEnabled(action.enabled);
  binding.setDisabledReason(action.disabledReason);
  binding.setOnPress(action.enabled ? () => {
    if (shouldEmit()) {
      sink.emit(request);
    }
  } : null);
}

function findAction(actions: UiActionState[], actionId: UiActionId): UiActionState | undefined {
  return actions.find((action) => action.actionId === actionId);
}

function hideRewardPanel(binding: CocosRewardPanelBinding): void {
  binding.frame.setVisible(false);
  binding.frame.setBackgroundAsset('');
  binding.frame.setPanelLayouts([]);
  binding.title.setText('');
  binding.items.setItems([]);
  bindAction(binding.claimAction, undefined, { emit: () => undefined });
}
