import { fail, ok, type Result } from '../core/Result.types.js';
import type { RewardBundle } from '../domain/reward/Reward.types.js';
import type { IP0UiPresenter, P0UiPresenterUpdate } from '../presentation/presenters/P0UiPresenter.types.js';
import type { P0CombatPreviewMode } from '../presentation/viewmodels/MainHudViewModel.js';
import { createP0UiState, type P0UiState } from '../presentation/viewmodels/P0UiViewModel.js';
import { ErrorCode } from '../shared/ErrorCodes.js';
import type { UiInteractionRequest } from '../shared/ui/P0Ui.types.js';
import type { GameApp } from './GameApp.js';

const STAGE_REWARD_REVEAL_DELAY_MS = 850;
const ACCEPTED_REQUEST_AUDIO_EVENTS: Partial<Record<UiInteractionRequest['actionId'], string>> = {
  ui_request_stage_start: 'audio_stage_clear_whistle',
  ui_request_lootbox_open: 'audio_lootbox_open_mech',
  ui_request_reward_claim: 'audio_ui_confirm_steam',
  ui_request_train_module_upgrade: 'audio_train_module_upgrade',
  ui_request_ad_reward_double: 'audio_ad_reward_drop',
  ui_request_ad_reward_skip: 'audio_ui_confirm_steam',
};

interface PendingStageReward {
  stageId: string;
  nextStageId: string;
  reward: RewardBundle;
  revealAtMs: number;
}

export class P0UiRequestRouter implements IP0UiPresenter {
  private latestReward: RewardBundle | null = null;
  private pendingStageReward: PendingStageReward | null = null;
  private combatRunRevision = 0;
  private combatPreviewMode: P0CombatPreviewMode = 'ready';
  private combatDamageAmount: number | undefined;

  constructor(private readonly app: GameApp) {}

  getState(nowMs: number): P0UiState {
    return createP0UiState({
      configs: this.app.configs,
      snapshot: this.app.snapshot(),
      nowMs,
      latestReward: this.getVisibleReward(nowMs) ?? undefined,
      combatRunRevision: this.combatRunRevision,
      combatPreviewMode: this.combatPreviewMode,
      combatDamageAmount: this.getCombatDamageAmount(),
      stageStartLocked: Boolean(this.pendingStageReward),
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
      this.combatRunRevision += 1;
      this.combatPreviewMode = 'failed';
      this.combatDamageAmount = stageResult.value.combat.damage.totalEnemyHp;
      this.pendingStageReward = null;
      return this.updated(request.actionId, nowMs, ACCEPTED_REQUEST_AUDIO_EVENTS[request.actionId]);
    }

    this.combatRunRevision += 1;
    this.combatPreviewMode = 'clear';
    this.combatDamageAmount = stageResult.value.combat.damage.totalEnemyHp;
    this.pendingStageReward = {
      stageId: stageResult.value.stage.id,
      nextStageId: stageResult.value.nextStageId,
      reward: stageResult.value.reward,
      revealAtMs: nowMs + STAGE_REWARD_REVEAL_DELAY_MS,
    };
    this.latestReward = null;
    return this.updated(
      request.actionId,
      nowMs,
      ACCEPTED_REQUEST_AUDIO_EVENTS[request.actionId],
      STAGE_REWARD_REVEAL_DELAY_MS,
    );
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
    return this.updated(request.actionId, nowMs, ACCEPTED_REQUEST_AUDIO_EVENTS[request.actionId]);
  }

  private handleRewardClaim(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_reward_claim' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    if (this.pendingStageReward && this.pendingStageReward.reward.sourceId === request.payload.sourceId) {
      if (!this.isStageRewardVisible(nowMs)) {
        return this.reject('Stage reward cannot be claimed before combat presentation finishes', request);
      }
      return this.claimPendingStageReward(request.actionId, nowMs);
    }

    if (this.latestReward?.sourceId === request.payload.sourceId) {
      this.latestReward = null;
      return this.updated(request.actionId, nowMs, ACCEPTED_REQUEST_AUDIO_EVENTS[request.actionId]);
    }

    return this.reject(`No displayed reward matches ${request.payload.sourceId}`, request);
  }

  private handleTrainModuleUpgrade(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_train_module_upgrade' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    const upgraded = this.app.trainModuleSystem.upgrade(request.payload.moduleId);
    if (!upgraded.ok) return upgraded;
    return this.updated(request.actionId, nowMs, ACCEPTED_REQUEST_AUDIO_EVENTS[request.actionId]);
  }

  private async handleAdRewardDouble(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_ad_reward_double' }>,
    nowMs: number,
  ): Promise<Result<P0UiPresenterUpdate>> {
    if (!this.pendingStageReward) {
      return this.reject('No pending stage reward can be doubled', request);
    }
    if (!this.isStageClearDoublePlacement(request.payload.placementId)) {
      return this.reject(`Ad placement ${request.payload.placementId} cannot double stage rewards`, request);
    }
    if (!this.isStageRewardVisible(nowMs)) {
      return this.reject('Stage reward cannot be doubled before combat presentation finishes', request);
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
    this.latestReward = null;
    return this.updated(request.actionId, nowMs, ACCEPTED_REQUEST_AUDIO_EVENTS[request.actionId]);
  }

  private handleAdRewardSkip(
    request: Extract<UiInteractionRequest, { actionId: 'ui_request_ad_reward_skip' }>,
    nowMs: number,
  ): Result<P0UiPresenterUpdate> {
    if (!this.pendingStageReward) {
      return this.reject('No pending stage reward can be claimed without ad', request);
    }
    if (!this.isStageRewardVisible(nowMs)) {
      return this.reject('Stage reward cannot be skipped before combat presentation finishes', request);
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
    this.combatPreviewMode = 'ready';
    this.combatDamageAmount = undefined;
    return this.updated(acceptedRequest, nowMs, ACCEPTED_REQUEST_AUDIO_EVENTS[acceptedRequest]);
  }

  private updated(
    acceptedRequest: UiInteractionRequest['actionId'],
    nowMs: number,
    audioEventId?: string,
    refreshAfterMs?: number,
  ): Result<P0UiPresenterUpdate> {
    if (audioEventId) {
      this.app.audioService.playEvent(audioEventId, nowMs);
    }
    return ok({
      acceptedRequest,
      state: this.getState(nowMs),
      refreshAfterMs,
    });
  }

  private getVisibleReward(nowMs: number): RewardBundle | null {
    if (this.pendingStageReward) {
      return this.isStageRewardVisible(nowMs) ? this.pendingStageReward.reward : null;
    }
    return this.latestReward;
  }

  private isStageRewardVisible(nowMs: number): boolean {
    return Boolean(this.pendingStageReward && nowMs >= this.pendingStageReward.revealAtMs);
  }

  private getCombatDamageAmount(): number | undefined {
    return this.combatDamageAmount;
  }

  private isStageClearDoublePlacement(placementId: string): boolean {
    const placement = this.app.configs.adPlacements.find((config) => config.placementId === placementId);
    return placement?.triggerScene === 'stage_clear' && placement.rewardType === 'double_reward';
  }

  private reject(message: string, request: UiInteractionRequest): Result<P0UiPresenterUpdate> {
    return fail(ErrorCode.UiRequestRejected, message, request);
  }
}
