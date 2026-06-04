import { fail, ok, type Result } from '../core/Result.types.js';
import type { RewardBundle } from '../domain/reward/Reward.types.js';
import type { IP0UiPresenter, P0UiPresenterUpdate } from '../presentation/presenters/P0UiPresenter.types.js';
import { createP0UiState, type P0UiState } from '../presentation/viewmodels/P0UiViewModel.js';
import { ErrorCode } from '../shared/ErrorCodes.js';
import type { UiInteractionRequest } from '../shared/ui/P0Ui.types.js';
import type { GameApp } from './GameApp.js';

const STAGE_CLEAR_DOUBLE_AD_PLACEMENT_ID = 'ad_reward_stage_clear_double';

interface PendingStageReward {
  stageId: string;
  nextStageId: string;
  reward: RewardBundle;
}

export class P0UiRequestRouter implements IP0UiPresenter {
  private latestReward: RewardBundle | null = null;
  private pendingStageReward: PendingStageReward | null = null;

  constructor(private readonly app: GameApp) {}

  getState(nowMs: number): P0UiState {
    return createP0UiState({
      configs: this.app.configs,
      snapshot: this.app.snapshot(),
      nowMs,
      latestReward: this.latestReward ?? undefined,
    });
  }

  async handleRequest(request: UiInteractionRequest, nowMs: number): Promise<Result<P0UiPresenterUpdate>> {
    if (request.actionId === 'ui_request_stage_start') {
      return this.handleStageStart(request, nowMs);
    }
    if (request.actionId === 'ui_request_lootbox_open') {
      return this.handleLootBoxOpen(request, nowMs);
    }
    if (request.actionId === 'ui_request_reward_claim') {
      return this.handleRewardClaim(request, nowMs);
    }
    if (request.actionId === 'ui_request_train_module_upgrade') {
      return this.handleTrainModuleUpgrade(request, nowMs);
    }
    if (request.actionId === 'ui_request_ad_reward_double') {
      return this.handleAdRewardDouble(request, nowMs);
    }
    return this.handleAdRewardSkip(request, nowMs);
  }

  private handleStageStart(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_stage_start' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    if (this.pendingStageReward) {
      return this.reject('Cannot start a stage while a stage reward is pending', request);
    }

    const snapshot = this.app.snapshot();
    const stageResult = this.app.stageProgressService.runStage(
      snapshot.progress.currentStageId,
      this.app.createTrainCombatModel(),
    );
    if (!stageResult.ok) return stageResult;

    if (!stageResult.value.reward) {
      this.latestReward = null;
      return this.updated(request.actionId, nowMs);
    }

    this.pendingStageReward = {
      stageId: stageResult.value.stage.id,
      nextStageId: stageResult.value.nextStageId,
      reward: stageResult.value.reward,
    };
    this.latestReward = stageResult.value.reward;
    return this.updated(request.actionId, nowMs);
  }

  private handleLootBoxOpen(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_lootbox_open' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    if (this.pendingStageReward) {
      return this.reject('Cannot open a loot box while a stage reward is pending', request);
    }

    const opened = this.app.lootBoxSystem.open({
      lootBoxId: request.payload.lootBoxId,
      settlementId: `${request.payload.lootBoxId}_${nowMs}`,
      nowMs,
    });
    if (!opened.ok) return opened;

    this.latestReward = opened.value.granted.reward;
    return this.updated(request.actionId, nowMs);
  }

  private handleRewardClaim(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_reward_claim' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    if (this.pendingStageReward && this.latestReward?.sourceId === request.payload.sourceId) {
      return this.claimPendingStageReward(request.actionId, nowMs);
    }

    if (this.latestReward?.sourceId === request.payload.sourceId) {
      this.latestReward = null;
      return this.updated(request.actionId, nowMs);
    }

    return this.reject(`No displayed reward matches ${request.payload.sourceId}`, request);
  }

  private handleTrainModuleUpgrade(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_train_module_upgrade' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    const upgraded = this.app.trainModuleSystem.upgrade(request.payload.moduleId);
    if (!upgraded.ok) return upgraded;
    return this.updated(request.actionId, nowMs);
  }

  private async handleAdRewardDouble(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_ad_reward_double' }>,
    nowMs: number,
  ): Promise<Result<P0UiPresenterUpdate>> {
    if (!this.pendingStageReward) {
      return this.reject('No pending stage reward can be doubled', request);
    }
    if (request.payload.placementId !== STAGE_CLEAR_DOUBLE_AD_PLACEMENT_ID) {
      return this.reject(`Ad placement ${request.payload.placementId} cannot double stage rewards`, request);
    }

    const doubled = await this.app.adRewardService.applyOptionalMultiplier(
      request.payload.placementId,
      this.pendingStageReward.reward,
      nowMs,
    );
    if (!doubled.ok) return doubled;

    this.pendingStageReward = {
      ...this.pendingStageReward,
      reward: doubled.value.reward,
    };
    this.latestReward = doubled.value.reward;
    return this.updated(request.actionId, nowMs);
  }

  private handleAdRewardSkip(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_ad_reward_skip' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    if (!this.pendingStageReward) {
      return this.reject('No pending stage reward can be claimed without ad', request);
    }
    return this.claimPendingStageReward(request.actionId, nowMs);
  }

  private claimPendingStageReward(
    acceptedRequest: UiInteractionRequest['actionId'],
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    const pending = this.pendingStageReward;
    if (!pending) {
      return fail(ErrorCode.UiRequestRejected, 'No pending stage reward to claim');
    }

    const granted = this.app.stageProgressService.grantStageReward(
      pending.stageId,
      pending.reward,
      `stage_clear_${pending.stageId}_${nowMs}`,
      nowMs,
    );
    if (!granted.ok) return granted;

    this.app.setCurrentStageId(pending.nextStageId);
    this.pendingStageReward = null;
    this.latestReward = null;
    return this.updated(acceptedRequest, nowMs);
  }

  private updated(acceptedRequest: UiInteractionRequest['actionId'], nowMs: number): Result<P0UiPresenterUpdate> {
    return ok({
      acceptedRequest,
      state: this.getState(nowMs),
    });
  }

  private reject(message: string, request: UiInteractionRequest): Result<P0UiPresenterUpdate> {
    return fail(ErrorCode.UiRequestRejected, message, request);
  }
}
